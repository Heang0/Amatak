'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Store, CreditCard, DollarSign, Users, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { Link } from '@/navigation';

export default function SuperadminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ totalStores: 0, activeSubscriptions: 0, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/dashboard`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchStats();
  }, [user?.token]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Superadmin Overview
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Platform-wide metrics, tenant stores, and revenue analytics.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none ">
          <div className="w-8 h-8 border-3 border-red-500/20 border-t-[#E84C3D] rounded-none animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading platform statistics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Total Stores */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-none bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Store className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-none ">
                Active Tenants
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Stores</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {stats.totalStores}
            </h3>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-none bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-none ">
                <ShieldCheck className="w-3.5 h-3.5" /> Paid Subscriptions
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Subscriptions</p>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              {stats.activeSubscriptions}
            </h3>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-none bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-none ">
                <TrendingUp className="w-3.5 h-3.5" /> MRR
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Revenue</p>
            <h3 className="text-3xl font-extrabold text-[#E84C3D] mt-1">
              ${stats.monthlyRevenue.toFixed(2)}
            </h3>
          </div>

        </div>
      )}
    </div>
  );
}
