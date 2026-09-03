'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LayoutDashboard, Store, Tag, Settings, Users } from 'lucide-react';

export default function SuperadminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const router = useRouter();
 const user = useAuthStore((state) => state.user);
 const [isHydrated, setIsHydrated] = useState(false);

 const pathname = usePathname();
 const isLoginPage = pathname.includes('/superadmin/login');

 useEffect(() => {
  const timer = setTimeout(() => {
   setIsHydrated(true);
  }, 100);
  return () => clearTimeout(timer);
 }, []);

 useEffect(() => {
  if (isHydrated && !isLoginPage) {
   if (!user || user.role !== 'superadmin') {
    router.push('/superadmin/login');
   }
  }
 }, [user, router, isHydrated, isLoginPage]);

 if (isLoginPage) {
  return <>{children}</>;
 }

 if (!isHydrated || !user || user.role !== 'superadmin') {
  return (
   <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE] dark:bg-[#0a0a0a]">
    <div className="animate-spin rounded-none h-8 w-8 border-t-2 border-b-2 border-[#E84C3D]"></div>
   </div>
  );
 }

 const sidebarItems = [
  { label: 'Dashboard', href: '/superadmin', icon: <LayoutDashboard size={20} /> },
  { label: 'Users', href: '/superadmin/users', icon: <Users size={20} /> },
  { label: 'Manage Plans', href: '/superadmin/plans', icon: <Tag size={20} /> },
  { label: 'Stores & Subscriptions', href: '/superadmin/stores', icon: <Store size={20} /> },
  { label: 'Settings', href: '/superadmin/settings', icon: <Settings size={20} /> },
 ];

 return (
  <DashboardLayout sidebarItems={sidebarItems} title="Superadmin Panel">
   {children}
  </DashboardLayout>
 );
}
