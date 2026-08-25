import TelegramBot from 'node-telegram-bot-api';
import Store from '../models/Store.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

let bot = null;

// In-memory session store for direct bot deep link logins
const authSessions = new Map();

// Auto cleanup sessions older than 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of authSessions.entries()) {
    if (now - session.createdAt > 10 * 60 * 1000) {
      authSessions.delete(id);
    }
  }
}, 60 * 1000);

export const createAuthSession = () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  authSessions.set(sessionId, {
    status: 'pending',
    createdAt: Date.now(),
    user: null,
  });
  return sessionId;
};

export const getAuthSession = (sessionId) => {
  return authSessions.get(sessionId) || null;
};

// Enable polling by default when token exists unless explicitly disabled
const shouldPoll = process.env.ENABLE_TELEGRAM_POLLING !== 'false';

if (token) {
  bot = new TelegramBot(token, { polling: shouldPoll });

  // Handle direct 1-click login from Telegram App
  bot.onText(/^\/start\s+login_([a-zA-Z0-9_-]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const sessionId = match[1]?.trim();

    if (!sessionId || !authSessions.has(sessionId)) {
      return bot.sendMessage(chatId, `⚠️ សម័យចូលប្រើប្រាស់នេះបានផុតកំណត់ហើយ។ សូមសាកល្បងម្ដងទៀតនៅលើវេបសាយ。\n(This login session has expired. Please try again on the website.)`);
    }

    try {
      const telegramId = msg.from.id.toString();
      const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || 'Telegram User';
      let profilePic = '';

      try {
        const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
        if (photos && photos.total_count > 0 && photos.photos[0]) {
          const fileId = photos.photos[0][0].file_id;
          const file = await bot.getFile(fileId);
          if (file?.file_path) {
            profilePic = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
          }
        }
      } catch (photoErr) {
        console.log('Could not fetch Telegram user photo:', photoErr.message);
      }

      // Find or create customer
      let user = await User.findOne({ telegramId });
      if (!user) {
        user = await User.create({
          name,
          telegramId,
          profilePic,
          role: 'customer',
        });
      } else if (profilePic && (!user.profilePic || user.profilePic.includes('telegram.org'))) {
        user.profilePic = profilePic;
        await user.save();
      }

      const authToken = generateToken(user._id);

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

      const welcomeMsg = `✅ *ចូលគណនីជោគជ័យ! (Login Successful!)*\n\nសូមស្វាគមន៍ *${user.name}*!\nលោកអ្នកត្រូវបានចូលគណនីនៅលើវេបសាយ *Amatak* ដោយជោគជ័យ។\n\n_សូមត្រឡប់ទៅកាន់ Browser របស់អ្នកវិញ។_`;
      bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error during direct Telegram login:', err);
      bot.sendMessage(chatId, `❌ មានបញ្ហាក្នុងការចូលគណនី។ សូមសាកល្បងម្ដងទៀត។`);
    }
  });

  bot.onText(/^\/link\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const storeId = match[1].trim();

    try {
      const store = await Store.findById(storeId);
      if (!store) {
        return bot.sendMessage(chatId, `❌ Error: Store with ID "${storeId}" not found.`);
      }

      store.telegramGroupId = chatId.toString();
      await store.save();

      const successMsg = `✅ *Success! (ជោគជ័យ!)*\n\nThis chat is successfully linked to the store: *${store.name}*.\nការភ្ជាប់ទៅកាន់ហាង *${store.name}* ទទួលបានជោគជ័យ។\n\nYou will now receive all new order notifications here.\nលោកអ្នកនឹងទទួលបានការជូនដំណឹងពីការបញ្ជាទិញថ្មីៗនៅទីនេះ។`;
      bot.sendMessage(chatId, successMsg, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Error linking telegram group:', err);
      bot.sendMessage(chatId, `❌ An error occurred while linking the store. Please make sure the Store ID is correct.`);
    }
  });

  bot.on('polling_error', (error) => {
    // Avoid spamming logs if another instance (e.g. deployed backend) is already polling
    if (error?.message?.includes('409 Conflict') || error?.code === 'ETELEGRAM') {
      return;
    }
    console.warn('Telegram Polling Warning:', error.message);
  });
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not found in .env. Telegram Bot is disabled.');
}

export const sendTelegramNotification = async (chatId, message) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to send telegram message:', err);
  }
};

export default bot;
