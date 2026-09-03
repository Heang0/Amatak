import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';

// @desc    Get store analytics summary & detailed reports
// @route   GET /api/analytics
// @access  Private (Store Admin)
export const getStoreAnalytics = async (req, res) => {
  try {
    const store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Store not found for this user' });
    }

    // Determine the date range from query, default to 7 days
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Calculate Total Revenue (Only PAID or DELIVERED orders in the date range)
    const paidOrders = await Order.find({ 
      storeId: store._id, 
      paymentStatus: 'PAID',
      createdAt: { $gte: startDate }
    });
    
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Total Orders Count (Only PAID in the date range)
    const totalOrders = paidOrders.length;
    
    // Average Order Value (AOV)
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    // 3. Total Products Count (Lifetime, not filtered by date)
    const totalProducts = await Product.countDocuments({ storeId: store._id });

    // 4. 5 Most Recent Orders (Only PAID)
    const recentOrders = await Order.find({ storeId: store._id, paymentStatus: 'PAID' })
      .populate('customerId', 'name email')
      .populate('items.productId', 'title imageUrl')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Chart Data (Group by date over the selected period)
    const dailyRevenue = await Order.aggregate([
      { 
        $match: { 
          storeId: store._id, 
          paymentStatus: 'PAID',
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dailyRevenue.find(dr => dr._id === dateStr);
      chartData.push({
        date: dateStr,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayData ? dayData.revenue : 0,
      });
    }

    // 6. Top Selling Products (Aggregation pipeline)
    const topProductsRaw = await Order.aggregate([
      { 
        $match: { 
          storeId: store._id, 
          paymentStatus: 'PAID',
          createdAt: { $gte: startDate }
        } 
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantitySold: { $sum: '$items.qty' },
          totalRevenueGenerated: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } }, // Default sorting by quantity sold
      { $limit: 10 }
    ]);

    // Populate top products details
    const topProducts = await Product.populate(topProductsRaw, { path: '_id', select: 'title imageUrl sku price' });

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalProducts,
      recentOrders,
      chartData,
      topProducts,
      plan: store.plan,
      isActive: store.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
