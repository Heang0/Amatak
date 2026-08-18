'use client';

import { useTheme } from 'next-themes';
import { Menu, Moon, Sun, User as UserIcon, LogOut, Settings as SettingsIcon, ChevronDown, Search, Bell } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useRouter } from '@/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale } from 'next-intl';

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

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <header className="h-14 bg-white dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/[0.06] z-30 flex items-center shrink-0">
      <div className="w-full px-4 sm:px-5 flex items-center justify-between h-full gap-4">
        
        {/* Left: hamburger + search */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center gap-2 h-9 px-3 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] rounded-lg w-56 text-gray-400 focus-within:border-gray-400 dark:focus-within:border-white/20 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-white/5 transition-all">
            <Search size={14} className="text-gray-400 dark:text-white/25 shrink-0" />
            <input 
              type="text" 
              placeholder={locale === 'km' ? 'ស្វែងរក...' : 'Search...'}
              className="bg-transparent border-none outline-none w-full text-sm text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/25"
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white transition-colors"
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
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-white/80 max-w-[100px] truncate">{user.name || 'Admin'}</span>
                <ChevronDown size={14} className={`text-gray-400 dark:text-white/30 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#161616] rounded-xl shadow-xl border border-gray-100 dark:border-white/[0.08] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name || 'Admin User'}</p>
                    <p className="text-xs text-gray-500 dark:text-white/30 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link 
                      href="/admin/settings" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                    >
                      <SettingsIcon size={15} className="text-gray-400 dark:text-white/30" />
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
