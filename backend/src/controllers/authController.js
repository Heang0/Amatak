import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Send Telegram login notification if user has linked Telegram account
      if (user.telegramId) {
        try {
          const { sendTelegramNotification } = await import('../services/telegramBot.js');
          const loginTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh', hour12: false });
          await sendTelegramNotification(
            user.telegramId,
            `🔐 *Login Alert*\n\nHello *${user.name}*! Your account was just signed in.\n\n📅 Time: ${loginTime} (ICT)\n\n_If this wasn't you, please contact us immediately._`
          );
        } catch (notifyErr) {
          console.error('Failed to send telegram login notification:', notifyErr.message);
        }
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        address: user.address,
        addresses: user.addresses,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Store Admin registration) / Private (Superadmin creates others)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Default to store_admin for public registration, superadmin needs manual DB entry or auth
    const userRole = role === 'superadmin' ? 'customer' : (role || 'store_admin');

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        phone: user.phone,
        address: user.address,
        addresses: user.addresses,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate with Telegram
// @route   POST /api/auth/telegram
// @access  Public
const telegramLogin = async (req, res) => {
  const data = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ message: 'Server not configured for Telegram Login' });
  }

  // 1. Verify Hash
  const { hash, ...userData } = data;
  const dataCheckArr = [];
  for (const key in userData) {
    if (userData[key] !== undefined && userData[key] !== null) {
      dataCheckArr.push(`${key}=${userData[key]}`);
    }
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return res.status(401).json({ message: 'Invalid Telegram authentication' });
  }

  // 2. Check if auth_date is too old (e.g., older than 24 hours)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({ message: 'Authentication data expired' });
  }

  try {
    // 3. Find or Create User
    let user = await User.findOne({ telegramId: data.id.toString() });

    if (!user) {
      // Create new customer account automatically
      user = await User.create({
        name: data.first_name + (data.last_name ? ` ${data.last_name}` : ''),
        telegramId: data.id.toString(),
        profilePic: data.photo_url || '',
        role: 'customer',
      });
    }

    // 4. Send Telegram Notification
    try {
      const { sendTelegramNotification } = await import('../services/telegramBot.js');
      await sendTelegramNotification(
        data.id.toString(),
        `✅ *Login Successful!*\n\nYou have successfully logged in to *Amatak*.\n\n_If this wasn't you, please secure your account immediately._`
      );
    } catch (err) {
      console.error('Failed to send telegram login notification:', err);
    }

    // 5. Return token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email, // might be undefined
      role: user.role,
      profilePic: user.profilePic,
      phone: user.phone,
      address: user.address,
      addresses: user.addresses,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Link Telegram to existing user account
// @route   PUT /api/auth/telegram/link
// @access  Private
const linkTelegramAccount = async (req, res) => {
  const data = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return res.status(500).json({ message: 'Server not configured for Telegram Login' });
  }

  // 1. Verify Hash
  const { hash, ...userData } = data;
  const dataCheckArr = [];
  for (const key in userData) {
    if (userData[key] !== undefined && userData[key] !== null) {
      dataCheckArr.push(`${key}=${userData[key]}`);
    }
  }
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    return res.status(401).json({ message: 'Invalid Telegram authentication' });
  }

  // 2. Check if auth_date is too old (e.g., older than 24 hours)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return res.status(401).json({ message: 'Authentication data expired' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if telegramId is already linked to another account
    const existingLink = await User.findOne({ telegramId: data.id.toString(), _id: { $ne: req.user._id } });
    if (existingLink) {
      return res.status(400).json({ message: 'This Telegram account is already linked to another user' });
    }

    user.telegramId = data.id.toString();
    await user.save();

    res.json({ message: 'Telegram account linked successfully', telegramId: user.telegramId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleClient = new OAuth2Client();

// @desc    Authenticate with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential, accessToken, role } = req.body;

  if (!credential && !accessToken) {
    return res.status(400).json({ message: 'Google credential or accessToken is required' });
  }

  try {
    let email, name, picture, googleId;

    if (accessToken) {
      // Verify & fetch user info using access token
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!googleRes.ok) {
        return res.status(401).json({ message: 'Failed to verify Google access token' });
      }
      const data = await googleRes.json();
      email = data.email;
      name = data.name;
      picture = data.picture;
      googleId = data.sub;
    } else {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const verifyOptions = { idToken: credential };
        if (clientId) {
          verifyOptions.audience = clientId;
        }
        
        const ticket = await googleClient.verifyIdToken(verifyOptions);
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        picture = payload.picture;
        googleId = payload.sub;
      } catch (verifyErr) {
        console.error('Google token verification error:', verifyErr);
        return res.status(401).json({ message: 'Invalid or expired Google token' });
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Google account does not contain a valid email' });
    }

    // 1. Check if user exists by googleId OR email
    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });

    if (user) {
      // Link googleId and sync profilePic if needed
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (picture && (!user.profilePic || user.profilePic.includes('googleusercontent.com'))) {
        user.profilePic = picture;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      // 2. Create new user
      const userRole = role === 'superadmin' ? 'customer' : (role || 'store_admin');
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        googleId,
        profilePic: picture || '',
        role: userRole,
      });
    }

    // 3. Return user profile and JWT
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      phone: user.phone,
      address: user.address,
      addresses: user.addresses,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in googleLogin:', error);
    res.status(500).json({ message: error.message || 'Server error during Google authentication' });
  }
};

// @desc    Create a new Telegram direct bot auth session
// @route   POST /api/auth/telegram/session
// @access  Public
const createTelegramSession = async (req, res) => {
  try {
    const { createAuthSession } = await import('../services/telegramBot.js');
    const sessionId = await createAuthSession(); // now async (MongoDB)
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'amatakshop_bot';
    const deepLink = `https://t.me/${botUsername}?start=login_${sessionId}`;
    res.json({ sessionId, deepLink, botUsername });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create Telegram session' });
  }
};

// @desc    Check status of a Telegram direct bot auth session
// @route   GET /api/auth/telegram/session/:sessionId
// @access  Public
const checkTelegramSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { getAuthSession } = await import('../services/telegramBot.js');
    const session = await getAuthSession(sessionId); // now async (MongoDB)

    if (!session) {
      return res.status(404).json({ status: 'expired', message: 'Session not found or expired' });
    }

    if (session.status === 'authenticated' && session.user) {
      return res.json({ status: 'authenticated', user: session.user });
    }

    res.json({ status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to check session' });
  }
};

// @desc    Receive Telegram webhook updates (production)
// @route   POST /api/auth/telegram/webhook
// @access  Public (Telegram servers only)
const telegramWebhook = async (req, res) => {
  try {
    const { processTelegramUpdate } = await import('../services/telegramBot.js');
    await processTelegramUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(200); // Always return 200 to Telegram
  }
};

export { authUser, registerUser, telegramLogin, linkTelegramAccount, googleLogin, createTelegramSession, checkTelegramSession, telegramWebhook };
