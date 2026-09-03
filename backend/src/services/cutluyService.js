import axios from 'axios';

const CUTLUY_API_URL = 'https://cutluy.com/v1';

/**
 * Generate a Payment QR Code via CutLuy API
 * @param {number} amount - The amount to charge
 * @param {string} referenceId - Your internal order ID
 * @returns {Promise<Object>} - Contains qr_string and id
 */
export const generateCutLuyPayment = async (amount, referenceId) => {
  const apiKey = process.env.CUTLUY_API_KEY;
  if (!apiKey) throw new Error('CUTLUY_API_KEY is not defined in environment variables');

  try {
    const response = await axios.post(`${CUTLUY_API_URL}/payments`, {
      amount,
      reference_id: referenceId.toString()
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data; // Expected { qr_string, id, ... }
  } catch (error) {
    console.error('Error generating CutLuy payment:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Check Payment Status via CutLuy API (Manual Poll)
 * @param {string} paymentId - The ID returned from generateCutLuyPayment
 * @returns {Promise<Object>} - Contains the payment status
 */
export const checkCutLuyPaymentStatus = async (paymentId) => {
  const apiKey = process.env.CUTLUY_API_KEY;
  if (!apiKey) throw new Error('CUTLUY_API_KEY is not defined in environment variables');

  try {
    const response = await axios.get(`${CUTLUY_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data; // Expected to contain status, e.g. "paid"
  } catch (error) {
    console.error('Error checking CutLuy payment status:', error.response?.data || error.message);
    throw error;
  }
};
