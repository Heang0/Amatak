'use client';

import { useState, useEffect } from 'react';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { Bookmark, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';

function AddToCartToast({ message, visible, themeStyle, primaryColor }: { message: string; visible: boolean; themeStyle: string; primaryColor: string }) {
  if (themeStyle === 'neo-brutalism') {
    return (
      <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-3 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] px-4 py-3 rounded-none text-black dark:text-white text-sm font-black uppercase tracking-wider transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <CheckCircle size={20} strokeWidth={2.5} style={{ color: primaryColor || '#4ade80' }} />
        <span className="truncate">{message}</span>
      </div>
    );
  }

  if (themeStyle === 'default') {
    return (
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 w-max max-w-sm z-[200] flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white text-sm font-bold transition-all duration-400 ease-out ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-90 pointer-events-none'}`}>
        <CheckCircle size={18} strokeWidth={2.5} style={{ color: primaryColor || '#10b981' }} />
        <span>{message}</span>
      </div>
    );
  }

  if (themeStyle === 'skincare-clean') {
    return (
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 w-max max-w-sm z-[200] flex items-center gap-3 bg-[#FAF9F6] dark:bg-[#0C0C0C] border border-[#E5E5E5] dark:border-[#222] px-6 py-3 shadow-md text-[#333] dark:text-[#E5E5E5] text-xs font-medium uppercase tracking-widest transition-all duration-400 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <CheckCircle size={16} strokeWidth={1.5} className="text-[#333] dark:text-[#E5E5E5]" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-none shadow-xl text-xs font-bold ${message.includes('បាន') ? 'tracking-normal' : 'uppercase tracking-wider'} transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
      <CheckCircle size={14} className="shrink-0" />
      <span className="truncate">{message}</span>
    </div>
  );
}

export default function FavoritesPage({ params }: { params: { locale: string; slug: string } }) {
  const pathname = usePathname();
  const { favorites } = useFavoritesStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [themeStyle, setThemeStyle] = useState('tech-minimal');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const isKm = params.locale === 'km';

  const isPathRouting = pathname?.includes('/store/');
  const storeHomeHref = isPathRouting ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;

  useEffect(() => {
    const loadStoreAndProducts = async () => {
      try {
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const store = await storeRes.json();
        
        setPrimaryColor(store.branding?.primaryColor || '#000000');
        setThemeStyle(store.branding?.themeStyle || 'fashion-editorial');

        const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${store._id}`);
        const prods = await prodRes.json();
        
        const storeProducts = prods.products || [];
        const favoriteProducts = storeProducts.filter((p: any) => 
          favorites.some(f => f.productId === p._id)
        );
        
        setProducts(favoriteProducts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (favorites.length > 0) {
      loadStoreAndProducts();
    } else {
      setLoading(false);
    }
  }, [params.slug, favorites]);

  const displayProducts = products.filter(p => favorites.some(f => f.productId === p._id));

  const showToast = () => {
    setToast({ message: isKm ? 'បានបញ្ចូលទៅកន្ត្រក!' : 'Added to bag!', visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  };

  const text = {
    title: isKm ? 'ចំណូលចិត្ត' : 'SAVED ITEMS',
    continue: isKm ? 'បន្តការទិញទំនិញ' : 'CONTINUE SHOPPING',
    emptyTitle: isKm ? 'មិនទាន់មានទំនិញក្នុងចំណូលចិត្តទេ' : 'NO SAVED ITEMS',
    emptyDesc: isKm ? 'អ្នកអាចរក្សាទុកទំនិញដែលពេញចិត្តនៅទីនេះ។' : 'Items you bookmark will appear here for easy access.',
    discover: isKm ? 'រុករកទំនិញ' : 'DISCOVER COLLECTION'
  };


  // -------------------------------------------------------------
  // THEME 3: NEO-BRUTALISM
  // -------------------------------------------------------------
  if (themeStyle === 'neo-brutalism') {
    return (
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#f4f4f4] dark:bg-[#111] font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        <div className="flex items-center justify-between py-4 border-b-[4px] border-black dark:border-white mb-8">
          <h1 className="text-xl font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-2">
            <span>{text.title}</span>
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-sm">{displayProducts.length}</span>
          </h1>
          <Link href={storeHomeHref} className="text-sm font-black text-black dark:text-white uppercase border-b-[3px] border-black dark:border-white pb-1 hover:bg-[#c084fc] transition-colors hover:text-black">
            {text.continue}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col space-y-3">
                <div className="aspect-square bg-white dark:bg-[#222] border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] w-full" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 border-[2px] border-black dark:border-white w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 border-[2px] border-black dark:border-white w-1/3" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="max-w-md mx-auto py-16 px-6 text-center border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black space-y-6 mt-12">
            <div className="w-16 h-16 border-[3px] border-black dark:border-white flex items-center justify-center mx-auto bg-[#c084fc] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Bookmark size={28} className="text-black" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-white uppercase mb-2 leading-tight">{text.emptyTitle}</h2>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{text.emptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-8 py-4 border-[3px] border-black dark:border-white text-black text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || '#c084fc' }}>
              {text.discover}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} primaryColor={primaryColor} themeStyle={themeStyle} onAddToCart={showToast} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
  if (themeStyle === 'default') {
    return (
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-gray-50 dark:bg-[#111318] font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/10 mb-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>{text.title}</span>
          </h1>
          <Link href={storeHomeHref} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            {text.continue}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col space-y-3">
                <div className="aspect-[4/5] bg-gray-200 dark:bg-white/5 rounded-3xl w-full" />
                <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-white/5 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="max-w-md mx-auto py-16 px-8 text-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm rounded-3xl space-y-6 mt-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-black/20 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
              <Bookmark size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{text.emptyTitle}</h2>
              <p className="text-sm text-gray-500">{text.emptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-8 py-3.5 text-white dark:text-gray-900 text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all" style={{ backgroundColor: primaryColor || '#000' }}>
              {text.discover}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} primaryColor={primaryColor} themeStyle={themeStyle} onAddToCart={showToast} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
  if (themeStyle === 'skincare-clean') {
    return (
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#FAF9F6] dark:bg-[#0C0C0C] font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] dark:border-[#222] mb-8">
          <h1 className="text-sm font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest flex items-center gap-3">
            <span>{text.title}</span>
            <span className="text-[11px] bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] px-2 py-1 rounded-sm">{displayProducts.length} ITEMS</span>
          </h1>
          <Link href={storeHomeHref} className="text-[11px] font-medium text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] uppercase tracking-widest transition-colors border-b border-transparent hover:border-[#333] dark:hover:border-[#E5E5E5]">
            {text.continue}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex flex-col space-y-3">
                <div className="aspect-square bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] w-full" />
                <div className="h-3 bg-[#E5E5E5] dark:bg-[#222] w-3/4" />
                <div className="h-3 bg-[#E5E5E5] dark:bg-[#222] w-1/3" />
              </div>
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="max-w-md mx-auto py-20 px-8 text-center space-y-6">
            <Bookmark size={32} strokeWidth={1} className="text-[#888] mx-auto" />
            <div>
              <h2 className="text-sm font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest mb-3">{text.emptyTitle}</h2>
              <p className="text-xs text-[#888]">{text.emptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-10 py-3 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity">
              {text.discover}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} primaryColor={primaryColor} themeStyle={themeStyle} onAddToCart={showToast} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: FASHION EDITORIAL / AURUM (Fallback)
  // -------------------------------------------------------------
  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh]">
      <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
      
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-6">
        <h1 className={`text-xs sm:text-sm font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white flex items-center gap-2`}>
          <span>{text.title}</span>
          <span className="text-gray-400 font-normal">| {displayProducts.length} |</span>
        </h1>
        <Link href={storeHomeHref} className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}>
          {text.continue}
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse flex flex-col space-y-3">
              <div className="aspect-square bg-stone-100 dark:bg-stone-900 rounded-none w-full border border-gray-200 dark:border-white/[0.06]" />
              <div className="h-3 bg-stone-100 dark:bg-stone-900 rounded-none w-3/4" />
              <div className="h-3 bg-stone-100 dark:bg-stone-900 rounded-none w-1/3" />
            </div>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="max-w-md mx-auto py-16 px-6 text-center border border-gray-200 dark:border-white/[0.08] bg-stone-50/40 dark:bg-stone-900/20 rounded-none space-y-4 my-6">
          <div className="w-10 h-10 bg-white dark:bg-stone-900 border border-gray-200 dark:border-white/10 rounded-none flex items-center justify-center mx-auto">
            <Bookmark size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>{text.emptyTitle}</h2>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">{text.emptyDesc}</p>
          </div>
          <div className="pt-2">
            <Link href={storeHomeHref} className={`inline-block px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all rounded-none shadow-xs`} style={{ backgroundColor: primaryColor || undefined }}>
              {text.discover}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product._id} product={product} primaryColor={primaryColor} themeStyle={themeStyle} onAddToCart={showToast} />
          ))}
        </div>
      )}
    </div>
  );
}
