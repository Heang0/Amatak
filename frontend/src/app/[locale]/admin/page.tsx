'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Package, ShoppingCart, DollarSign, TrendingUp, Settings } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const t = useTranslations('AdminDashboard');
 const [analytics, setAnalytics] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
 setMounted(true);
 const fetchAnalytics = async () => {
  try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics`, {
   headers: { Authorization: `Bearer ${user?.token}` }
  });
  if (res.ok) {
   const data = await res.json();
   setAnalytics(data);
  } else if (res.status === 404) {
   router.push('/admin/setup');
  }
  } catch (err) {
  console.error('Failed to fetch analytics', err);
  } finally {
  setLoading(false);
  }
 };

 if (user?.token) fetchAnalytics();
 }, [user]);

 return (
 <div className="space-y-6">
  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
  <div>
   <h2 className="text-xl font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{t('overview_title')}</h2>
   <p className="text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] /40 mt-0.5">
   {t('welcome_back', { name: user?.name || t('guest') })}
   </p>
  </div>
  <Link href="/admin/settings" className="p-2 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] /30 hover:text-gray-700 dark:text-[#d4d4d8] dark:hover:text-white rounded-none hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors shrink-0">
   <Settings size={18} />
  </Link>
  </div>

  {loading ? (
  <p className="text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">{t('loading_analytics')}</p>
  ) : analytics ? (
  <>
   {/* Plan Status Warning Banners */}
   {!analytics.isActive && (
   <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-4 rounded-[20px] flex items-center justify-between mb-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none">
    <div>
    <h4 className="text-red-800 dark:text-red-400 font-bold">Store Suspended</h4>
    <p className="text-sm text-red-600 dark:text-red-300 mt-1">Your store is currently suspended by the superadmin. Customers cannot access your storefront.</p>
    </div>
    <Link href="/admin/upgrade" className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-none hover:bg-red-700 transition-colors shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none whitespace-nowrap ml-4">
    Upgrade Plan
    </Link>
   </div>
   )}
   
   {analytics.isActive && analytics.plan?.expiresAt && new Date(analytics.plan.expiresAt) < new Date() && (
   <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 p-4 rounded-[20px] flex items-center justify-between mb-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none">
    <div>
    <h4 className="text-yellow-800 dark:text-yellow-400 font-bold">Plan Expired</h4>
    <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">Your subscription plan has expired. Please renew your plan to prevent your store from being suspended.</p>
    </div>
    <Link href="/admin/upgrade" className="px-4 py-2 bg-yellow-600 text-white text-sm font-semibold rounded-none hover:bg-yellow-700 transition-colors shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none whitespace-nowrap ml-4">
    Renew Now
    </Link>
   </div>
   )}

   {analytics.isActive && analytics.plan?.expiresAt && new Date(analytics.plan.expiresAt) > new Date() && new Date(analytics.plan.expiresAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && (
   <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-[20px] flex items-center justify-between mb-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none">
    <div>
    <h4 className="text-blue-800 dark:text-blue-400 font-bold">Plan Expiring Soon</h4>
    <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">Your subscription plan expires on {new Date(analytics.plan.expiresAt).toLocaleDateString()}. Renew early to avoid interruption.</p>
    </div>
    <Link href="/admin/upgrade" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-none hover:bg-blue-700 transition-colors shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none whitespace-nowrap ml-4">
    Renew Now
    </Link>
   </div>
   )}

   {/* Metric Cards */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] p-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
    <div className="relative">
    <div className="flex justify-between items-start mb-4">
     <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-green-100 dark:border-green-900/30">
     <DollarSign className="w-5 h-5" />
     </div>
     <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md text-xs font-bold">
     <TrendingUp className="w-3 h-3" /> +12%
     </div>
    </div>
    <h3 className="text-sm font-bold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('total_revenue')}</h3>
    <p className="text-3xl font-black text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">${(analytics.totalRevenue || 0).toFixed(2)}</p>
    </div>
   </div>

   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] p-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
    <div className="relative">
    <div className="flex justify-between items-start mb-4">
     <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-blue-100 dark:border-blue-900/30">
     <ShoppingCart className="w-5 h-5" />
     </div>
    </div>
    <h3 className="text-sm font-bold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('total_orders')}</h3>
    <p className="text-3xl font-black text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{analytics.totalOrders || 0}</p>
    </div>
   </div>

   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] p-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
    <div className="relative">
    <div className="flex justify-between items-start mb-4">
     <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-orange-100 dark:border-orange-900/30">
     <Package className="w-5 h-5" />
     </div>
    </div>
    <h3 className="text-sm font-bold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider mb-1">{t('total_products')}</h3>
    <p className="text-3xl font-black text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{analytics.totalProducts || 0}</p>
    </div>
   </div>

   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] p-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
    <div className="relative">
    <div className="flex justify-between items-start mb-4">
     <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-purple-100 dark:border-purple-900/30">
     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
     </svg>
     </div>
    </div>
    <h3 className="text-sm font-bold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider mb-1">Customers</h3>
    <p className="text-3xl font-black text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{analytics.totalCustomers || 0}</p>
    </div>
   </div>
   </div>

   {/* Revenue Chart */}
   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] p-6 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none">
   <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] mb-6">{t('revenue_overview') || 'Revenue Overview (Last 7 Days)'}</h3>
   <div className="h-[300px] w-full">
    {mounted && (
    <ResponsiveContainer width="100%" height="100%">
     <AreaChart data={analytics.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
     <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#E84C3D" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#E84C3D" stopOpacity={0}/>
      </linearGradient>
     </defs>
     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
     <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
     <YAxis 
      axisLine={false} 
      tickLine={false} 
      tick={{ fontSize: 12, fill: '#6b7280' }}
      tickFormatter={(value: number) => `$${value}`}
     />
     <Tooltip 
      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
      itemStyle={{ color: '#E84C3D', fontWeight: 'bold' }}
      labelStyle={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}
      formatter={(value: any) => [`$${(Number(value) || 0).toFixed(2)}`, 'Revenue']}
     />
     <Area type="monotone" dataKey="revenue" stroke="#E84C3D" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
     </AreaChart>
    </ResponsiveContainer>
    )}
   </div>
   </div>

   {/* Recent Orders Table */}
   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none overflow-hidden">
   <div className="px-6 py-5 border-b border-none border-none flex justify-between items-center">
    <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{t('recent_orders')}</h3>
    <Link href="/admin/orders" className="text-sm font-medium text-[#E84C3D] hover:text-red-600 transition-colors">{t('view_all')} &rarr;</Link>
   </div>
   <table className="min-w-full divide-y divide-gray-100 dark:divide-white/10">
    <thead className="bg-[#F4F7FE] dark:bg-[#080808]">
    <tr>
     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">{t('order_id')}</th>
     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">{t('customer')}</th>
     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">{t('amount')}</th>
     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">{t('payment')}</th>
     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">{t('fulfillment')}</th>
    </tr>
    </thead>
    <tbody className="divide-y divide-gray-100 dark:divide-white/10">
    {analytics.recentOrders?.map((order: any) => (
     <tr key={order._id} className="hover:bg-[#F4F7FE] dark:hover:bg-gray-800/50 transition-colors">
     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] font-mono">{order._id.substring(0, 8)}...</td>
     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{order.customerId?.name || 'Guest'}</td>
     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">${order.totalAmount.toFixed(2)}</td>
     <td className="px-6 py-4 whitespace-nowrap text-sm">
      {order.paymentStatus === 'PAID' ? (
      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">{t('status_paid')}</span>
      ) : (
      <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">{t('status_pending')}</span>
      )}
     </td>
     <td className="px-6 py-4 whitespace-nowrap text-sm">
      <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${ order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : order.orderStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : order.orderStatus === 'PROCESSING' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' }`}>
       {order.orderStatus === 'DELIVERED' ? t('status_delivered') 
       : order.orderStatus === 'SHIPPED' ? t('status_shipped')
       : order.orderStatus === 'PROCESSING' ? t('status_processing')
       : order.orderStatus === 'CANCELLED' ? t('status_cancelled')
       : t('status_pending')}
      </span>
     </td>
     </tr>
    ))}
    {(!analytics.recentOrders || analytics.recentOrders.length === 0) && (
     <tr>
     <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">
      {t('no_recent_orders')}
     </td>
     </tr>
    )}
    </tbody>
   </table>
   </div>
  </>
  ) : (
  <p className="text-red-500">{t('failed_analytics')}</p>
  )}
 </div>
 );
}
