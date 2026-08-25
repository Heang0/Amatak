'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Package, ShoppingCart, DollarSign, TrendingUp, Users, ArrowUpRight, ChevronRight, ShieldAlert } from 'lucide-react';
import { Link, useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminDashboard');
  const locale = useLocale();
  const isKm = locale === 'km';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isKm ? 'ផ្ទាំងគ្រប់គ្រងទូទៅ' : 'Dashboard'}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {t('welcome_back', { name: user?.name || (isKm ? 'អ្នកគ្រប់គ្រង' : 'Merchant') })}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl">
          <div className="w-8 h-8 border-3 border-red-500/20 border-t-[#E84C3D] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('loading_analytics')}</p>
        </div>
      ) : analytics ? (
        <>
          {/* Plan Status Warning Banners */}
          {!analytics.isActive && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-5 rounded-3xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                <div>
                  <h4 className="text-red-900 dark:text-red-300 font-bold text-sm">Store Suspended</h4>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">Your store is currently suspended. Upgrade your plan to restore storefront access.</p>
                </div>
              </div>
              <Link href="/admin/upgrade" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-red-500/20 whitespace-nowrap ml-4">
                Upgrade Plan
              </Link>
            </div>
          )}

          {/* Metric KPI Cards (Modern Clean Style with Pastel Accents) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Revenue Card */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> +14.2%
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('total_revenue')}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                ${(analytics.totalRevenue || 0).toFixed(2)}
              </h3>
            </div>

            {/* Orders Card */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3" /> +8.1%
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('total_orders')}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {analytics.totalOrders || 0}
              </h3>
            </div>

            {/* Products Card */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('total_products')}</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {analytics.totalProducts || 0}
              </h3>
            </div>

            {/* Customers Card */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {isKm ? 'អតិថិជនសរុប' : 'Customers'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {analytics.totalCustomers || 0}
              </h3>
            </div>

          </div>

          {/* Revenue Chart Section */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('revenue_overview') || 'Revenue Overview'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Last 7 days performance</p>
              </div>
            </div>

            <div className="h-[280px] w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E84C3D" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#E84C3D" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150, 150, 150, 0.1)" />
                    <XAxis 
                      dataKey="shortDate" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(val: number) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        backgroundColor: '#111622', 
                        color: '#fff',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' 
                      }}
                      itemStyle={{ color: '#E84C3D', fontWeight: 'bold' }}
                      formatter={(value: any) => [`$${(Number(value) || 0).toFixed(2)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#E84C3D" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/[0.06] flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('recent_orders')}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest transactions from your storefront</p>
              </div>
              <Link 
                href="/admin/orders" 
                className="inline-flex items-center gap-1 text-xs font-bold text-[#E84C3D] hover:text-red-600 transition-colors"
              >
                <span>{t('view_all')}</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <th className="py-4 px-6">{t('order_id')}</th>
                    <th className="py-4 px-4">{t('customer')}</th>
                    <th className="py-4 px-4">{t('amount')}</th>
                    <th className="py-4 px-4">{t('payment')}</th>
                    <th className="py-4 px-6">{t('fulfillment')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03] text-sm font-medium">
                  {analytics.recentOrders?.map((order: any) => (
                    <tr key={order._id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-xs text-gray-800 dark:text-gray-200">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                        {order.customerId?.name || order.guestInfo?.name || 'Guest Customer'}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-gray-900 dark:text-white">
                        ${order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        {order.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300">
                            {isKm ? 'បានបង់ប្រាក់' : 'Paid'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {isKm ? 'រង់ចាំ' : 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED'
                            ? 'bg-[#D1FAE5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300'
                            : order.orderStatus === 'PROCESSING'
                            ? 'bg-[#FFEDD5] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {order.orderStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!analytics.recentOrders || analytics.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                        {t('no_recent_orders')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <p className="text-red-500 font-medium">{t('failed_analytics')}</p>
      )}
    </div>
  );
}
