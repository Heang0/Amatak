'use client';

import { X, Moon, Sun, Heart, ChevronDown, Home, ShoppingBag, Tag, Grid, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';

interface Category {
  _id: string;
  name: string;
  slug: string;
  nameKm?: string;
}

export default function StoreSidebarMenu({
  isOpen,
  onClose,
  storeName,
  storeLogo,
  primaryColor,
  locale,
  slug,
  categories = [],
  themeStyle = 'default',
}: {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  locale: string;
  slug: string;
  categories?: Category[];
  themeStyle?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Helper to preserve preview parameters
  const appendParams = (basePath: string) => {
    if (!searchParams) return basePath;
    const url = new URL(basePath, 'http://localhost');
    searchParams.forEach((val, key) => url.searchParams.set(key, val));
    return url.pathname + url.search;
  };

  // Clean paths — preserve preview parameters
  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting ? `/${locale}/store/${slug}` : `/${locale}`;

  const homeHref = appendParams(basePath);
  const cartHref = appendParams(`${basePath}/cart`);
  const profileHref = appendParams(`${basePath}/profile`);
  const favoritesHref = appendParams(`${basePath}/favorites`);
  const categoryTitle = locale === 'km' ? 'ប្រភេទតាមប្រភេទ' : 'Categories By Type';
  const homeLabel = locale === 'km' ? 'ទំព័រដើម' : 'Home';
  const productsLabel = locale === 'km' ? 'ផលិតផល' : 'Products';
  const promotionsLabel = locale === 'km' ? 'ប្រូម៉ូសិន' : 'Promotions';
  const allCategoriesLabel = locale === 'km' ? 'ប្រភេទទាំងអស់' : 'All Categories';
  const cartLabel = locale === 'km' ? 'កន្ត្រក' : 'Cart';
  const accountLabel = locale === 'km' ? 'គណនី' : 'Account';
  const favoritesLabel = locale === 'km' ? 'ចំណូលចិត្ត' : 'Favorites';
  
  const favorites = useFavoritesStore(state => state.favorites);
  const totalFavorites = favorites.length;

  const langHref = (() => {
    let basePath = `/${locale === 'en' ? 'km' : 'en'}`;
    if (pathname && pathname.startsWith(`/${locale}`)) {
      basePath = pathname.replace(`/${locale}`, `/${locale === 'en' ? 'km' : 'en'}`);
    }
    return appendParams(basePath);
  })();

  const getActiveStyle = (isActive: boolean) => {
    if (!isActive) return undefined;
    return primaryColor && primaryColor !== '#000000' && primaryColor !== '#000' ? { color: primaryColor } : undefined;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer — slides from right */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[70vw] sm:w-[320px] z-[100] bg-white dark:bg-[#111111] flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          themeStyle === 'neo-brutalism'
            ? 'border-l-[4px] border-black dark:border-white shadow-[-6px_0px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-6px_0px_0px_0px_rgba(255,255,255,1)] rounded-none'
            : themeStyle === 'minimalist'
            ? 'border-l border-gray-200 dark:border-gray-800'
            : 'shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="h-16 md:h-[72px] flex items-center justify-between px-5 md:px-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {storeLogo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-8 md:h-10 w-auto object-contain shrink-0" />
            )}
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight truncate">{storeName}</span>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 shrink-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X size={24} strokeWidth={1.5} className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto flex flex-col px-4 sm:px-6 pb-8">
          
          <div className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 mt-6 mb-2 uppercase tracking-widest px-2">
            {locale === 'km' ? 'ម៉ឺនុយ' : 'Menu'}
          </div>

          <Link href={homeHref} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <Home size={22} strokeWidth={1.5} className={`${pathname === `/${locale}` || pathname === '/' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname === `/${locale}` || pathname === '/')} />
            <span className={`text-[17px] text-gray-900 dark:text-white ${pathname === `/${locale}` || pathname === '/' ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname === `/${locale}` || pathname === '/')}>
              {homeLabel}
            </span>
          </Link>
          
          <Link href={appendParams(`${basePath}/products`)} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <ShoppingBag size={22} strokeWidth={1.5} className={`${pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/'))} />
            <span className={`text-[17px] text-gray-900 dark:text-white ${pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/'))}>
              {productsLabel}
            </span>
          </Link>
          
          <Link href={appendParams(`${basePath}/promotions`)} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <Tag size={22} strokeWidth={1.5} className={`${pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/'))} />
            <span className={`text-[17px] text-gray-900 dark:text-white ${pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/'))}>
              {promotionsLabel}
            </span>
          </Link>

          {categories.length > 0 && (
            <div className="flex flex-col border-b border-gray-100 dark:border-gray-800/60">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center justify-between px-2 py-3.5 group w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <Grid size={22} strokeWidth={1.5} className={`${pathname?.endsWith('/categories') || pathname?.includes('/category/') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/categories') || pathname?.includes('/category/'))} />
                  <span className={`text-[17px] text-gray-900 dark:text-white ${pathname?.endsWith('/categories') || pathname?.includes('/category/') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/categories') || pathname?.includes('/category/'))}>
                    {allCategoriesLabel}
                  </span>
                </div>
                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCategoriesOpen ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'}`}>
                <div className="ml-[42px] flex flex-col gap-1 border-l-2 border-gray-100 dark:border-gray-800/60 pl-4 py-1 my-1">
                  <Link
                    href={appendParams(`${basePath}/categories`)}
                    onClick={onClose}
                    className={`py-2 text-[15px] text-gray-900 dark:text-white transition-colors ${pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') ? 'font-semibold' : 'font-medium'}`}
                    style={getActiveStyle(pathname?.endsWith('/categories') || pathname?.endsWith('/categories/'))}
                  >
                    {locale === 'km' ? 'មើលទាំងអស់' : 'View All Categories'}
                  </Link>
                  {categories.map(cat => {
                    const isCatActive = pathname?.includes(`/category/${cat.slug}`);
                    return (
                      <Link
                        key={cat._id}
                        href={appendParams(`${basePath}/category/${cat.slug}`)}
                        onClick={onClose}
                        className={`py-2 text-[15px] text-gray-900 dark:text-white transition-colors break-words ${isCatActive ? 'font-semibold' : 'font-medium'}`}
                        style={getActiveStyle(isCatActive)}
                      >
                        {locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 mt-8 mb-2 uppercase tracking-widest px-2">
            {locale === 'km' ? 'គណនីរបស់អ្នក' : 'Your Account'}
          </div>

          <Link href={cartHref} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <ShoppingBag size={22} strokeWidth={1.5} className={`${pathname?.endsWith('/cart') || pathname?.endsWith('/cart/') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/cart') || pathname?.endsWith('/cart/'))} />
            <span className={`text-[17px] text-gray-900 dark:text-white ${pathname?.endsWith('/cart') || pathname?.endsWith('/cart/') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/cart') || pathname?.endsWith('/cart/'))}>
              {cartLabel}
            </span>
          </Link>
          
          <Link href={favoritesHref} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <Heart size={22} strokeWidth={1.5} className={`${pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/'))} />
            <span className={`text-[17px] text-gray-900 dark:text-white flex items-center flex-1 ${pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.endsWith('/favorites') || pathname?.endsWith('/favorites/'))}>
              {favoritesLabel}
              {totalFavorites > 0 && (
                <span className="ml-auto min-w-[22px] h-[22px] px-1.5 text-[11px] font-bold text-white bg-gray-900 dark:bg-white dark:text-black rounded-full flex items-center justify-center" style={primaryColor && primaryColor !== '#000000' && primaryColor !== '#000' ? { backgroundColor: primaryColor, color: '#fff' } : undefined}>
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </span>
          </Link>
          
          <Link href={profileHref} onClick={onClose} className="flex items-center gap-4 px-2 py-3.5 border-b border-gray-100 dark:border-gray-800/60 group">
            <User size={22} strokeWidth={1.5} className={`${pathname?.includes('/profile') ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400'} transition-colors`} style={getActiveStyle(pathname?.includes('/profile'))} />
            <span className={`text-[17px] text-gray-900 dark:text-white ${pathname?.includes('/profile') ? 'font-semibold' : 'font-medium'} transition-colors`} style={getActiveStyle(pathname?.includes('/profile'))}>
              {accountLabel}
            </span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="shrink-0 px-6 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-4 bg-gray-50 dark:bg-[#151515]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {locale === 'km' ? 'រចនាបថ' : 'Appearance'}
            </span>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-[#222] shadow-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white transition-all hover:scale-105 active:scale-95"
              >
                {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {locale === 'km' ? 'ភាសា' : 'Language'}
            </span>
            <a href={langHref} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#222] shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 active:scale-95 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'}
                alt={locale}
                className="w-5 h-auto rounded-[2px]"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-white">
                {locale === 'en' ? 'EN' : 'KH'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
