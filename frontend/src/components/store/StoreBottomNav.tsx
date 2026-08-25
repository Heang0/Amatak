'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, User, Search, ShoppingBag, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import StoreSearchModal from './StoreSearchModal';

export default function StoreBottomNav({ locale, primaryColor, slug, initialThemeStyle }: {
  locale: string;
  primaryColor: string;
  slug: string;
  initialThemeStyle?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeStyle, setThemeStyle] = useState(initialThemeStyle || 'default');

  useEffect(() => {
    setMounted(true);
    const fetchTheme = async () => {
      try {
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`);
        if (storeRes.ok) {
          const store = await storeRes.json();
          const previewTheme = searchParams.get('theme');
          setThemeStyle(previewTheme || store.branding?.themeStyle || 'default');
        }
      } catch (e) { /* ignore */ }
    };
    fetchTheme();
  }, [slug, searchParams]);

  // Hide on cart page only (allow bottom nav on product detail pages)
  if (pathname?.includes('/cart')) return null;

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

  // Also support paths that don't include the locale in the pathname (dev hosts, rewrites)
  const storePathNoLocale = `/store/${slug}`;

  const homeHref = appendParams(basePath);
  const productsHref = appendParams(`${basePath}/products`);
  const promotionsHref = appendParams(`${basePath}/promotions`);
  const profileHref = appendParams(`${basePath}/profile`);

  const t = (en: string, km: string) => locale === 'km' ? km : en;

  const navItems: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: any;
    isActive: boolean;
    badge?: number;
  }[] = [
    {
      label: t('Home', 'ទំព័រដើម'),
      href: homeHref,
      icon: Home,
      isActive: pathname === `/${locale}` || pathname === `/${locale}/` || pathname === '/' || pathname === basePath || pathname === `${basePath}/` || pathname === storePathNoLocale || pathname === `${storePathNoLocale}/`,
    },
    {
      label: t('Products', 'ផលិតផល'),
      href: productsHref,
      icon: ShoppingBag,
      // Consider product list and individual product pages as active for Products
      isActive: pathname?.includes('/product') || pathname?.endsWith('/products') || pathname?.endsWith('/products/'),
    },
    {
      label: t('Search', 'ស្វែងរក'),
      onClick: () => setIsSearchOpen(true),
      icon: Search,
      isActive: isSearchOpen,
    },
    {
      label: t('Promotions', 'ប្រូម៉ូសិន'),
      href: promotionsHref,
      icon: Tag,
      isActive: pathname?.endsWith('/promotions') || pathname?.endsWith('/promotions/'),
    },
    {
      label: t('Account', 'គណនី'),
      href: profileHref,
      icon: User,
      isActive: pathname?.includes('/profile'),
    },
  ];

  let navClass = "fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111318]/95 backdrop-blur-md md:hidden border-t border-gray-200 dark:border-white/[0.08] pb-safe";

  return (
    <>
      <nav className={navClass}>
        <div className="flex h-14 px-2 items-center">
          {navItems.map((item) => {
            const isItemActive = item.isActive;
            const itemClass = `flex flex-1 flex-col items-center justify-center gap-0.5 relative h-full transition-all ${
              isItemActive ? 'text-black dark:text-white font-bold' : 'text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white'
            }`;

            return item.onClick ? (
              <button
                key={item.label}
                onClick={item.onClick}
                className={itemClass}
              >
                <div className="relative">
                  <item.icon size={18} strokeWidth={isItemActive ? 2.2 : 1.5} />
                  {mounted && (item.badge ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] ${locale === 'km' ? 'tracking-normal' : 'uppercase tracking-wider'}`}>{item.label}</span>
              </button>
            ) : (
              <Link
                key={item.label}
                href={item.href!}
                className={itemClass}
              >
                <div className="relative">
                  <item.icon size={18} strokeWidth={isItemActive ? 2.2 : 1.5} />
                  {mounted && (item.badge ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-3.5 px-0.5 text-[8px] font-bold bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] ${locale === 'km' ? 'tracking-normal' : 'uppercase tracking-wider'}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

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
