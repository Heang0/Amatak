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

      {/* Sidebar — dark, premium */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[240px] bg-[#0f0f0f] border-r border-white/[0.06]
        flex flex-col transform transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* Store Brand */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
              {storeLogo ? (
                <img src={storeLogo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#E84C3D] flex items-center justify-center text-white text-xs font-black">
                  {(storeName || title || 'S').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{storeName || title}</p>
              <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest leading-tight">Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 text-white/40 hover:text-white rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Section label */}
          <p className="px-3 py-1.5 text-[10px] font-bold text-white/25 uppercase tracking-widest">
            {locale === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
          </p>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative
                  ${isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/90 hover:bg-white/[0.05]"}
                `}
              >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-[#E84C3D]' : 'text-white/40 group-hover:text-white/70'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E84C3D] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.05] transition-colors group cursor-default">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E84C3D] to-[#c0392b] flex items-center justify-center text-white text-xs font-black shrink-0 ring-1 ring-white/10 overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'M'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Merchant'}</p>
              <p className="text-[10px] text-white/30 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-white/25 hover:text-red-400 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
