import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import User from '../models/User.js';

// @desc    Get real dynamic notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const notifications = [];

    if (user.role === 'store_admin') {
      // 1. Find merchant's store
      const store = await Store.findOne({ ownerId: user._id });
      if (!store) {
        return res.json({ notifications: [] });
      }

      // 2. Fetch recent orders (last 8)
      const recentOrders = await Order.find({ storeId: store._id })
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('customerId', 'name email');

      recentOrders.forEach((order) => {
        const customerName = order.isGuest ? (order.guestInfo?.name || 'Guest') : (order.customerId?.name || 'Customer');
        const isPaid = order.paymentStatus === 'PAID';

        notifications.push({
          id: `order_${order._id}`,
          type: 'order',
          title: isPaid ? 'New Paid Order' : 'New Order Received',
          message: `${customerName} placed order #${order._id.toString().substring(order._id.toString().length - 6).toUpperCase()} for $${order.totalAmount?.toFixed(2)}`,
          time: order.createdAt,
          status: order.orderStatus || 'PENDING',
          paymentStatus: order.paymentStatus,
          link: '/admin/orders',
        });
      });

      // 3. Check for low stock products
      const lowStockProducts = await Product.find({ 
        storeId: store._id,
        stock: { $lte: 5, $gte: 0 },
        isActive: true 
      }).limit(5);

      lowStockProducts.forEach((product) => {
        const prodName = product.name?.en || product.name || 'Product';
        notifications.push({
          id: `stock_${product._id}`,
          type: 'stock',
          title: product.stock === 0 ? 'Out of Stock Alert' : 'Low Stock Alert',
          message: product.stock === 0 
            ? `"${prodName}" is completely out of stock.` 
            : `"${prodName}" has only ${product.stock} units remaining.`,
          time: product.updatedAt || product.createdAt,
          link: '/admin/products',
        });
      });

      // 4. Check subscription expiry
      if (store.plan?.expiresAt) {
        const expiresAt = new Date(store.plan.expiresAt);
        const now = new Date();
        const diffDays = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          notifications.push({
            id: `plan_expired_${store._id}`,
            type: 'plan',
            title: 'Subscription Expired',
            message: 'Your store subscription has expired. Renew now to prevent interruption.',
            time: store.plan.expiresAt,
            link: '/admin/upgrade',
          });
        } else if (diffDays <= 5) {
          notifications.push({
            id: `plan_warning_${store._id}`,
            type: 'plan',
            title: 'Plan Expiring Soon',
            message: `Your subscription plan will expire in ${diffDays} day${diffDays > 1 ? 's' : ''}.`,
            time: store.plan.expiresAt,
            link: '/admin/upgrade',
          });
        }
      }

    } else if (user.role === 'superadmin') {
      // Superadmin notifications: New stores and users
      const recentStores = await Store.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('ownerId', 'name email');

      recentStores.forEach((s) => {
        notifications.push({
          id: `store_${s._id}`,
          type: 'store',
          title: 'New Store Created',
          message: `"${s.name}" was registered by ${s.ownerId?.name || 'a merchant'}.`,
          time: s.createdAt,
          link: '/superadmin/stores',
        });
      });

      const recentUsers = await User.find({ role: { $ne: 'superadmin' } })
        .sort({ createdAt: -1 })
        .limit(5);

      recentUsers.forEach((u) => {
        notifications.push({
          id: `user_${u._id}`,
          type: 'user',
          title: 'New User Joined',
          message: `${u.name} (${u.email || 'No email'}) registered on the platform.`,
          time: u.createdAt,
          link: '/superadmin/users',
        });
      });
    }

    // Sort all notifications by most recent timestamp
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};
