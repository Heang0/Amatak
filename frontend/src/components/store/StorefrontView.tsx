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
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-xl text-sm font-medium transition-all duration-300 ${
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
export default function StorefrontView({ 
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
  const [themeStyle, setThemeStyle] = useState<string>(previewTheme || initialStore?.branding?.themeStyle || cached?.themeStyle || 'default');
  const [bannerUrl, setBannerUrl] = useState<string | null>(initialStore?.branding?.bannerUrl || cached?.bannerUrl || null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest' | 'best-seller'>('name-asc');
  const allLabel = params.locale === 'km' ? 'ទាំងអស់' : 'All';
  const isKm = params.locale === 'km';

  useEffect(() => {
    setActiveCategorySlug(categorySlug || 'All');
  }, [categorySlug]);

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
      if (String(pCat) !== String(cat._id)) return false;
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
    if (themeStyle === 'neo-brutalism') {
      return `flex items-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-black uppercase tracking-[0.18em] transition ${isActive ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:shadow-none'}`;
    }

    return `flex items-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white' : 'bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200 dark:bg-[#111111] dark:text-gray-300 dark:hover:bg-[#1f1f1f]'}`;
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
          <div className={`relative w-full overflow-hidden h-[140px] sm:h-[180px] md:h-[240px] lg:h-[300px] max-h-[55vh] ${themeStyle === 'default' ? 'rounded-2xl md:rounded-3xl' : ''}`}>
            <img
              src={bannerUrl}
              alt="Store Banner"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 sm:space-y-10">
        {!bannerUrl && (
          <div className="pt-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">{isKm ? 'ស្វែងយល់' : 'Discover'}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">{isKm ? 'កម្រងផលិតផលថ្មីៗបំផុត។' : 'The latest collection.'}</p>
          </div>
        )}

        {categories.length > 0 && (viewMode === 'home' || viewMode === 'catalog' || viewMode === 'categories') && (
          <div className="mb-6 md:mb-10 overflow-x-auto pb-4 scrollbar-hide scroll-smooth -mx-4 px-4 sm:-mx-0 sm:px-0 border-b border-gray-200 dark:border-gray-800" ref={categoryTabsRef}>
            <div className="flex gap-3 min-w-max">
              <Link
                href={getAppendParams(`/${params.locale}/store/${params.slug}/products`)}
                className={getCategoryPillClass(activeCategorySlug === 'All')}
                data-category-active={activeCategorySlug === 'All' ? 'true' : 'false'}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategorySlug('All');
                }}
              >
                <Grid size={16} className="shrink-0" />
                {isKm ? 'ទាំង​អស់' : 'All'}
              </Link>
              {categories
                .filter(cat => products.some(p => {
                  const pCat = p.category?._id ?? p.category;
                  return String(pCat) === String(cat._id);
                }))
                .map(cat => {
                  const count = products.filter(p => {
                    const pCat = p.category?._id ?? p.category;
                    return String(pCat) === String(cat._id);
                  }).length;

                  // On home/catalog, tabs should set the active category client-side and navigate to the products root (no query param).
                  if (viewMode === 'categories') {
                    const href = getAppendParams(`/${params.locale}/store/${params.slug}/category/${cat.slug}`);
                    return (
                      <Link
                        key={cat._id}
                        href={href}
                        className={getCategoryPillClass(activeCategorySlug === cat.slug)}
                        data-category-active={activeCategorySlug === cat.slug ? 'true' : 'false'}
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
                      }}
                      className={getCategoryPillClass(activeCategorySlug === cat.slug)}
                      data-category-active={activeCategorySlug === cat.slug ? 'true' : 'false'}
                    >
                      {params.locale === 'km' && cat.nameKm ? cat.nameKm : cat.name}
                    </a>
                  );
                })}
            </div>
          </div>
        )}

        {/* CATEGORIES VIEW */}
        {viewMode === 'categories' && (
          <div className="pt-2 pb-10">
            <div className="mb-8 md:mb-12">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
                {isKm ? 'ប្រភេទផលិតផល' : 'Categories'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg max-w-2xl">
                {isKm ? 'ស្វែងរកប្រភេទផលិតផលដែលយើងបានរៀបចំសម្រាប់អ្នក។' : 'Browse curated category collections to find what you need faster.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map(cat => {
                const count = products.filter(p => {
                  const pCat = p.category?._id ?? p.category;
                  return String(pCat) === String(cat._id);
                }).length;
                return (
                  <Link 
                    key={cat._id}
                    href={getAppendParams(`/${params.locale}/store/${params.slug}/category/${cat.slug}`)}
                    className={`group relative overflow-hidden p-6 transition-all duration-300 flex flex-col justify-between min-h-[160px] ${
                      themeStyle === 'neo-brutalism' 
                        ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 hover:translate-x-[-1px] rounded-none' 
                        : themeStyle === 'minimalist'
                        ? 'bg-gray-50 dark:bg-[#1a1a1a] rounded-sm hover:bg-gray-100 dark:hover:bg-[#222]'
                        : 'bg-white dark:bg-[#151515] rounded-3xl border border-gray-100 dark:border-gray-800 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words pr-2">
                        {isKm && cat.nameKm ? cat.nameKm : cat.name}
                      </h3>
                      <span className={`shrink-0 inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ${
                        themeStyle === 'neo-brutalism' ? 'border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {count} {isKm ? 'ផលិតផល' : 'items'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm font-bold transition-colors mt-auto" style={{ color: primaryColor && primaryColor !== '#000000' && primaryColor !== '#000' ? primaryColor : undefined }}>
                      <span className={`${!primaryColor || primaryColor === '#000000' || primaryColor === '#000' ? 'text-gray-900 dark:text-white' : ''}`}>
                        {isKm ? 'មើលផលិតផល' : 'View products'}
                      </span>
                      <svg className={`w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1 ${!primaryColor || primaryColor === '#000000' || primaryColor === '#000' ? 'text-gray-900 dark:text-white' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
                    <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl mb-4 w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-[#1a1a1a] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-[#1a1a1a] rounded w-1/2 mb-4" />
                    <div className="mt-auto h-8 bg-gray-100 dark:bg-[#1a1a1a] rounded w-full" />
                  </div>
                ))}
              </div>
            ) : productList.length === 0 ? (
              <div className="text-center py-24 bg-gray-50 dark:bg-[#111111] rounded-3xl border border-gray-100 dark:border-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400 font-medium">{isKm ? 'មិនមានផលិតផលទេ។' : 'No products found.'}</p>
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
