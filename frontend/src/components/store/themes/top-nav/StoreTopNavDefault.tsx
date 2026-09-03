'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ChevronLeft, Moon, Sun, Menu, ShoppingCart, ShoppingBag, Search, Bookmark, ChevronDown, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StoreSidebarMenu from '../../StoreSidebarMenu';
import StoreSearchModal from '../../StoreSearchModal';
import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';

interface Category {
  _id: string;
  name: string;
  slug: string;
  nameKm?: string;
}

export default function StoreTopNavDefault({ storeName, storeLogo, primaryColor, slug, locale, initialThemeStyle }: {
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  slug: string;
  locale: string;
  initialThemeStyle?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themeStyle, setThemeStyle] = useState('default');
  const [logoUrl, setLogoUrl] = useState(storeLogo || '');

  const items = useCartStore(state => state.items);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const setDrawerOpen = useCartStore(state => state.setDrawerOpen);
  const favorites = useFavoritesStore(state => state.favorites);
  const totalFavorites = favorites.length;

  useEffect(() => {
    setMounted(true);
    const loadCategories = async () => {
      try {
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`);
        if (!storeRes.ok) return;
        const store = await storeRes.json();
        
        const previewTheme = searchParams.get('theme');
        setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        if (store.branding?.logoUrl) setLogoUrl(store.branding.logoUrl);

        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/store/${store._id}`);
        if (catRes.ok) {
          const cats = await catRes.json();
          setCategories(cats || []);
        }
      } catch (e) { /* silent */ }
    };
    loadCategories();
  }, [slug]);

  // Clean paths — middleware rewrites subdomain paths automatically
  const previewTheme = searchParams.get('theme');
  const previewColor = searchParams.get('color');

  const appendParams = (href: string) => {
    if (!previewTheme && !previewColor) return href;
    const url = new URL(href, 'http://localhost');
    if (previewTheme) url.searchParams.set('theme', previewTheme);
    if (previewColor) url.searchParams.set('color', previewColor);
    return `${url.pathname}${url.search}`;
  };

  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting ? `/${locale}/store/${slug}` : `/${locale}`;

  const homeHref = appendParams(basePath);
  const profileHref = appendParams(`${basePath}/profile`);
  const favoritesHref = appendParams(`${basePath}/favorites`);
  // isHome: either the root, /km, or the store path
  const isCategoryPage = pathname?.includes('/category/');
  const isHome = (pathname === `/${locale}` || pathname === '/' || pathname === `/${locale}/` || pathname === basePath || pathname === `${basePath}/`) && !isCategoryPage;

  // Language toggle — swap locale prefix
  const langHref = (() => {
    let base = '';
    if (!pathname) {
      base = `/${locale === 'en' ? 'km' : 'en'}`;
    } else {
      const newLocale = locale === 'en' ? 'km' : 'en';
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        base = pathname.replace(`/${locale}`, `/${newLocale}`);
      } else {
        base = pathname === '/' ? `/${newLocale}` : `/${newLocale}${pathname}`;
      }
    }
    return appendParams(base);
  })();

  const getNavTheme = (theme: string, loc: string) => {
    switch (theme) {
      case 'neo-brutalism':
        return {
          base: `text-sm font-black ${loc === 'km' ? 'tracking-normal' : 'uppercase tracking-tight'} transition-all`,
          active: 'text-black dark:text-white border-b-[3px] border-black dark:border-white pb-0.5',
          inactive: 'text-gray-400 hover:text-black dark:hover:text-white'
        };

      case 'skincare-clean':
        return {
          base: `text-[13px] font-medium ${loc === 'km' ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all`,
          active: 'text-[#222] dark:text-[#FFF] border-b border-[#222] dark:border-[#FFF] pb-1',
          inactive: 'text-[#999] hover:text-[#222] dark:hover:text-[#FFF]'
        };
      case 'default':
        return {
          base: `text-sm font-bold ${loc === 'km' ? 'tracking-normal' : ''} transition-colors`,
          active: 'text-gray-900 dark:text-white',
          inactive: 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
        };
      case 'skincare-clean':
        return {
          base: `text-xs font-medium uppercase tracking-widest transition-colors`,
          active: 'text-[#333] dark:text-[#E5E5E5]',
          inactive: 'text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5]'
        };
      case 'fashion-editorial':
      default:
        return {
          base: `text-xs font-bold ${loc === 'km' ? 'tracking-normal' : 'uppercase tracking-widest'} transition-colors`,
          active: 'text-black dark:text-white font-extrabold',
          inactive: 'text-gray-500 hover:text-black dark:hover:text-white'
        };
    }
  };

  const navTheme = getNavTheme(themeStyle, locale);

  let headerClass = "sticky top-0 z-50 ";
  if ('default' === 'skincare-clean') {
    headerClass += "bg-[#FAF9F6] dark:bg-[#0C0C0C] border-b border-[#E5E5E5] dark:border-[#222]";
  } else if ('default' === 'neo-brutalism') {
    headerClass += "bg-white dark:bg-[#111] border-b-[3px] border-black dark:border-white shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0px_4px_0px_0px_rgba(255,255,255,1)]";
  } else if ('default' === 'fashion-editorial' || 'default' === 'minimalist') {
    headerClass += "bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800";
  } else {
    // default (Modern Retail)
    headerClass += "bg-white/90 dark:bg-[#111318]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5";
  }

  return (
    <>
    <header className={headerClass}>

      {/* Top bar */}
      <div className="h-14 md:h-16 flex items-center px-4 md:px-8">

        {/* MOBILE Left: logo + store name */}
        <Link href={homeHref} className="flex-1 flex justify-start items-center gap-2.5 md:hidden overflow-hidden py-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 sm:h-8 w-auto object-contain shrink-0" />
          ) : (
            <span className="text-base font-extrabold uppercase tracking-wider text-gray-900 dark:text-white truncate">
              {storeName}
            </span>
          )}
        </Link>

        {/* MOBILE Right: search + cart + hamburger */}
        <div className="flex md:hidden shrink-0 items-center justify-end gap-1.5">
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity"
            title="Search"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>
          
          <button 
            onClick={() => setDrawerOpen(true)} 
            className="relative p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity"
            title="Cart"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span 
                className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 text-[8px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-none flex items-center justify-center leading-none"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-1 text-gray-800 dark:text-white hover:opacity-60 transition-opacity active:scale-95"
            aria-label="Open Menu"
          >
            <Menu size={21} strokeWidth={1.5} />
          </button>
        </div>

        {/* DESKTOP Left: logo */}
        <Link href={homeHref} className="hidden md:flex items-center gap-2.5 shrink-0 mr-8">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 sm:h-8 w-auto object-contain shrink-0" />
          ) : (
            <span className="text-lg font-extrabold uppercase tracking-wider text-gray-900 dark:text-white whitespace-nowrap">
              {storeName}
            </span>
          )}
        </Link>

        {/* DESKTOP Center: main nav */}
        <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
          <Link
            href={homeHref}
            className={`${navTheme.base} ${isHome ? navTheme.active : navTheme.inactive}`}
          >
            {locale === 'km' ? 'ទំព័រដើម' : 'Home'}
          </Link>
          <Link
            href={appendParams(`${basePath}/products`)}
            className={`${navTheme.base} ${
              pathname?.endsWith('/products') || pathname?.endsWith('/products/') || pathname?.includes('/product/') 
                ? navTheme.active 
                : navTheme.inactive
            }`}
          >
            {locale === 'km' ? 'ផលិតផល' : 'Collection'}
          </Link>
          <Link
            href={appendParams(`${basePath}/promotions`)}
            className={`${navTheme.base} ${
              pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/')
                ? navTheme.active
                : navTheme.inactive
            }`}
          >
            {locale === 'km' ? 'ប្រូម៉ូសិន' : 'Offers'}
          </Link>

          {/* Categories Dropdown */}
          <div className="relative group">
            <Link
              href={appendParams(`${basePath}/categories`)}
              className={`flex items-center gap-1 py-2 ${navTheme.base} ${
                pathname?.endsWith('/categories') || pathname?.endsWith('/categories/') || pathname?.includes('/category/')
                  ? navTheme.active
                  : navTheme.inactive
              }`}
            >
              <span>{locale === 'km' ? 'ប្រភេទ' : 'Categories'}</span>
              <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
            </Link>
            
            {/* Dropdown Menu */}
            {categories.length > 0 && (
              <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] rounded-none shadow-2xl py-2 min-w-[220px] flex flex-col">
                  {categories.map((cat: any) => {
                    const isCatActive = pathname?.includes(`/category/${cat.slug}`);
                    return (
                      <Link
                        key={cat._id}
                        href={appendParams(`${basePath}/category/${cat.slug}`)}
                        className={`px-4 py-2 text-xs font-medium transition-colors ${
                          isCatActive 
                            ? 'bg-stone-100 dark:bg-white/[0.06] text-black dark:text-white font-bold' 
                            : 'text-gray-600 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-white/[0.04] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        {locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* DESKTOP Right: search + favorites + cart + account + theme + language */}
        <div className="hidden md:flex items-center gap-1.5 ml-4 shrink-0">
          <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity" title="Search">
            <Search size={18} strokeWidth={1.5} />
          </button>
          
          <Link href={favoritesHref} className="relative p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity" title="Saved Items">
            <Bookmark size={18} strokeWidth={1.5} />
            {mounted && totalFavorites > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 text-[8px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-none flex items-center justify-center leading-none">
                {totalFavorites > 99 ? '99+' : totalFavorites}
              </span>
            )}
          </Link>
          
          <button onClick={() => setDrawerOpen(true)} className="relative p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity" title="Shopping Bag">
            <ShoppingBag size={18} strokeWidth={1.5} />
            {mounted && totalItems > 0 && (
              <span 
                className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 text-[8px] font-bold text-white bg-black dark:bg-white dark:text-black rounded-none flex items-center justify-center leading-none shadow-xs"
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          <Link href={profileHref} className="relative p-2 text-gray-800 dark:text-white hover:opacity-60 transition-opacity" title="Account">
            <User size={18} strokeWidth={1.5} />
          </Link>

          <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200 dark:border-white/10">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 text-gray-800 dark:text-white hover:opacity-60 transition-opacity"
                title="Theme Toggle"
              >
                {theme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
              </button>
            )}
            <a href={langHref} className="hover:opacity-60 transition-opacity p-1" title="Language Toggle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'}
                alt={locale}
                className="w-5 h-auto rounded-none shadow-2xs"
              />
            </a>
          </div>
        </div>

      </div>
    </header>

    {/* Sidebar */}
    <StoreSidebarMenu
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      storeName={storeName}
      storeLogo={logoUrl}
      primaryColor={primaryColor}
      locale={locale}
      slug={slug}
      categories={categories}
      themeStyle={themeStyle}
    />
    
    {mounted && (
      <StoreSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        slug={slug}
        locale={locale}
        primaryColor={primaryColor}
      />
    )}
    </>
  );
}
