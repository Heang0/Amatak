'use client';

import { Link, usePathname } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { X, LogOut, Activity } from 'lucide-react';
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
  const isKm = locale === 'km';
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
    const isSuperadmin = user?.role === 'superadmin';
    logout();
    if (isSuperadmin) {
      router.push('/superadmin/login');
    } else {
      router.push('/admin/login');
    }
  };

  // Separate main items from settings/secondary items
  const mainItems = items.filter(item => !item.href.includes('settings') && !item.href.includes('upgrade'));
  const bottomItems = items.filter(item => item.href.includes('settings') || item.href.includes('upgrade'));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Modern Sleek Charcoal Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] h-full bg-[#111622] text-white flex flex-col justify-between shrink-0 select-none transform transition-transform duration-200 ease-out border-r border-white/[0.06] ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-none bg-gradient-to-tr from-[#E84C3D] to-red-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0 overflow-hidden ring-1 ring-white/20">
                {storeLogo ? (
                  <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Activity size={18} strokeWidth={2.5} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate tracking-tight">
                  {storeName || title || 'Amatak'}
                </p>
                <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase truncate">
                  {user?.role === 'superadmin' ? (isKm ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់' : 'Super Admin') : (isKm ? 'ផ្ទាំងគ្រប់គ្រងហាង' : 'Merchant Hub')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-none transition-colors"
              title="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary Navigation Items */}
          <nav className="p-4 space-y-1">
            {mainItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/superadmin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-none text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-gray-900 shadow-md shadow-black/10 font-bold"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Secondary Items + User Info + Logout */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          {/* Secondary Nav (Settings, Upgrade, etc.) */}
          {bottomItems.length > 0 && (
            <div className="space-y-1 mb-2">
              {bottomItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/superadmin' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3.5 px-4 py-2.5 rounded-none text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-gray-900 shadow-md shadow-black/10 font-bold"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Clean Logout Button (Matching reference bottom) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-semibold text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span>{isKm ? 'ចាកចេញ' : 'Log out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
