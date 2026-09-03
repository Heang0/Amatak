import express from 'express';
import { authUser, superAdminLogin, registerUser, telegramLogin, linkTelegramAccount, googleLogin, createTelegramSession, checkTelegramSession, telegramWebhook } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, authUser);
router.post('/superadmin-login', authLimiter, superAdminLogin);
router.post('/google', authLimiter, googleLogin);
router.post('/telegram', authLimiter, telegramLogin);
router.post('/telegram/session', createTelegramSession);
router.get('/telegram/session/:sessionId', checkTelegramSession);
router.post('/telegram/webhook', telegramWebhook); // Telegram sends updates here in production
router.put('/telegram/link', protect, linkTelegramAccount);

export default router;
