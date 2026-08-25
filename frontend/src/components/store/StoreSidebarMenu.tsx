'use client';

import { X, Moon, Sun, Bookmark, ChevronDown, ShoppingBag, User, ArrowRight } from 'lucide-react';
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
  parentCategory?: string | null;
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
  themeStyle = 'fashion-editorial',
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
  const isKm = locale === 'km';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const appendParams = (basePath: string) => {
    if (!searchParams) return basePath;
    const url = new URL(basePath, 'http://localhost');
    searchParams.forEach((val, key) => url.searchParams.set(key, val));
    return url.pathname + url.search;
  };

  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting ? `/${locale}/store/${slug}` : `/${locale}`;

  const homeHref = appendParams(basePath);
  const cartHref = appendParams(`${basePath}/cart`);
  const profileHref = appendParams(`${basePath}/profile`);
  const favoritesHref = appendParams(`${basePath}/favorites`);
  const homeLabel = isKm ? 'ទំព័រដើម' : 'HOME';
  const productsLabel = isKm ? 'ផលិតផល' : 'COLLECTION';
  const promotionsLabel = isKm ? 'ប្រូម៉ូសិន' : 'OFFERS & PROMOTIONS';
  const allCategoriesLabel = isKm ? 'ប្រភេទទាំងអស់' : 'CATEGORIES';
  const cartLabel = isKm ? 'កន្ត្រក' : 'SHOPPING BAG';
  const accountLabel = isKm ? 'គណនី' : 'ACCOUNT';
  const favoritesLabel = isKm ? 'ចំណូលចិត្ត' : 'SAVED ITEMS';
  
  const linkTextClass = `text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`;

  const langHref = (() => {
    let base = `/${locale === 'en' ? 'km' : 'en'}`;
    if (pathname && pathname.startsWith(`/${locale}`)) {
      base = pathname.replace(`/${locale}`, `/${locale === 'en' ? 'km' : 'en'}`);
    }
    return appendParams(base);
  })();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[99] bg-black/50 backdrop-blur-2xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer — Full screen on mobile, sleek 380px drawer on tablet/desktop */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-[100] bg-white dark:bg-[#111318] flex flex-col transform transition-transform duration-300 ease-in-out sm:border-l border-gray-100 dark:border-white/[0.08] shadow-2xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {storeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 sm:h-8 w-auto object-contain shrink-0" />
            ) : (
              <span className={`text-base font-extrabold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white truncate`}>{storeName}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 -mr-1 text-gray-800 dark:text-white hover:opacity-60 transition-opacity" title="Close">
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto flex flex-col px-4 md:px-6 py-6 space-y-1">
          
          <div className={`text-[11px] font-bold text-gray-400 ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} mb-3`}>
            {isKm ? 'ម៉ឺនុយ' : 'MENU'}
          </div>

          <Link href={homeHref} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{homeLabel}</span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>
          
          <Link href={appendParams(`${basePath}/products`)} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{productsLabel}</span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>
          
          <Link href={appendParams(`${basePath}/promotions`)} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{promotionsLabel}</span>
            <ArrowRight size={14} className="text-gray-400" />
          </Link>

          {/* Categories Dropdown */}
          {categories.length > 0 && (
            <div className="flex flex-col border-b border-gray-50 dark:border-white/[0.04]">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity w-full text-left"
              >
                <span className={linkTextClass}>{allCategoriesLabel}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`flex flex-col overflow-hidden transition-all duration-200 ${isCategoriesOpen ? 'max-h-[500px] opacity-100 pb-3' : 'max-h-0 opacity-0'}`}>
                <div className="pl-3 border-l border-gray-200 dark:border-white/10 space-y-2 py-1">
                  {categories.filter(c => !c.parentCategory).map(mainCat => {
                    return (
                      <Link
                        key={mainCat._id}
                        href={appendParams(`${basePath}/category/${mainCat.slug}`)}
                        onClick={onClose}
                        className={`block text-xs ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white py-1`}
                      >
                        {isKm && mainCat.nameKm ? mainCat.nameKm : mainCat.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className={`text-[11px] font-bold text-gray-400 ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} pt-6 mb-3`}>
            {isKm ? 'គណនី' : 'USER'}
          </div>

          <Link href={cartHref} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{cartLabel}</span>
            <ShoppingBag size={15} className="text-gray-400" />
          </Link>
          
          <Link href={favoritesHref} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{favoritesLabel}</span>
            <Bookmark size={15} className="text-gray-400" />
          </Link>

          <Link href={profileHref} onClick={onClose} className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] hover:opacity-70 transition-opacity">
            <span className={linkTextClass}>{accountLabel}</span>
            <User size={15} className="text-gray-400" />
          </Link>

        </nav>

        {/* Footer Actions (Theme & Language) */}
        <div className="p-6 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-gray-50/50 dark:bg-black/20">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          )}

          <Link
            href={langHref}
            className="p-1 hover:opacity-60 transition-opacity"
            title={locale === 'en' ? 'Switch to Khmer' : 'Switch to English'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'} 
              alt={locale} 
              className="w-5 h-auto rounded-none shadow-2xs" 
            />
          </Link>
        </div>
      </div>
    </>
  );
}
