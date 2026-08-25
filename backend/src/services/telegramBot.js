import TelegramBot from 'node-telegram-bot-api';
import Store from '../models/Store.js';
import User from '../models/User.js';
import TelegramSession from '../models/TelegramSession.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const isProd = process.env.NODE_ENV === 'production';
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL; // e.g. https://your-backend.com/api/auth/telegram/webhook

let bot = null;

// ─── Session helpers (MongoDB-backed, works across serverless instances) ──────
export const createAuthSession = async () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  await TelegramSession.create({ sessionId, status: 'pending' });
  return sessionId;
};

export const getAuthSession = async (sessionId) => {
  const session = await TelegramSession.findOne({ sessionId });
  if (!session) return null;
  return { status: session.status, user: session.user };
};

// ─── Helper: resolve or create user by Telegram identity ─────────────────────
const resolveUserByTelegram = async (from) => {
  const telegramId = from.id.toString();
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'User';

  let profilePic = '';
  if (bot) {
    try {
      const photos = await bot.getUserProfilePhotos(from.id, { limit: 1 });
      if (photos?.total_count > 0 && photos.photos[0]) {
        const file = await bot.getFile(photos.photos[0][0].file_id);
        if (file?.file_path) profilePic = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      }
    } catch (_) {}
  }

  let user = await User.findOne({ telegramId });
  if (!user) {
    user = await User.create({ name, telegramId, profilePic, role: 'customer' });
  } else if (profilePic && (!user.profilePic || user.profilePic.includes('telegram.org'))) {
    user.profilePic = profilePic;
    await user.save();
  }

  return user;
};

// ─── Central message processor (used by both polling and webhook) ─────────────
export const processTelegramUpdate = async (update) => {
  const msg = update.message;
  if (!msg || !msg.text) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // /start login_xxx — 1-click login from deep link
  const loginMatch = text.match(/^\/start\s+login_([a-zA-Z0-9_-]+)/);
  if (loginMatch) {
    const sessionId = loginMatch[1];
    const session = await TelegramSession.findOne({ sessionId });

    if (!session) {
      return bot?.sendMessage(chatId,
        `⚠️ *Link expired*\n\nThis login link has already been used or expired.\n\nPlease go back to the website and tap *"Continue with Telegram"* again.`,
        { parse_mode: 'Markdown' }
      );
    }

    try {
      const user = await resolveUserByTelegram(msg.from);
      const authToken = generateToken(user._id);

      // Update session to authenticated in DB
      await TelegramSession.findOneAndUpdate(
        { sessionId },
        {
          status: 'authenticated',
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            phone: user.phone,
            address: user.address,
            addresses: user.addresses,
            token: authToken,
          },
        }
      );

      bot?.sendMessage(chatId,
        `✅ *Logged in!*\n\nWelcome back, *${user.name}*!\n\n_Return to the website — you're now signed in._`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Telegram login error:', err);
      bot?.sendMessage(chatId, `❌ Something went wrong. Please try again.`);
    }
    return;
  }

  // /start (plain) — auto-create/link account
  if (text === '/start') {
    try {
      const user = await resolveUserByTelegram(msg.from);
      bot?.sendMessage(chatId,
        `👋 Hello *${user.name}*!\n\n` +
        `Your Telegram is now connected to *Amatak*.\n\n` +
        `✅ To log in to any Amatak store:\n` +
        `1. Visit the store website\n` +
        `2. Tap *"Continue with Telegram"*\n` +
        `3. Tap *"Start"* here — done!\n\n` +
        `_You'll receive order updates and login alerts here._`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error in /start:', err);
    }
    return;
  }

  // /link <storeId> — link Telegram group to a store
  const linkMatch = text.match(/^\/link\s+([a-f0-9]{24})$/i);
  if (linkMatch) {
    const storeId = linkMatch[1];
    try {
      const store = await Store.findById(storeId);
      if (!store) return bot?.sendMessage(chatId, `❌ Store not found. Please check the ID.`);
      store.telegramGroupId = chatId.toString();
      await store.save();
      bot?.sendMessage(chatId,
        `✅ *Store linked!*\n\n*${store.name}* is now connected to this chat.\nYou'll receive order notifications here.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error linking store:', err);
      bot?.sendMessage(chatId, `❌ Failed to link store.`);
    }
    return;
  }
};

// ─── Bot initialization ───────────────────────────────────────────────────────
if (token) {
  if (isProd && webhookUrl) {
    // PRODUCTION: use webhook — Telegram POSTs to our backend
    bot = new TelegramBot(token, { webHook: false });
    bot.setWebHook(`${webhookUrl}/api/auth/telegram/webhook`)
      .then(() => console.log(`✅ Telegram webhook set: ${webhookUrl}/api/auth/telegram/webhook`))
      .catch(err => console.error('Failed to set Telegram webhook:', err.message));
  } else {
    // DEVELOPMENT: use polling
    bot = new TelegramBot(token, { polling: true });

    // Route all messages through the central processor
    bot.on('message', (msg) => {
      processTelegramUpdate({ message: msg }).catch(console.error);
    });

    bot.on('polling_error', (error) => {
      if (error?.message?.includes('409 Conflict') || error?.code === 'ETELEGRAM') return;
      console.warn('Telegram Polling Warning:', error.message);
    });

    console.log('✅ Telegram bot polling started (development mode)');
  }
} else {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not set. Telegram Bot disabled.');
}

// ─── Send notification helper ─────────────────────────────────────────────────
export const sendTelegramNotification = async (chatId, message) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
};

export default bot;
