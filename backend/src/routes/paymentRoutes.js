import express from 'express';
import { generatePayment, checkPaymentStatus, cutluyWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Generate a payment QR code
router.post('/generate', generatePayment);

// Manually poll payment status
router.get('/status/:id', checkPaymentStatus);

// Webhook listener for CutLuy
router.post('/webhook/cutluy', cutluyWebhook);

export default router;
