'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Download, Package } from 'lucide-react';

export default function ReportsPage() {
  const t = useTranslations('Dashboard');
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const isKm = params?.locale === 'km';
  
  const [days, setDays] = useState(7);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch reports data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchReportsData();
    }
  }, [user, days]);

  const handleExport = () => {
    if (!data?.topProducts) return;
    
    // Create CSV content
    const headers = ['Product ID', 'Product Title', 'SKU', 'Quantity Sold', 'Revenue Generated'];
    const rows = data.topProducts.map((p: any) => {
      const productTitle = p._id?.title ? `"${p._id.title.replace(/"/g, '""')}"` : 'Unknown';
      const sku = p._id?.sku || 'N/A';
      return [
        p._id?._id || '',
        productTitle,
        sku,
        p.totalQuantitySold,
        p.totalRevenueGenerated
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `store_report_${days}_days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    {
      title: isKm ? 'ប្រាក់ចំណូលសរុប' : 'Total Revenue',
      value: `$${(data?.totalRevenue || 0).toFixed(2)}`,
      icon: <DollarSign size={24} className="text-[#E84C3D]" />,
      bg: 'bg-red-50 dark:bg-[#E84C3D]/10'
    },
    {
      title: isKm ? 'ការបញ្ជាទិញសរុប' : 'Total Orders',
      value: data?.totalOrders || 0,
      icon: <ShoppingCart size={24} className="text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      title: isKm ? 'តម្លៃមធ្យម' : 'Average Order Value',
      value: `$${(data?.averageOrderValue || 0).toFixed(2)}`,
      icon: <TrendingUp size={24} className="text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isKm ? 'របាយការណ៍ និងស្ថិតិ' : 'Reports & Analytics'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isKm ? 'ពិនិត្យមើលដំណើរការលក់ និងប្រាក់ចំណូលរបស់អ្នក។' : 'Analyze your sales performance and revenue.'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select 
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-none text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#E84C3D] shadow-sm cursor-pointer"
          >
            <option value={7}>{isKm ? '៧ ថ្ងៃចុងក្រោយ' : 'Last 7 Days'}</option>
            <option value={30}>{isKm ? '៣០ ថ្ងៃចុងក្រោយ' : 'Last 30 Days'}</option>
            <option value={90}>{isKm ? '៩០ ថ្ងៃចុងក្រោយ' : 'Last 90 Days'}</option>
            <option value={365}>{isKm ? '១ ឆ្នាំចុងក្រោយ' : 'Last 365 Days'}</option>
          </select>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#E84C3D] text-white rounded-none text-sm font-bold shadow-sm hover:bg-red-600 transition-colors"
          >
            <Download size={16} />
            {isKm ? 'ទាញយក CSV' : 'Export CSV'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E84C3D]"></div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statCards.map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111111] rounded-none p-6 border border-gray-100 dark:border-white/10 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                    <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-none ${stat.bg}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-[#111111] p-6 rounded-none border border-gray-100 dark:border-white/10 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              {isKm ? 'ដំណើរការប្រាក់ចំណូល' : 'Revenue Performance'}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E84C3D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E84C3D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#E84C3D" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-white dark:bg-[#111111] rounded-none border border-gray-100 dark:border-white/10 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {isKm ? 'ផលិតផលលក់ដាច់បំផុត' : 'Top Selling Products'}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                <thead className="bg-gray-50 dark:bg-[#0a0a0a]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ផលិតផល' : 'Product'}</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ចំនួនដែលបានលក់' : 'Quantity Sold'}</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ប្រាក់ចំណូលសរុប' : 'Total Revenue'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {(!data?.topProducts || data.topProducts.length === 0) ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Package size={48} className="mb-4 opacity-20" />
                          <p className="text-sm">{isKm ? 'មិនមានទិន្នន័យលក់សម្រាប់រយៈពេលនេះទេ។' : 'No sales data for this period.'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.topProducts.map((item: any, idx: number) => (
                      <tr key={item._id?._id || idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-white/10">
                              {item._id?.imageUrl ? (
                                <img className="h-10 w-10 object-cover" src={item._id.imageUrl} alt="" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{item._id?.title || 'Unknown Product'}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item._id?.sku || 'No SKU'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 dark:text-white">
                          {item.totalQuantitySold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ${(item.totalRevenueGenerated || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
