import Order from '../models/Order.js';
import { generateCutLuyPayment, checkCutLuyPaymentStatus } from '../services/cutluyService.js';

// @desc    Generate a CutLuy Payment QR Code
// @route   POST /api/payments/generate
// @access  Public
export const generatePayment = async (req, res) => {
  try {
    const { amount, reference_id } = req.body;

    if (!amount || !reference_id) {
      return res.status(400).json({ message: 'Amount and reference_id are required' });
    }

    const paymentData = await generateCutLuyPayment(amount, reference_id);
    
    // The paymentData should contain qr_string and id
    res.status(200).json(paymentData);
  } catch (error) {
    console.error('Payment generation failed:', error);
    res.status(500).json({ message: 'Failed to generate payment QR code' });
  }
};

// @desc    Check CutLuy Payment Status
// @route   GET /api/payments/status/:id
// @access  Public
export const checkPaymentStatus = async (req, res) => {
  try {
    const paymentId = req.params.id;

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const statusData = await checkCutLuyPaymentStatus(paymentId);
    
    // If status equals "paid", update order if necessary
    if (statusData.status === 'paid' && statusData.reference_id) {
      const order = await Order.findById(statusData.reference_id);
      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        await order.save();
      }
    }

    res.status(200).json(statusData);
  } catch (error) {
    console.error('Payment status check failed:', error);
    res.status(500).json({ message: 'Failed to check payment status' });
  }
};

// @desc    CutLuy Webhook for Auto-Confirmation
// @route   POST /api/payments/webhook/cutluy
// @access  Public
export const cutluyWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Check if the event is payment.paid
    if (event && event.type === 'payment.paid') {
      const referenceId = event.data?.reference_id; // Your Order ID

      if (referenceId) {
        const order = await Order.findById(referenceId);
        
        if (order) {
          if (order.paymentStatus !== 'PAID') {
            order.paymentStatus = 'PAID';
            await order.save();
            console.log(`Order ${referenceId} marked as PAID via webhook`);
          }
        } else {
          console.warn(`Order ${referenceId} not found for webhook confirmation`);
        }
      }
    }

    // Always return 200 OK to the webhook provider so they don't retry unnecessarily
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};
