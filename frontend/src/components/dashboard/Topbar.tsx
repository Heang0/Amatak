'use client';

import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, ChevronDown, Search, Bell, Package, Tag, ShoppingCart, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale } from 'next-intl';
import { useDebounce } from '@/hooks/useDebounce';

interface TopbarProps {
  onMenuClick: () => void;
  pageTitle: string;
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

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ products: any[], categories: any[], orders: any[] }>({ products: [], categories: [], orders: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
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
        const token = useAuthStore.getState().token;
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

  const toggleLanguage = () => {
    if (!pathname) return "/en";
    const newLocale = locale === "en" ? "km" : "en";
    let currentPath = pathname;
    if (currentPath.startsWith(`/${locale}`)) {
      currentPath = currentPath.replace(`/${locale}`, "");
    }
    if (!currentPath.startsWith('/')) currentPath = '/' + currentPath;
    return `/${newLocale}${currentPath}`;
  };

  const handleSearchResultClick = (path: string) => {
    setShowSearchResults(false);
    setSearchQuery('');
    router.push(path);
  };

  return (
    <header className="h-14 bg-white dark:bg-[#111111] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border-none z-30 flex items-center shrink-0 relative">
      <div className="w-full px-4 sm:px-5 flex items-center justify-between h-full gap-4">
        
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1 relative">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 /40 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div ref={searchRef} className="hidden md:flex flex-col relative w-64 md:w-80">
            <div className="flex items-center gap-2 h-9 px-3 bg-[#F4F7FE] dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-lg w-full text-gray-600 dark:text-gray-400 focus-within:border-gray-400 dark:focus-within:border-white/20 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-white/5 transition-all">
              <Search size={14} className="text-gray-600 dark:text-gray-400 /25 shrink-0" />
              <input 
                type="text" 
                placeholder={locale === 'km' ? 'ស្វែងរកផលិតផល ឬការបញ្ជាទិញ...' : 'Search products or orders...'}
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-white /80 placeholder-gray-400 dark:placeholder-white/25"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
              />
              {isSearching && <Loader2 size={14} className="animate-spin text-gray-400" />}
            </div>

            {/* Dropdown Results */}
            {showSearchResults && searchQuery.trim() !== '' && (
              <div className="absolute top-11 left-0 w-full md:w-[400px] bg-white dark:bg-[#080808] rounded-xl shadow-2xl border border-gray-100 dark:border-white/[0.05] overflow-hidden z-50">
                <div className="max-h-[60vh] overflow-y-auto py-2">
                  
                  {/* Products */}
                  {searchResults.products.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</div>
                      {searchResults.products.map(p => (
                        <button key={p._id} onClick={() => handleSearchResultClick(`/admin/products`)} className="w-full text-left px-4 py-2 hover:bg-[#F4F7FE] dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <Package size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name?.en || p.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {p.sku || 'N/A'} • ${p.price}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {searchResults.orders.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</div>
                      {searchResults.orders.map(o => (
                        <button key={o._id} onClick={() => handleSearchResultClick(`/admin/orders`)} className="w-full text-left px-4 py-2 hover:bg-[#F4F7FE] dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <ShoppingCart size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Order #{o.orderId}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{o.customerInfo?.name || 'Guest'} • ${o.totalAmount}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Categories */}
                  {searchResults.categories.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</div>
                      {searchResults.categories.map(c => (
                        <button key={c._id} onClick={() => handleSearchResultClick(`/admin/categories`)} className="w-full text-left px-4 py-2 hover:bg-[#F4F7FE] dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                          <Tag size={16} className="text-gray-400" />
                          <div className="flex-1 truncate">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name?.en || c.name}</p>
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

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 /40 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          {/* Language toggle */}
          <a
            href={toggleLanguage()}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            title="Toggle Language"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'} 
              alt={locale} 
              className="w-5 h-auto rounded-sm" 
            />
          </a>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

          {/* Profile dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E84C3D] to-[#c0392b] overflow-hidden flex items-center justify-center text-white text-xs font-bold ring-1 ring-gray-200 dark:ring-white/10">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || <UserIcon size={14} />
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white /80 max-w-[100px] truncate">{user.name || 'Admin'}</span>
                <ChevronDown size={14} className={`text-gray-600 dark:text-gray-400 /30 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#161616] rounded-xl shadow-xl border border-gray-100 dark:border-white/[0.08] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 /30 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link 
                      href="/admin/settings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-900 dark:text-white /70 hover:bg-[#F4F7FE] dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                      <SettingsIcon size={15} className="text-gray-600 dark:text-gray-400 /30" />
                      {locale === 'km' ? 'ការកំណត់' : 'Settings'}
                    </Link>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={15} />
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
