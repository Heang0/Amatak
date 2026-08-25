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

  // Handle plain /start (no session) - auto-link or greet
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const firstName = msg.from?.first_name || 'there';
    const fullName = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || msg.from?.username || 'Telegram User';

    try {
      // Check if this Telegram ID is already linked to an account
      let user = await User.findOne({ telegramId });

      if (user) {
        // Already linked — just greet them
        bot.sendMessage(chatId,
          `👋 Hello *${user.name}*! You're already linked to your Amatak account.\n\nUse the website's *"Continue with Telegram"* button to log in instantly next time.\n\n✅ Your Telegram account is connected.`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // New user or unlinked — create/link account
        let profilePic = '';
        try {
          const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
          if (photos?.total_count > 0 && photos.photos[0]) {
            const fileId = photos.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            if (file?.file_path) profilePic = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
          }
        } catch (_) {}

        user = await User.create({
          name: fullName,
          telegramId,
          profilePic,
          role: 'customer',
        });

        bot.sendMessage(chatId,
          `👋 Hello *${firstName}*! Welcome to *Amatak Shop Bot*.\n\n✅ Your Telegram account has been linked! You can now:\n\n• Log in by tapping *"Continue with Telegram"* on the website\n• Receive login notifications here\n• Get order updates in this chat\n\n_Your data is secure and never shared._`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (err) {
      console.error('Error in /start handler:', err);
      bot.sendMessage(chatId,
        `👋 Hello *${firstName}*! Welcome to *Amatak Shop Bot*.\n\nTo log in, visit the store website and tap *"Continue with Telegram"*.`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Handle direct 1-click login from Telegram App
  bot.onText(/^\/start\s+login_([a-zA-Z0-9_-]+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const sessionId = match[1]?.trim();

    if (!sessionId || !authSessions.has(sessionId)) {
      return bot.sendMessage(chatId,
        `⚠️ *Session Expired*\n\nThis login link has expired or already been used.\n\nPlease return to the website and click *"Continue with Telegram"* again to get a fresh link.`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '🌐 Visit Amatak', url: process.env.FRONTEND_URL || 'https://amatak.store' }
            ]]
          }
        }
      );
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

  // Handle /myemail command - link Telegram to an existing email account
  bot.onText(/^\/myemail\s+(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const email = match[1].trim().toLowerCase();

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return bot.sendMessage(chatId,
          `❌ *No account found*\n\nNo account found with email: \`${email}\`\n\nPlease check your email address or register on the website first.`,
          { parse_mode: 'Markdown' }
        );
      }

      // Link the telegramId to this account
      user.telegramId = telegramId;
      await user.save();

      bot.sendMessage(chatId,
        `✅ *Linked Successfully!*\n\nYour Telegram is now linked to:\n📧 ${email}\n👤 ${user.name}\n\nYou will now receive:\n• Login alerts 🔐\n• Order updates 📦\n• Promotions 🎁\n\nNext time, just tap *"Continue with Telegram"* on the website to log in instantly!`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Error linking email via bot:', err);
      bot.sendMessage(chatId, `❌ Something went wrong. Please try again.`);
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
