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

export default function StoreSidebarMenuTechMinimal({
  isOpen,
  onClose,
  storeName,
  storeLogo,
  primaryColor,
  locale,
  slug,
  categories = [],
  themeStyle = 'tech-minimal',
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

  if ('tech-minimal' === 'fashion-editorial' || 'tech-minimal' === 'minimalist') {
    return (
      <div
        className={`fixed inset-0 z-[100] bg-white dark:bg-[#0a0a0a] flex flex-col transform transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-white/10 shrink-0">
          {storeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-7 sm:h-8 w-auto object-contain" />
          ) : (
            <span className={`text-base font-extrabold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-black dark:text-white`}>
              {storeName}
            </span>
          )}
          <button onClick={onClose} className="text-black dark:text-white hover:opacity-50 transition-opacity">
            <X size={28} strokeWidth={1} />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-8 pt-10 pb-8 overflow-y-auto">
          {/* Main Links */}
          <nav className="flex flex-col space-y-6">
            <Link href={homeHref} onClick={onClose} className={`text-2xl sm:text-3xl font-light text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {homeLabel}
            </Link>
            <Link href={appendParams(`${basePath}/products`)} onClick={onClose} className={`text-2xl sm:text-3xl font-light text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {productsLabel}
            </Link>
            <Link href={appendParams(`${basePath}/promotions`)} onClick={onClose} className={`text-2xl sm:text-3xl font-light text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {promotionsLabel}
            </Link>
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className={`text-2xl sm:text-3xl font-light text-black dark:text-white text-left flex items-center justify-between ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}
                >
                  {allCategoriesLabel}
                  <ChevronDown size={24} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`flex flex-col space-y-4 overflow-hidden transition-all duration-300 ${isCategoriesOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {categories.filter(c => !c.parentCategory).map(mainCat => (
                    <Link
                      key={mainCat._id}
                      href={appendParams(`${basePath}/category/${mainCat.slug}`)}
                      onClick={onClose}
                      className={`text-lg sm:text-xl font-light text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} transition-colors`}
                    >
                      {isKm && mainCat.nameKm ? mainCat.nameKm : mainCat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-8 shrink-0"></div>

          {/* Secondary Links */}
          <nav className="flex flex-col space-y-6 mt-auto">
            <Link href={cartHref} onClick={onClose} className={`text-xs font-bold text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {cartLabel}
            </Link>
            <Link href={favoritesHref} onClick={onClose} className={`text-xs font-bold text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {favoritesLabel}
            </Link>
            <Link href={profileHref} onClick={onClose} className={`text-xs font-bold text-black dark:text-white ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} hover:opacity-70 transition-opacity`}>
              {accountLabel}
            </Link>
          </nav>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100 dark:border-white/10 shrink-0">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                {theme === 'dark' ? 'LIGHT' : 'DARK'}
              </button>
            )}
            <Link href={langHref} className="hover:opacity-60 transition-opacity">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'} alt={locale} className="w-6 h-auto rounded-none shadow-xs" />
            </Link>
          </div>
        </div>
      </div>
    );
  }


  // 3. ⚡ NEO-BRUTALISM (Bold Urban Pop)
  if ('tech-minimal' === 'neo-brutalism') {
    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col transform transition-transform duration-300 ease-out bg-[#ffeb3b] dark:bg-[#111111] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b-[4px] border-black dark:border-white shrink-0" style={{ backgroundColor: primaryColor || '#ff90e8' }}>
          {storeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">{storeName}</span>
          )}
          <button onClick={onClose} className="p-3 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
            <X size={24} className="text-black dark:text-white" strokeWidth={3} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col p-6 space-y-6">
          {[
            { label: homeLabel, href: homeHref },
            { label: productsLabel, href: appendParams(`${basePath}/products`) },
            { label: promotionsLabel, href: appendParams(`${basePath}/promotions`) },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} onClick={onClose} className="flex items-center justify-between p-5 border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || '#fff' }}>
              <span className="text-2xl font-black text-black dark:text-white uppercase">{item.label}</span>
              <ArrowRight size={28} className="text-black dark:text-white" strokeWidth={3} />
            </Link>
          ))}

          {categories.length > 0 && (
            <div className="flex flex-col border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#222]">
              <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className="flex items-center justify-between p-5 w-full text-left">
                <span className="text-2xl font-black text-black dark:text-white uppercase">{allCategoriesLabel}</span>
                <ChevronDown size={28} className={`text-black dark:text-white transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>
              <div className={`flex flex-col border-t-[3px] border-black dark:border-white transition-all overflow-hidden ${isCategoriesOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 border-t-0'}`}>
                {categories.filter(c => !c.parentCategory).map(mainCat => (
                  <Link key={mainCat._id} href={appendParams(`${basePath}/category/${mainCat.slug}`)} onClick={onClose} className="p-4 border-b-[2px] border-black/20 dark:border-white/20 last:border-b-0 text-xl font-bold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 uppercase">
                    {isKm && mainCat.nameKm ? mainCat.nameKm : mainCat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
             <Link href={cartHref} onClick={onClose} className="flex flex-col items-center gap-2 p-4 border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || '#f87171' }}>
              <ShoppingBag size={28} className="text-black dark:text-white" strokeWidth={2.5} />
              <span className="text-sm font-black text-black dark:text-white uppercase">{cartLabel}</span>
            </Link>
            <Link href={favoritesHref} onClick={onClose} className="flex flex-col items-center gap-2 p-4 border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || '#c084fc' }}>
              <Bookmark size={28} className="text-black dark:text-white" strokeWidth={2.5} />
              <span className="text-sm font-black text-black dark:text-white uppercase">{favoritesLabel}</span>
            </Link>
          </div>
          
          <Link href={profileHref} onClick={onClose} className="flex items-center justify-center gap-3 p-5 border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all w-full" style={{ backgroundColor: primaryColor || '#000', color: '#fff' }}>
            <User size={24} strokeWidth={2.5} />
            <span className="text-xl font-black uppercase">{accountLabel}</span>
          </Link>
        </nav>

        <div className="p-6 border-t-[4px] border-black dark:border-white bg-[#ffeb3b] dark:bg-[#111] flex justify-between items-center shrink-0">
           {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none font-black uppercase text-black dark:text-white transition-all">
              {theme === 'dark' ? <Sun size={20} strokeWidth={3} /> : <Moon size={20} strokeWidth={3} />}
              {theme === 'dark' ? 'LIGHT' : 'DARK'}
            </button>
          )}
          <Link href={langHref} className="p-2 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'} alt={locale} className="w-8 h-auto" />
          </Link>
        </div>
      </div>
    );
  }

  // 4. 🧴 SKINCARE & BEAUTY (Clean Apothecary)
  if ('tech-minimal' === 'skincare-clean') {
    return (
      <div
        className={`fixed inset-0 z-[100] flex flex-col transform transition-all duration-500 ease-in-out bg-[#FAF9F6] dark:bg-[#0C0C0C] ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-[#E5E5E5] dark:border-[#222]">
          <div className="flex items-center gap-3 min-w-0">
            {storeLogo ? (
              <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-8 w-auto object-contain shrink-0 mix-blend-multiply dark:mix-blend-normal" />
            ) : (
              <span className="text-xl font-light text-[#222] dark:text-[#E5E5E5] tracking-widest uppercase">{storeName}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-[#666] dark:text-[#999] hover:text-[#000] dark:hover:text-[#FFF] transition-all">
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto flex flex-col px-8 py-10 space-y-8">
          {[
            { label: homeLabel, href: homeHref },
            { label: productsLabel, href: appendParams(`${basePath}/products`) },
            { label: promotionsLabel, href: appendParams(`${basePath}/promotions`) },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} onClick={onClose} className="group flex items-center justify-between text-2xl font-light text-[#444] dark:text-[#CCC] hover:text-[#000] dark:hover:text-[#FFF] transition-colors">
              <span className="tracking-wide">{item.label}</span>
              <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1} />
            </Link>
          ))}

          {categories.length > 0 && (
            <div className="flex flex-col pt-2">
              <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className="flex items-center justify-between text-2xl font-light text-[#444] dark:text-[#CCC] hover:text-[#000] dark:hover:text-[#FFF] w-full text-left transition-colors">
                <span className="tracking-wide">{allCategoriesLabel}</span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
              </button>
              <div className={`flex flex-col transition-all duration-500 ease-in-out ${isCategoriesOpen ? 'max-h-[800px] opacity-100 mt-6 space-y-4' : 'max-h-0 opacity-0'}`}>
                {categories.filter(c => !c.parentCategory).map(mainCat => (
                  <Link key={mainCat._id} href={appendParams(`${basePath}/category/${mainCat.slug}`)} onClick={onClose} className="block text-lg font-light text-[#888] dark:text-[#777] hover:text-[#000] dark:hover:text-[#FFF] transition-colors pl-4 border-l border-[#E5E5E5] dark:border-[#333]">
                    {isKm && mainCat.nameKm ? mainCat.nameKm : mainCat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 mt-auto grid grid-cols-2 gap-4 border-t border-[#E5E5E5] dark:border-[#222]">
            <Link href={cartHref} onClick={onClose} className="flex flex-col items-center justify-center gap-3 p-4 hover:bg-[#F2F0EB] dark:hover:bg-[#1A1A1A] rounded-xl transition-all">
              <ShoppingBag size={24} className="text-[#333] dark:text-[#DDD]" strokeWidth={1.5} />
              <span className="text-xs font-light tracking-widest uppercase text-[#555] dark:text-[#BBB]">{cartLabel}</span>
            </Link>
            <Link href={favoritesHref} onClick={onClose} className="flex flex-col items-center justify-center gap-3 p-4 hover:bg-[#F2F0EB] dark:hover:bg-[#1A1A1A] rounded-xl transition-all">
              <Bookmark size={24} className="text-[#333] dark:text-[#DDD]" strokeWidth={1.5} />
              <span className="text-xs font-light tracking-widest uppercase text-[#555] dark:text-[#BBB]">{favoritesLabel}</span>
            </Link>
          </div>

          <Link href={profileHref} onClick={onClose} className="flex items-center justify-center gap-3 p-4 border border-[#DDD] dark:border-[#333] text-[#000] dark:text-[#FFF] hover:bg-[#000] hover:text-[#FFF] dark:hover:bg-[#FFF] dark:hover:text-[#000] rounded-none transition-all w-full" style={{ borderColor: primaryColor || undefined }}>
            <User size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium tracking-widest uppercase">{accountLabel}</span>
          </Link>
        </nav>

        <div className="p-6 flex items-center justify-between shrink-0 bg-[#FAF9F6] dark:bg-[#0C0C0C] border-t border-[#E5E5E5] dark:border-[#222]">
          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 text-[#555] dark:text-[#AAA] hover:text-[#000] dark:hover:text-[#FFF] text-xs font-light tracking-widest uppercase transition-all">
              {theme === 'dark' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
            </button>
          )}
          <Link href={langHref} className="p-2 hover:opacity-70 transition-all">
            <img src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'} alt={locale} className="w-6 h-auto opacity-80" />
          </Link>
        </div>
      </div>
    );
  }

  // 5. 🛍️ DEFAULT MODERN RETAIL (Smooth Glassmorphism Mobile App)
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transform transition-all duration-400 ease-out bg-white/80 dark:bg-[#111318]/80 backdrop-blur-2xl ${
        isOpen ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-gray-200/50 dark:border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {storeLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={storeLogo.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={storeName} className="h-9 w-auto object-contain shrink-0 drop-shadow-sm" />
          ) : (
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{storeName}</span>
          )}
        </div>
        <button onClick={onClose} className="p-2.5 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 active:scale-95 transition-all shadow-sm">
          <X size={20} className="text-gray-900 dark:text-white" strokeWidth={2.5} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto flex flex-col px-6 py-8 space-y-5">
        {[
          { label: homeLabel, href: homeHref },
          { label: productsLabel, href: appendParams(`${basePath}/products`) },
          { label: promotionsLabel, href: appendParams(`${basePath}/promotions`) },
        ].map((item, idx) => (
          <Link key={idx} href={item.href} onClick={onClose} className="flex items-center justify-between p-5 bg-white dark:bg-white/5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{item.label}</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center">
              <ArrowRight size={16} className="text-gray-600 dark:text-gray-300" strokeWidth={2.5} />
            </div>
          </Link>
        ))}

        {categories.length > 0 && (
          <div className="flex flex-col bg-white dark:bg-white/5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden transition-all mt-2">
            <button onClick={() => setIsCategoriesOpen(!isCategoriesOpen)} className="flex items-center justify-between p-5 w-full text-left">
              <span className="text-lg font-bold text-gray-900 dark:text-white">{allCategoriesLabel}</span>
              <ChevronDown size={22} className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>
            <div className={`flex flex-col transition-all duration-400 ease-in-out ${isCategoriesOpen ? 'max-h-[800px] opacity-100 bg-gray-50/50 dark:bg-black/20' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 pb-4 space-y-1">
                {categories.filter(c => !c.parentCategory).map(mainCat => (
                  <Link key={mainCat._id} href={appendParams(`${basePath}/category/${mainCat.slug}`)} onClick={onClose} className="block p-3.5 font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all">
                    {isKm && mainCat.nameKm ? mainCat.nameKm : mainCat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 grid grid-cols-2 gap-4">
          <Link href={cartHref} onClick={onClose} className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-white/5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 active:scale-95 transition-all">
            <ShoppingBag size={26} className="text-gray-800 dark:text-white" strokeWidth={2} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{cartLabel}</span>
          </Link>
          <Link href={favoritesHref} onClick={onClose} className="flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-white/5 rounded-3xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 active:scale-95 transition-all">
            <Bookmark size={26} className="text-gray-800 dark:text-white" strokeWidth={2} />
            <span className="text-sm font-bold text-gray-900 dark:text-white">{favoritesLabel}</span>
          </Link>
        </div>

        <Link href={profileHref} onClick={onClose} className="flex items-center justify-center gap-3 p-5 mt-2 bg-gray-900 text-white dark:bg-white dark:text-black rounded-3xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all w-full" style={{ backgroundColor: primaryColor || undefined }}>
          <User size={22} strokeWidth={2.5} />
          <span className="text-lg font-bold">{accountLabel}</span>
        </Link>
      </nav>

      <div className="p-6 flex items-center justify-between shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-md border-t border-gray-200/50 dark:border-white/10">
        {mounted && (
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-white/10 rounded-full text-gray-900 dark:text-white text-sm font-bold active:scale-95 transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        )}
        <Link href={langHref} className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 shadow-sm active:scale-95 transition-all" title={locale === 'en' ? 'Switch to Khmer' : 'Switch to English'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={locale === 'en' ? 'https://flagcdn.com/w40/kh.png' : 'https://flagcdn.com/w40/us.png'} alt={locale} className="w-6 h-auto rounded-sm drop-shadow-sm" />
        </Link>
      </div>
    </div>
  );
}
