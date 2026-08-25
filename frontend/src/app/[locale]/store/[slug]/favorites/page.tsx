'use client';

import { useState, useEffect } from 'react';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { Bookmark, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProductCard from '@/components/store/ProductCard';

function AddToCartToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-none shadow-xl text-xs font-bold ${message.includes('បាន') ? 'tracking-normal' : 'uppercase tracking-wider'} transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
      }`}
    >
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
  const [themeStyle, setThemeStyle] = useState('fashion-editorial');
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

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh]">
      <AddToCartToast message={toast.message} visible={toast.visible} />
      
      {/* Sleek Minimalist Editorial Sub-Bar */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-6">
        <h1 className={`text-xs sm:text-sm font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white flex items-center gap-2`}>
          <span>{isKm ? 'ចំណូលចិត្ត' : 'SAVED ITEMS'}</span>
          <span className="text-gray-400 font-normal">| {displayProducts.length} |</span>
        </h1>

        <Link
          href={storeHomeHref}
          className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}
        >
          {isKm ? 'បន្តការទិញទំនិញ' : 'CONTINUE SHOPPING'}
        </Link>
      </div>

      {/* Loading Skeleton */}
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
        /* Minimalist Editorial Empty State */
        <div className="max-w-md mx-auto py-16 px-6 text-center border border-gray-200 dark:border-white/[0.08] bg-stone-50/40 dark:bg-stone-900/20 rounded-none space-y-4 my-6">
          <div className="w-10 h-10 bg-white dark:bg-stone-900 border border-gray-200 dark:border-white/10 rounded-none flex items-center justify-center mx-auto">
            <Bookmark size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>
              {isKm ? 'មិនទាន់មានទំនិញក្នុងចំណូលចិត្តទេ' : 'NO SAVED ITEMS'}
            </h2>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              {isKm ? 'អ្នកអាចរក្សាទុកទំនិញដែលពេញចិត្តនៅទីនេះ។' : 'Items you bookmark will appear here for easy access.'}
            </p>
          </div>

          <div className="pt-2">
            <Link 
              href={storeHomeHref} 
              className={`inline-block px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all rounded-none shadow-xs`}
            >
              {isKm ? 'រុករកទំនិញ' : 'DISCOVER COLLECTION'}
            </Link>
          </div>
        </div>
      ) : (
        /* Saved Products Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              primaryColor={primaryColor} 
              themeStyle={themeStyle}
              onAddToCart={showToast}
            />
          ))}
        </div>
      )}
    </div>
  );
}
