'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { Plus, CheckCircle, Search, Grid, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';

// --- Toast Component ---
function AddToCartToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-none shadow-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
      <CheckCircle size={16} strokeWidth={2.5} className="shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}

// --- In-Memory Cache for SPA Navigation ---
const storeCache: Record<string, any> = {};

// --- Shared Storefront View ---
export default function StorefrontViewTechMinimal({ 
  params, 
  categorySlug, 
  viewMode = 'home',
  initialProducts,
  initialCategories,
  initialStore
}: { 
  params: { locale: string; slug: string }, 
  categorySlug?: string, 
  viewMode?: 'home' | 'catalog' | 'promotions' | 'categories',
  initialProducts?: any[],
  initialCategories?: any[],
  initialStore?: any
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const previewTheme = searchParams.get('theme');
  const previewColor = searchParams.get('color');

  const cacheKey = `${params.slug}-${previewTheme || ''}-${previewColor || ''}`;
  const cached = storeCache[cacheKey];

  const [products, setProducts] = useState<any[]>(initialProducts || cached?.products || []);
  const [categories, setCategories] = useState<any[]>(initialCategories || cached?.categories || []);
  // We determine active category by the slug, or 'All'
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>(categorySlug || 'All');
  const [loading, setLoading] = useState(!initialProducts && !cached);
  const categoryTabsRef = useRef<HTMLDivElement | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>(previewColor || initialStore?.branding?.primaryColor || cached?.primaryColor || '#000000');
  const [themeStyle, setThemeStyle] = useState('tech-minimal');
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialStore?.branding?.bannerUrl || cached?.bannerUrl || null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest' | 'best-seller'>('name-asc');
  const allLabel = params.locale === 'km' ? 'ទាំងអស់' : 'All';
  const isKm = params.locale === 'km';

  useEffect(() => {
    setActiveCategorySlug(categorySlug || 'All');
  }, [categorySlug]);

  // Auto-scroll active category tab to the center
  useEffect(() => {
    if (categoryTabsRef.current) {
      const activeEl = categoryTabsRef.current.querySelector('[data-category-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategorySlug]);

  useEffect(() => {
    if (initialProducts && initialCategories && initialStore && !storeCache[cacheKey]) {
      storeCache[cacheKey] = {
        products: initialProducts,
        categories: initialCategories,
        primaryColor: initialStore.branding?.primaryColor || '#000000',
        themeStyle: initialStore.branding?.themeStyle || 'default',
        bannerUrl: initialStore.branding?.bannerUrl || null
      };
    }
  }, [initialProducts, initialCategories, initialStore, cacheKey]);

  useEffect(() => {
    if (initialProducts && initialCategories && initialStore) {
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
        const pColor = previewColor || store.branding?.primaryColor || '#000000';
        const tStyle = previewTheme || store.branding?.themeStyle || 'default';
        const bUrl = store.branding?.bannerUrl || null;

        setPrimaryColor(pColor);
        setThemeStyle(tStyle);
        setBannerUrl(bUrl);

        // Fetch up to 1000 items to cover the storefront list properly
        const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${store._id}?limit=1000`);
        const prods = await prodRes.json();
        const loadedProducts = prods.products || [];
        setProducts(loadedProducts);

        let loadedCategories = [];
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/store/${store._id}`);
        if (catRes.ok) {
          loadedCategories = await catRes.json();
          setCategories(loadedCategories);
        }

        storeCache[cacheKey] = {
          products: loadedProducts,
          categories: loadedCategories,
          primaryColor: store.branding?.primaryColor || '#000000',
          themeStyle: store.branding?.themeStyle || 'default',
          bannerUrl: bUrl
        };
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [params.slug, previewColor, previewTheme, cacheKey, initialProducts, initialCategories, initialStore]);

  const showToast = useCallback(() => {
    const isKm = params.locale === 'km';
    setToast({ message: isKm ? 'បានបញ្ចូលទៅកន្ត្រក!' : 'Added to cart!', visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  }, [params.locale]);

  useEffect(() => {
    const activeTab = categoryTabsRef.current?.querySelector('a[data-category-active="true"]');
    const container = categoryTabsRef.current;
    if (!activeTab || !container) return;

    setTimeout(() => {
      const activeRect = (activeTab as HTMLElement).getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const targetScroll = activeRect.left - containerRect.left - (container.clientWidth / 2 - activeRect.width / 2);
      container.scrollTo({ left: container.scrollLeft + targetScroll, behavior: 'smooth' });
    }, 80);
  }, [activeCategorySlug, categories, viewMode]);

  const filteredProducts = products.filter(p => {
    // If we're on the promotions page, we only show best sellers
    if (viewMode === 'promotions' && !p.isBestSeller) return false;

    if (activeCategorySlug !== 'All') {
      const cat = categories.find(c => c.slug === activeCategorySlug);
      if (!cat) return false;
      
      const pCat = p.category?._id ?? p.category;
      let matches = String(pCat) === String(cat._id);
      
      // If the active category is a Main Category, also allow products in its subcategories
      if (!matches && !cat.parentCategory) {
        const subCatIds = categories.filter(c => c.parentCategory === cat._id).map(c => String(c._id));
        if (subCatIds.includes(String(pCat))) {
          matches = true;
        }
      }
      
      if (!matches) return false;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return String(p.title || '').toLowerCase().includes(query) || String(p.description || '').toLowerCase().includes(query);
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-desc':
        return String(b.title || '').localeCompare(String(a.title || ''));
      case 'price-asc': {
        const pa = Number(a.price || 0);
        const pb = Number(b.price || 0);
        return pa - pb;
      }
      case 'price-desc': {
        const pa = Number(a.price || 0);
        const pb = Number(b.price || 0);
        return pb - pa;
      }
      case 'newest': {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
      case 'best-seller': {
        const ba = a.isBestSeller ? 1 : 0;
        const bb = b.isBestSeller ? 1 : 0;
        return bb - ba;
      }
      case 'name-asc':
      default:
        return String(a.title || '').localeCompare(String(b.title || ''));
    }
  });

  const bestSellers = filteredProducts.filter(p => p.isBestSeller);
  const visibleBestSellers = bestSellers.slice(0, 8);
  const showBestSellerViewAll = bestSellers.length > 8;
  const newArrivals = [...filteredProducts].reverse().slice(0, 8);
  const productList = viewMode === 'catalog' ? sortedProducts : filteredProducts;

  let bannerContainerClass = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 mb-4 md:mb-6 ";
  if (themeStyle === 'minimalist') {
    bannerContainerClass += "rounded-sm overflow-hidden";
  } else if (themeStyle === 'neo-brutalism') {
    bannerContainerClass += "rounded-none border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] overflow-hidden";
  } else {
    bannerContainerClass += "overflow-hidden";
  }

  const getCategoryClass = (isActive: boolean) => {
    if (themeStyle === 'neo-brutalism') {
      return `whitespace-nowrap text-sm px-4 py-2 border-[2.5px] transition-all font-black rounded-none uppercase tracking-wider ${isActive ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`;
    } else if (themeStyle === 'minimalist') {
      return `whitespace-nowrap pb-1 border-b transition-all tracking-widest uppercase text-xs ${isActive ? 'font-medium text-black dark:text-white border-black dark:border-white' : 'font-light text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
    } else {
      return `whitespace-nowrap text-sm pb-1 border-b-2 transition-all ${isActive ? 'font-bold text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'font-semibold text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'}`;
    }
  };

  const getCategoryPillClass = (isActive: boolean) => {
    if (themeStyle === 'fashion-editorial' || themeStyle === 'minimalist') {
      return `flex items-center gap-1.5 whitespace-nowrap text-xs ${isKm ? 'tracking-normal' : 'uppercase tracking-[0.12em]'} font-bold py-2 px-4 rounded-none transition-all ${
        isActive 
          ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-xs' 
          : 'bg-white dark:bg-[#111] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
      }`;
    }

    if (themeStyle === 'skincare-clean') {
      return `flex items-center gap-1.5 whitespace-nowrap rounded-none px-4 py-2 text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} transition-all ${
        isActive 
          ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 border border-stone-900 dark:border-white shadow-xs' 
          : 'bg-[#FAF8F5] dark:bg-[#1A1C1F] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/30'
      }`;
    }

    if (themeStyle === 'neo-brutalism') {
      return `flex items-center gap-1.5 whitespace-nowrap border-[2.5px] border-black dark:border-white px-4 py-2 text-xs font-black uppercase tracking-wider transition rounded-none ${
        isActive 
          ? 'bg-black text-white dark:bg-white dark:text-black shadow-none' 
          : 'bg-white text-black dark:bg-[#111] dark:text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
      }`;
    }

    return `flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} transition-all ${
      isActive 
        ? 'bg-gray-900 text-white border-transparent dark:bg-white dark:text-black shadow-md' 
        : 'bg-white text-gray-700 border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md dark:bg-white/5 dark:text-gray-300 dark:border-white/10 dark:hover:border-white/20'
    }`;
  };

  const getAppendParams = (href: string) => {
    if (!previewTheme && !previewColor) return href;
    const url = new URL(href, 'http://localhost');
    if (previewTheme) url.searchParams.set('theme', previewTheme);
    if (previewColor) url.searchParams.set('color', previewColor);
    return `${url.pathname}${url.search}`;
  };

  return (
    <div>
      <AddToCartToast message={toast.message} visible={toast.visible} />

      {viewMode === 'home' && !categorySlug && bannerUrl ? (
        <div className={bannerContainerClass}>
          <div className="relative w-full overflow-hidden h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] max-h-[55vh] rounded-none">
            <img
              src={bannerUrl}
              alt="Store Banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-6 sm:space-y-8">

        {categories.length > 0 && (viewMode === 'home' || viewMode === 'catalog' || viewMode === 'categories') && (
          <div className="mb-6 md:mb-10 flex flex-col gap-3" ref={categoryTabsRef}>
            {/* ROW 1: Main Categories */}
            <div className="overflow-x-auto pb-1 scrollbar-hide scroll-smooth -mx-4 px-4 sm:-mx-0 sm:px-0">
              <div className="flex gap-2.5 min-w-max py-1">
                <Link
                  href={getAppendParams(`/${params.locale}/store/${params.slug}/products`)}
                  className={getCategoryPillClass(activeCategorySlug === 'All')}
                  data-category-active={activeCategorySlug === 'All' ? 'true' : 'false'}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCategorySlug('All');
                    (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }}
                >
                  <Grid size={16} className="shrink-0" />
                  {isKm ? 'ទាំង​អស់' : 'All'}
                </Link>
                {categories
                  .filter(cat => !cat.parentCategory) // Only show main categories
                  .filter(cat => {
                    // Only show if it or its subcategories have products
                    const subCatIds = categories.filter(c => c.parentCategory === cat._id).map(c => String(c._id));
                    return products.some(p => {
                      const pCat = String(p.category?._id ?? p.category);
                      return pCat === String(cat._id) || subCatIds.includes(pCat);
                    });
                  })
                  .map(cat => {
                    // Check if active category is this category OR one of its subcategories
                    const subCatIds = categories.filter(c => c.parentCategory === cat._id).map(c => c.slug);
                    const isActive = activeCategorySlug === cat.slug || subCatIds.includes(activeCategorySlug);
                    
                    if (viewMode === 'categories') {
                      const href = getAppendParams(`/${params.locale}/store/${params.slug}/category/${cat.slug}`);
                      return (
                        <Link
                          key={cat._id}
                          href={href}
                          className={getCategoryPillClass(isActive)}
                          data-category-active={isActive ? 'true' : 'false'}
                        >
                          {params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                        </Link>
                      );
                    }

                    return (
                      <a
                        key={cat._id}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveCategorySlug(cat.slug);
                          (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }}
                        className={getCategoryPillClass(isActive)}
                        data-category-active={isActive ? 'true' : 'false'}
                      >
                        {params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* ROW 2: Subcategories */}
            {activeCategorySlug !== 'All' && (() => {
               let activeMainCat = categories.find(c => c.slug === activeCategorySlug);
               if (activeMainCat && activeMainCat.parentCategory) {
                 activeMainCat = categories.find(c => c._id === activeMainCat.parentCategory);
               }
               
               if (!activeMainCat) return null;
               
               const subCategories = categories.filter(c => c.parentCategory === activeMainCat._id && products.some(p => String(p.category?._id ?? p.category) === String(c._id)));
               
               if (subCategories.length === 0) return null;

               return (
                 <div className="overflow-x-auto pb-2 scrollbar-hide scroll-smooth -mx-4 px-4 sm:-mx-0 sm:px-0">
                   <div className="flex gap-2 min-w-max">
                     <Link
                        href={getAppendParams(`/${params.locale}/store/${params.slug}/category/${activeMainCat.slug}`)}
                        className={`text-xs px-3 py-1.5 rounded-none border transition-all ${activeCategorySlug === activeMainCat.slug ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-bold' : 'bg-transparent text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                        onClick={(e) => {
                          if (viewMode !== 'categories') {
                            e.preventDefault();
                            setActiveCategorySlug(activeMainCat?.slug || '');
                          }
                        }}
                      >
                        {isKm ? 'ទាំងអស់ ' : 'All in '} {isKm ? (activeMainCat.nameKm || activeMainCat.name) : activeMainCat.name}
                      </Link>
                     {subCategories.map(subCat => (
                        <Link
                          key={subCat._id}
                          href={getAppendParams(`/${params.locale}/store/${params.slug}/category/${subCat.slug}`)}
                          className={`text-xs px-3 py-1.5 rounded-none border transition-all ${activeCategorySlug === subCat.slug ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-bold' : 'bg-transparent text-gray-600 border-gray-200 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'}`}
                          onClick={(e) => {
                            if (viewMode !== 'categories') {
                              e.preventDefault();
                              setActiveCategorySlug(subCat.slug);
                            }
                          }}
                        >
                          {params.locale === 'km' && subCat.nameKm ? subCat.nameKm : subCat.name}
                        </Link>
                     ))}
                   </div>
                 </div>
               );
            })()}
          </div>
        )}

        {/* CATEGORIES VIEW */}
        {viewMode === 'categories' && (
          <div className="pt-2 pb-10">
            <div className="mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                {isKm ? 'ប្រភេទផលិតផល' : 'COLLECTIONS'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm max-w-2xl">
                {isKm ? 'ស្វែងរកប្រភេទផលិតផលដែលយើងបានរៀបចំសម្រាប់អ្នក។' : 'Browse curated category collections to find what you need faster.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.filter(cat => !cat.parentCategory).map(cat => {
                const subCatIds = categories.filter(c => c.parentCategory === cat._id).map(c => String(c._id));
                const count = products.filter(p => {
                  const pCat = String(p.category?._id ?? p.category);
                  return pCat === String(cat._id) || subCatIds.includes(pCat);
                }).length;
                return (
                  <Link 
                    key={cat._id}
                    href={getAppendParams(`/${params.locale}/store/${params.slug}/category/${cat.slug}`)}
                    className="group relative overflow-hidden p-6 transition-all duration-300 flex flex-col justify-between min-h-[160px] bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] shadow-2xs hover:border-black dark:hover:border-white rounded-none"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className={`text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight break-words pr-2 ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'}`}>
                        {isKm && cat.nameKm ? cat.nameKm : cat.name}
                      </h3>
                      <span className="shrink-0 inline-flex items-center justify-center rounded-none px-2.5 py-1 text-xs font-bold bg-stone-100 dark:bg-stone-900 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 uppercase tracking-wider">
                        {count} {isKm ? 'ផលិតផល' : 'items'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs font-bold uppercase tracking-wider transition-colors mt-auto text-black dark:text-white">
                      <span>{isKm ? 'មើលផលិតផល' : 'VIEW COLLECTION'}</span>
                      <svg className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CATALOG & PROMOTIONS VIEW */}
        {(viewMode === 'catalog' || viewMode === 'promotions' || categorySlug) && (
          <>
            {viewMode === 'promotions' && (
              <div className="pt-2 mb-4">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ប្រូម៉ូសិន' : 'Promotions'}</h2>
                <p className="text-gray-500 mt-1">{isKm ? 'ផលិតផលលក់ដាច់បំផុតនិងប្រូម៉ូសិន' : 'Best sellers and special offers'}</p>
              </div>
            )}
            {viewMode === 'catalog' && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ផលិតផលទាំងអស់' : 'All Products'}</h2>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:max-w-[480px]">
                    <label htmlFor="store-search" className="sr-only">{isKm ? 'ស្វែងរក' : 'Search'}</label>
                    <div className="relative flex-1">
                      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="store-search"
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isKm ? 'ស្វែងរកផលិតផល' : 'Search products'}
                        className="w-full rounded-none border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-black"
                      />
                    </div>

                    <div className="relative w-40">
                      <label htmlFor="store-sort" className="sr-only">{isKm ? 'តម្រៀប' : 'Sort'}</label>
                      <select
                        id="store-sort"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as 'name-asc' | 'name-desc')}
                        className="w-full rounded-none appearance-none border border-gray-200 bg-white py-3 px-4 pr-8 text-sm text-gray-900 shadow-sm outline-none transition focus:border-black"
                      >
                        <option value="name-asc">{isKm ? 'ឈ្មោះ (A-Z)' : 'Name (A-Z)'}</option>
                        <option value="name-desc">{isKm ? 'ឈ្មោះ (Z-A)' : 'Name (Z-A)'}</option>
                        <option value="price-asc">{isKm ? 'តម្លៃ (ទាប → ខ្ពស់)' : 'Price (Low → High)'}</option>
                        <option value="price-desc">{isKm ? 'តម្លៃ (ខ្ពស់ → ទាប)' : 'Price (High → Low)'}</option>
                        <option value="newest">{isKm ? 'ថ្មីបំផុត' : 'Newest'}</option>
                        <option value="best-seller">{isKm ? 'លក់ដាច់' : 'Best sellers'}</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {categories.length > 0 && viewMode === 'home' && !categorySlug && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{isKm ? 'ប្រភេទពិព័រណ៍' : 'Browse Categories'}</h3>
                  <Link href={getAppendParams(`/${params.locale}/store/${params.slug}/categories`)} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:underline">
                    {isKm ? 'មើល​ទាំងអស់' : 'View all'}
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {categories
                    .filter(cat => products.some(p => {
                      const pCat = p.category?._id ?? p.category;
                      return String(pCat) === String(cat._id);
                    }))
                    .slice(0, 8)
                    .map((cat, index) => {
                      const count = products.filter(p => {
                        const pCat = p.category?._id ?? p.category;
                        return String(pCat) === String(cat._id);
                      }).length;

                      const repProduct = products.find(p => {
                        const pCat = p.category?._id ?? p.category;
                        return String(pCat) === String(cat._id) && p.imageUrl;
                      });

                      const imageUrl = repProduct ? repProduct.imageUrl : '/logo/logo-website.png';

                      return (
                        <a
                          key={cat._id}
                          href="#"
                          onClick={(e) => { e.preventDefault(); setActiveCategorySlug(cat.slug); }}
                          className={`group block overflow-hidden bg-white dark:bg-[#0b0b0b] border border-gray-100 dark:border-gray-800 rounded-md ${index >= 4 ? 'hidden lg:block' : ''}`}
                        >
                          <div className="w-full aspect-square overflow-hidden bg-gray-100">
                            <img src={imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                          </div>
                          <div className="p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}</span>
                              <span className="text-xs text-gray-500">{count}</span>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link
                    href={getAppendParams(`/${params.locale}/store/${params.slug}/categories`)}
                    className="px-4 py-2 text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 dark:bg-[#111111] dark:text-white dark:border-gray-700"
                  >
                    {isKm ? 'មើល​ទាំងអស់' : 'View all'}
                  </Link>
                </div>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                  <div key={i} className="animate-pulse flex flex-col">
                    <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-none mb-4 w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded-none w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-[#1a1a1a] rounded-none w-1/2 mb-4" />
                    <div className="mt-auto h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded-none w-full" />
                  </div>
                ))}
              </div>
            ) : productList.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#13161F] rounded-none border border-gray-200 dark:border-white/[0.08] shadow-2xs">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">{isKm ? 'មិនមានផលិតផលទេ។' : 'No products found.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                {productList.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    primaryColor={primaryColor} 
                    themeStyle={themeStyle}
                    onAddToCart={showToast}
                    isBestSeller={product.isBestSeller}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* HOME VIEW */}
        {viewMode === 'home' && !categorySlug && (
          <div className="flex flex-col gap-10 md:gap-14">
            
            {/* Best Sellers Section */}
            {bestSellers.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'លក់ដាច់បំផុត' : 'Best Sellers'}</h3>
                  {showBestSellerViewAll && (
                    <Link href={getAppendParams(`/${params.locale}/store/${params.slug}/promotions`)} className="group flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                      {isKm ? 'មើលទាំងអស់' : 'View all'} 
                      <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {visibleBestSellers.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      primaryColor={primaryColor} 
                      themeStyle={themeStyle}
                      onAddToCart={showToast}
                      isBestSeller={product.isBestSeller}
                    />
                  ))}
                </div>
              </section>
            )}


            {/* New Arrivals Section */}
            {newArrivals.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{isKm ? 'ទំនិញថ្មី' : 'New Arrivals'}</h3>
                  <Link href={getAppendParams(`/${params.locale}/store/${params.slug}/products`)} className="group flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    {isKm ? 'មើលទាំងអស់' : 'View all'} 
                    <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                  {newArrivals.map(product => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      primaryColor={primaryColor} 
                      themeStyle={themeStyle}
                      onAddToCart={showToast}
                      isBestSeller={product.isBestSeller}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
