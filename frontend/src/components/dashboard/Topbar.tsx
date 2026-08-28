'use client';

import { useTheme } from 'next-themes';
import { 
  Menu, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, 
  ChevronDown, Search, Bell, Package, Tag, ShoppingCart, Loader2,
  CheckCheck, ShoppingBag, AlertTriangle, AlertCircle, Clock, ExternalLink, X
} from 'lucide-react';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, usePathname, useRouter } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';

interface TopbarProps {
  onMenuClick: () => void;
  pageTitle: string;
}

interface NotificationItem {
  id: string;
  type: 'order' | 'stock' | 'plan' | 'store' | 'user';
  title: string;
  message: string;
  time: string;
  status?: string;
  paymentStatus?: string;
  link: string;
}

export function Topbar({ onMenuClick, pageTitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const isKm = locale === 'km';

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ products: any[], categories: any[], orders: any[] }>({ products: [], categories: [], orders: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'alert'>('all');
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load read notification IDs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amatak_read_notifications');
      if (saved) setReadNotificationIds(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // Fetch real notifications
  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchNotifications();

    // Live auto-polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults({ products: [], categories: [], orders: [] });
        return;
      }

      setIsSearching(true);
      try {
        const token = useAuthStore.getState().user?.token;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/search?q=${encodeURIComponent(debouncedSearchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.data);
        }
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  const handleSearchResultClick = (path: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(path);
  };

  // Notification Helpers
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !readNotificationIds.includes(n.id)).length;
  }, [notifications, readNotificationIds]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotificationIds(allIds);
    try {
      localStorage.setItem('amatak_read_notifications', JSON.stringify(allIds));
    } catch (e) {}
  };

  const markOneAsRead = (id: string, link: string) => {
    if (!readNotificationIds.includes(id)) {
      const updated = [...readNotificationIds, id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('amatak_read_notifications', JSON.stringify(updated));
      } catch (e) {}
    }
    setIsNotifOpen(false);
    router.push(link);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'order') return n.type === 'order';
      if (notifFilter === 'alert') return n.type !== 'order';
      return true;
    });
  }, [notifications, notifFilter]);

  const formatTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return isKm ? 'ទើបតែឥឡូវ' : 'Just now';
    if (diffMins < 60) return `${diffMins}m ${isKm ? 'មុន' : 'ago'}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${isKm ? 'មុន' : 'ago'}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${isKm ? 'មុន' : 'ago'}`;
  };

  return (
    <header className="h-16 bg-white dark:bg-[#111622] border-b border-gray-200/70 dark:border-white/[0.06] z-30 flex items-center shrink-0 relative transition-colors">
      <div className="w-full px-6 sm:px-8 flex items-center justify-between h-full gap-4">
        
        {/* Left: Mobile hamburger + Global Search */}
        <div className="flex items-center gap-4 flex-1 relative">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-none text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div ref={searchRef} className="hidden md:flex flex-col relative w-64 md:w-80">
            <div className="flex items-center gap-2.5 h-10 px-3.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-none w-full text-gray-600 dark:text-gray-400 focus-within:border-gray-400 dark:focus-within:border-white/20 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-white/5 transition-all">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input 
                type="text" 
                placeholder={locale === 'km' ? 'ស្វែងរកផលិតផល ឬការបញ្ជាទិញ...' : 'Search anything...'}
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
              />
              {isSearching && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>

            {/* Dropdown Results */}
            {showSearchResults && searchQuery.trim() !== '' && (
              <div className="absolute top-12 left-0 w-full md:w-[420px] bg-white dark:bg-[#161922] rounded-none shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden z-50">
                <div className="max-h-[60vh] overflow-y-auto py-2">
                  {/* Products */}
                  {searchResults.products.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Products</div>
                      {searchResults.products.map(p => (
                        <button key={p._id} onClick={() => handleSearchResultClick(`/admin/products`)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <Package size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.name?.en || p.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {p.sku || 'N/A'} • ${p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {searchResults.orders.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</div>
                      {searchResults.orders.map(o => (
                        <button key={o._id} onClick={() => handleSearchResultClick(`/admin/orders`)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <ShoppingCart size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Order #{o.orderId || o._id?.substring(0, 8)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{o.customerInfo?.name || 'Guest'} • ${o.totalAmount}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {searchResults.categories.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</div>
                      {searchResults.categories.map(c => (
                        <button key={c._id} onClick={() => handleSearchResultClick(`/admin/categories`)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <Tag size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{c.name?.en || c.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {!isSearching && searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.categories.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Floating action icons + Notification Center + Profile Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* REAL DYNAMIC NOTIFICATION CENTER */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-10 h-10 rounded-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors relative"
              title="Notifications"
            >
              <Bell size={18} />
              
              {/* Dynamic Unread Badge */}
              {unreadCount > 0 && (
                <span className="min-w-4 h-4 px-1 rounded-none bg-[#E84C3D] text-white text-[10px] font-black flex items-center justify-center absolute -top-1 -right-1 shadow-md shadow-red-500/30 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Floating Notification Drawer Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#13161F] border border-gray-200/90 dark:border-white/[0.08] rounded-none shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {isKm ? 'ការជូនដំណឹង' : 'Notifications'}
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#E84C3D]/10 text-[#E84C3D] dark:bg-red-950/40 dark:text-red-400">
                        {unreadCount} {isKm ? 'ថ្មី' : 'new'}
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      <CheckCheck size={13} />
                      <span>{isKm ? 'អានទាំងអស់' : 'Mark all read'}</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/70 dark:bg-[#171B26] border-b border-gray-100 dark:border-white/[0.04] text-xs font-bold">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-3 py-1 rounded-none transition-colors ${
                      notifFilter === 'all'
                        ? 'bg-white dark:bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {isKm ? 'ទាំងអស់' : 'All'}
                  </button>
                  <button
                    onClick={() => setNotifFilter('order')}
                    className={`px-3 py-1 rounded-none transition-colors ${
                      notifFilter === 'order'
                        ? 'bg-white dark:bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {isKm ? 'ការបញ្ជាទិញ' : 'Orders'}
                  </button>
                  <button
                    onClick={() => setNotifFilter('alert')}
                    className={`px-3 py-1 rounded-none transition-colors ${
                      notifFilter === 'alert'
                        ? 'bg-white dark:bg-white text-gray-900 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {isKm ? 'ការដាស់តឿន' : 'Alerts'}
                  </button>
                </div>

                {/* Notification List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 dark:divide-white/[0.03]">
                  {filteredNotifications.map((notif) => {
                    const isUnread = !readNotificationIds.includes(notif.id);

                    return (
                      <div
                        key={notif.id}
                        onClick={() => markOneAsRead(notif.id, notif.link)}
                        className={`p-4 flex items-start gap-3.5 cursor-pointer transition-all hover:bg-gray-50/80 dark:hover:bg-white/[0.03] ${
                          isUnread ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                        }`}
                      >
                        {/* Notification Icon */}
                        <div className={`w-9 h-9 rounded-none flex items-center justify-center shrink-0 shadow-xs ${
                          notif.type === 'order'
                            ? (notif.paymentStatus === 'PAID' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300')
                            : notif.type === 'stock'
                            ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                        }`}>
                          {notif.type === 'order' && <ShoppingBag size={16} />}
                          {notif.type === 'stock' && <Package size={16} />}
                          {notif.type === 'plan' && <AlertTriangle size={16} />}
                          {notif.type === 'store' && <ShoppingBag size={16} />}
                          {notif.type === 'user' && <UserIcon size={16} />}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className={`text-xs font-bold truncate ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                              {formatTimeAgo(notif.time)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>

                        {/* Unread indicator dot */}
                        {isUnread && (
                          <span className="w-2 h-2 rounded-none bg-[#E84C3D] shrink-0 mt-1.5 ring-2 ring-white dark:ring-gray-900" />
                        )}
                      </div>
                    );
                  })}

                  {filteredNotifications.length === 0 && (
                    <div className="py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-none bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto text-gray-400 mb-2">
                        <CheckCheck size={20} />
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {isKm ? 'មិនមានការជូនដំណឹងថ្មីទេ' : 'All caught up!'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {isKm ? 'អ្នកនឹងទទួលបានការជូនដំណឹងនៅពេលមានការបញ្ជាទិញថ្មី' : 'New orders and stock alerts will appear here.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="p-3 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#171B26] text-center">
                  <Link
                    href="/admin/orders"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-[#E84C3D] hover:underline"
                  >
                    {isKm ? 'មើលការបញ្ជាទិញទាំងអស់' : 'View all orders'} &rarr;
                  </Link>
                </div>

              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {/* Language toggle */}
          <Link
            href={pathname}
            locale={locale === 'en' ? 'km' : 'en'}
            className="w-10 h-10 rounded-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
            title="Toggle Language"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'} 
              alt={locale} 
              className="w-5 h-auto rounded-none shadow-xs" 
            />
          </Link>

          {/* User Profile Pill (Avatar + Name + Email) */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-none bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-all"
              >
                <div className="w-8 h-8 rounded-none bg-gradient-to-tr from-[#E84C3D] to-red-400 overflow-hidden flex items-center justify-center text-white text-xs font-black shadow-sm ring-1 ring-gray-200 dark:ring-white/10 shrink-0">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || <UserIcon size={14} />
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{user.name || 'Admin'}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161922] rounded-none shadow-2xl border border-gray-100 dark:border-white/[0.08] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link 
                      href="/admin/settings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.05] rounded-none transition-colors"
                    >
                      <SettingsIcon size={16} className="text-gray-400" />
                      {locale === 'km' ? 'ការកំណត់' : 'Settings'}
                    </Link>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-none transition-colors"
                    >
                      <LogOut size={16} />
                      {locale === 'km' ? 'ចាកចេញ' : 'Log out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
