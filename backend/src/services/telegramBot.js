import TelegramBot from 'node-telegram-bot-api';
import Store from '../models/Store.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

// ─── In-memory session store (auto-cleanup after 10 min) ─────────────────────
const authSessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of authSessions.entries()) {
    if (now - session.createdAt > 10 * 60 * 1000) authSessions.delete(id);
  }
}, 60 * 1000);

export const createAuthSession = () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  authSessions.set(sessionId, { status: 'pending', createdAt: Date.now(), user: null });
  return sessionId;
};

export const getAuthSession = (sessionId) => authSessions.get(sessionId) || null;

// ─── Helper: find or create user by Telegram ID ─────────────────────────────
const resolveUserByTelegram = async (from, token) => {
  const telegramId = from.id.toString();
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'User';

  // Fetch profile pic
  let profilePic = '';
  try {
    const photos = await bot.getUserProfilePhotos(from.id, { limit: 1 });
    if (photos?.total_count > 0 && photos.photos[0]) {
      const file = await bot.getFile(photos.photos[0][0].file_id);
      if (file?.file_path) profilePic = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    }
  } catch (_) {}

  // Find existing account linked to this Telegram
  let user = await User.findOne({ telegramId });

  if (!user) {
    // Create new Telegram-based account
    user = await User.create({ name, telegramId, profilePic, role: 'customer' });
  } else if (profilePic && (!user.profilePic || user.profilePic.includes('telegram.org'))) {
    user.profilePic = profilePic;
    await user.save();
  }

  return user;
};

// ─── Start bot ───────────────────────────────────────────────────────────────
const shouldPoll = process.env.ENABLE_TELEGRAM_POLLING !== 'false';

if (token) {
  bot = new TelegramBot(token, { polling: shouldPoll });

  // ── /start (plain) ────────────────────────────────────────────────────────
  // Auto-creates/links account and confirms to the user
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
      const user = await resolveUserByTelegram(msg.from, token);

      bot.sendMessage(chatId,
        `👋 Hello *${user.name}*!\n\n` +
        `Your Telegram is now connected to *Amatak*.\n\n` +
        `✅ You can log in to any Amatak store instantly:\n` +
        `1. Visit the store website\n` +
        `2. Tap *"Continue with Telegram"*\n` +
        `3. Tap *"Start"* here — done!\n\n` +
        `_You'll also receive order updates and login alerts here._`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error in /start handler:', err);
    }
  });

  // ── /start login_xxx (from website deep link) ─────────────────────────────
  bot.onText(/^\/start\s+login_([a-zA-Z0-9_-]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const sessionId = match[1]?.trim();

    if (!sessionId || !authSessions.has(sessionId)) {
      return bot.sendMessage(chatId,
        `⚠️ *Link expired*\n\nThis login link has already been used or expired.\n\nPlease go back to the website and tap *"Continue with Telegram"* again.`,
        { parse_mode: 'Markdown' }
      );
    }

    try {
      const user = await resolveUserByTelegram(msg.from, token);
      const authToken = generateToken(user._id);

      // Mark session as authenticated
      authSessions.set(sessionId, {
        status: 'authenticated',
        createdAt: Date.now(),
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
      });

      bot.sendMessage(chatId,
        `✅ *Logged in!*\n\nWelcome back, *${user.name}*!\n\nYou're now signed in to *Amatak*.\n_You can close Telegram and return to the website._`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error during Telegram login:', err);
      bot.sendMessage(chatId, `❌ Something went wrong. Please try again on the website.`);
    }
  });

  // ── /link <storeId> (for store owners to link their group) ───────────────
  bot.onText(/^\/link\s+([a-f0-9]{24})$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const storeId = match[1].trim();

    try {
      const store = await Store.findById(storeId);
      if (!store) return bot.sendMessage(chatId, `❌ Store not found. Please check the ID.`);

      store.telegramGroupId = chatId.toString();
      await store.save();

      bot.sendMessage(chatId,
        `✅ *Store linked!*\n\n*${store.name}* is now connected to this chat.\nYou'll receive order notifications here.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error linking store:', err);
      bot.sendMessage(chatId, `❌ Failed to link store. Please try again.`);
    }
  });

  // ── Polling error silencer ────────────────────────────────────────────────
  bot.on('polling_error', (error) => {
    if (error?.message?.includes('409 Conflict') || error?.code === 'ETELEGRAM') return;
    console.warn('Telegram Polling Warning:', error.message);
  });

} else {
  console.log('⚠️  TELEGRAM_BOT_TOKEN not set. Telegram Bot disabled.');
}

// ─── Send notification helper ────────────────────────────────────────────────
export const sendTelegramNotification = async (chatId, message) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
};

export default bot;
