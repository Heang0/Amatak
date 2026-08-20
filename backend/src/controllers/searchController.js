import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

// @desc    Global search across store
// @route   GET /api/store/search
// @access  Private (Store Admin)
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const storeId = req.user.storeId; // Assuming authenticate middleware attaches user with storeId

    if (!q || q.trim() === '') {
      return res.status(200).json({ products: [], categories: [], orders: [] });
    }

    const regex = { $regex: q, $options: 'i' }
    
    // Search Products
    const products = await Product.find({
      store: storeId,
      $or: [
        { 'name.en': regex },
        { 'name.km': regex },
        { sku: regex },
        { 'description.en': regex }
      ]
    }).limit(5).select('_id name sku price images');

    // Search Categories
    const categories = await Category.find({
      store: storeId,
      $or: [
        { 'name.en': regex },
        { 'name.km': regex },
        { slug: regex }
      ]
    }).limit(5).select('_id name slug');

    // Search Orders
    // We can search by orderId (which might be a short ID) or customer name/phone
    const orders = await Order.find({
      store: storeId,
      $or: [
        { orderId: regex },
        { 'customerInfo.name': regex },
        { 'customerInfo.phone': regex }
      ]
    }).limit(5).select('_id orderId customerInfo totalAmount status createdAt');

    res.status(200).json({
      success: true,
      data: {
        products,
        categories,
        orders
      }
    });

  } catch (error) {
    console.error('Error in globalSearch:', error);
    res.status(500).json({ success: false, message: 'Server Error during search' });
  }
}

export {
  globalSearch
}
