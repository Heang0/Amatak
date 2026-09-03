'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LayoutDashboard, Settings, Package, ShoppingCart, ArrowUpCircle, Monitor, Layers, Tags, Users, Box, BarChart3 } from 'lucide-react';

import { useTranslations, useLocale } from 'next-intl';

export default function StoreAdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const [isHydrated, setIsHydrated] = useState(false);
 const t = useTranslations('Dashboard');
 const locale = useLocale();

 useEffect(() => {
 // Wait a brief moment to ensure Zustand has hydrated from localStorage
 const timer = setTimeout(() => {
  setIsHydrated(true);
 }, 100);
 return () => clearTimeout(timer);
 }, []);

 useEffect(() => {
 if (isHydrated) {
  if (!user || user.role !== 'store_admin') {
  router.push('/admin/login');
  }
 }
 }, [user, router, isHydrated]);

 if (!isHydrated || !user || user.role !== 'store_admin') {
 return (
  <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] dark:bg-[#080808]">
  <div className="animate-spin rounded-none h-8 w-8 border-t-2 border-b-2 border-[#E84C3D]"></div>
  </div>
 );
 }

 const sidebarItems = [
 { label: t('dashboard'), href: '/admin', icon: <LayoutDashboard size={20} /> },
 { label: locale === 'km' ? 'របាយការណ៍' : 'Reports', href: '/admin/reports', icon: <BarChart3 size={20} /> },
 { label: locale === 'km' ? 'អតិថិជន' : 'Customers', href: '/admin/customers', icon: <Users size={20} /> },
 { label: t('categories'), href: '/admin/categories', icon: <Layers size={20} /> },
 { label: t('manage_products'), href: '/admin/products', icon: <Package size={20} /> },
 { label: locale === 'km' ? 'ស្តុក' : 'Inventory', href: '/admin/inventory', icon: <Box size={20} /> },
 { label: locale === 'km' ? 'ប្រូម៉ូសិន' : 'Promotions', href: '/admin/promotions', icon: <Tags size={20} /> },
 { label: t('order_tracking'), href: '/admin/orders', icon: <ShoppingCart size={20} /> },
 { label: t('upgrade_plan'), href: '/admin/upgrade', icon: <ArrowUpCircle size={20} /> },
 { label: t('settings'), href: '/admin/settings', icon: <Settings size={20} /> },
 ];

 return (
 <DashboardLayout sidebarItems={sidebarItems} title={t('merchant_panel')}>
  {children}
 </DashboardLayout>
 );
}
