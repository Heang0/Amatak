'use client';

import { Link, usePathname } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { X, LogOut, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/navigation';

export type SidebarItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

interface SidebarProps {
  items: SidebarItem[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, title, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const locale = useLocale();
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreLogo = () => {
      if (user?.token && user?.role === 'store_admin') {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        .then(res => res.json())
        .then(data => {
          const myStore = data.find((s: any) => s.ownerId?._id === user._id || s.ownerId === user._id);
          if (myStore?.branding?.logoUrl) setStoreLogo(myStore.branding.logoUrl);
          if (myStore?.name) setStoreName(myStore.name);
        }).catch(console.error);
      }
    };
    fetchStoreLogo();
    window.addEventListener('storeUpdated', fetchStoreLogo);
    return () => window.removeEventListener('storeUpdated', fetchStoreLogo);
  }, [user]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — NextAdmin Theme */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] h-full bg-white dark:bg-[#111111] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none flex flex-col transform transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        {/* Store Brand */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-gray-100 dark:ring-white/10">
              {storeLogo ? (
                <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#E84C3D] flex items-center justify-center text-white text-xs font-black">
                  {(storeName || title || 'S').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{storeName || title}</p>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest leading-tight">Dashboard</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5">
          {/* Section label */}
          <p className="px-3 py-1 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
            {locale === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
          </p>
          {items.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/superadmin' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#E84C3D] text-white shadow-[0_4px_14px_rgba(232,76,61,0.25)]"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/[0.06]"
                }`}
              >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <ChevronRight size={16} className="text-white/80 shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-default">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E84C3D] to-[#c0392b] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm overflow-hidden ring-1 ring-gray-200 dark:ring-white/10">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'M'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Merchant'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
