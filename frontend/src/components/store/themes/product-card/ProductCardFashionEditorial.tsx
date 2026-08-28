'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { Heart, Bookmark, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProductCardFashionEditorial({ 
  product, 
  primaryColor, 
  themeStyle = 'fashion-editorial', 
  onAddToCart,
  isBestSeller = false
}: {
  product: any;
  primaryColor: string;
  themeStyle?: string;
  onAddToCart: (product: any) => void;
  isBestSeller?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const addItem = useCartStore(state => state.addItem);
  const user = useCustomerAuthStore(state => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore(state => state.setCustomerInfo);

  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting && params.slug ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;
  const isKm = params?.locale === 'km';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product || !product._id) return null;

  const addFavorite = useFavoritesStore(state => state.addFavorite);
  const removeFavorite = useFavoritesStore(state => state.removeFavorite);
  const isLocalFavorite = useFavoritesStore(state => state.isFavorite(product._id));

  const isFavorite = user?.favorites?.some(f => 
    typeof f === 'string' ? f === product._id : f?._id === product._id
  ) || isLocalFavorite;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants && product.variants.length > 0) {
      router.push(`${basePath}/product/${product.slug || product._id}`);
      return;
    }

    addItem({
      productId: product._id,
      title: product.title || '',
      price: product.price ?? 0,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    if (onAddToCart) onAddToCart(product);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorite) {
      removeFavorite(product._id);
    } else {
      addFavorite(product._id);
    }

    if (user?.token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/favorites/${product._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setCustomerInfo({
            ...user,
            favorites: Array.isArray(data) ? data : data.favorites
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Real inventory / status badge helper
  const getProductBadge = () => {
    if (product.stock === 0) {
      return { text: params.locale === 'km' ? 'អស់ពីស្តុក' : 'Out of Stock', bg: 'bg-red-500 text-white' };
    }
    if (product.stock !== undefined && product.stock > 0 && product.stock <= 3) {
      return { text: params.locale === 'km' ? `នៅសល់ ${product.stock}` : `Only ${product.stock} left`, bg: 'bg-amber-500 text-white' };
    }
    if (isBestSeller || product.isBestSeller) {
      return { text: params.locale === 'km' ? 'ពេញនិយម' : 'Popular', bg: 'bg-black text-white dark:bg-white dark:text-black' };
    }
    return null;
  };

  const badge = getProductBadge();
  const productTitle = params.locale === 'km' && product.titleKm ? product.titleKm : (product.title || 'Product');
  const priceDisplay = Number(product.price ?? 0).toFixed(2);
  
  // Detect if the title contains Khmer characters to prevent weird letter spacing
  const isKhmerTitle = /[\u1780-\u17FF]/.test(productTitle);

  // 1. 👗 FASHION EDITORIAL THEME (Minimalist Luxury / Zara & Balenciaga Aesthetic)
  if ('fashion-editorial' === 'fashion-editorial' || 'fashion-editorial' === 'minimalist') {
    return (
      <div className="group flex flex-col">
        {/* Square Image (Sharp Corners) */}
        <Link href={`${basePath}/product/${product.slug || product._id}`} className="relative aspect-square w-full bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
            alt={productTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />

          {badge && (
            <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black shadow-2xs">
              {badge.text}
            </span>
          )}
        </Link>

        {/* Product Details - Aurum Reference Style */}
        <div className="flex flex-col flex-1 mt-0.5">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <Link href={`${basePath}/product/${product.slug || product._id}`} className="flex-1">
              <h3 className={`text-gray-900 dark:text-white line-clamp-1 ${isKhmerTitle ? 'font-normal text-[10px] leading-tight' : 'font-medium text-[11px] sm:text-xs uppercase tracking-wider'}`}>
                {productTitle}
              </h3>
            </Link>
            
            {/* Bookmark next to title */}
            <button
              onClick={handleWishlist}
              className="text-black dark:text-white hover:opacity-70 transition-opacity flex-shrink-0"
              title="Save"
            >
              <Bookmark size={16} strokeWidth={1.5} className={mounted && isFavorite ? 'fill-black dark:fill-white' : ''} />
            </button>
          </div>

          <span className="text-[13px] font-medium text-gray-900 dark:text-white mb-3">
            ${priceDisplay}
          </span>

          {/* Full-width Add to Bag CTA */}
          <button
            onClick={handleAdd}
            className="w-full mt-auto py-2.5 sm:py-3 px-4 border border-black dark:border-white bg-transparent hover:bg-black dark:hover:bg-white text-black hover:text-white dark:text-white dark:hover:text-black text-[10px] sm:text-[11px] uppercase tracking-wider font-medium transition-colors rounded-none flex items-center justify-center gap-2"
          >
            ADD TO BAG
          </button>
        </div>
      </div>
    );
  }

  // 2. 🧴 CLEAN SKINCARE & BEAUTY THEME (Clinical & Apothecary Clean Box)
  if ('fashion-editorial' === 'skincare-clean') {
    return (
      <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col p-3 rounded-none bg-white dark:bg-[#131518] border border-stone-200 dark:border-white/[0.08] hover:border-stone-800 dark:hover:border-white transition-all shadow-2xs">
        {/* Clinical Clean Product Frame */}
        <div className="relative aspect-square w-full bg-[#F8F6F2] dark:bg-[#1A1C20] rounded-none mb-3 overflow-hidden p-3.5 flex items-center justify-center border border-stone-200/60 dark:border-white/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
            alt={productTitle} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-none" 
            loading="lazy"
          />

          {badge && (
            <span className="absolute top-2 left-2 text-[8px] font-bold tracking-widest px-2 py-0.5 rounded-none bg-stone-900 text-white dark:bg-white dark:text-black uppercase shadow-2xs">
              {badge.text}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 rounded-none bg-white/95 dark:bg-black/80 backdrop-blur-xs text-stone-700 dark:text-stone-300 hover:scale-110 active:scale-95 transition-all shadow-2xs border border-stone-200/60 dark:border-white/10"
            title="Save"
          >
            <Bookmark size={13} className={mounted && isFavorite ? 'fill-stone-900 text-stone-900 dark:fill-white dark:text-white' : 'text-stone-400'} />
          </button>
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 px-0.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono uppercase tracking-wider mb-0.5 truncate">
            {typeof product.category === 'object' && product.category?.name ? product.category.name : 'FORMULA'}
          </p>

          <h3 className={`text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1 mb-2 ${isKm ? 'tracking-normal' : 'tracking-tight'}`}>
            {productTitle}
          </h3>

          <div className="mt-auto pt-2 flex items-center justify-between border-t border-stone-100 dark:border-white/[0.06]">
            <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white font-mono">
              ${priceDisplay}
            </span>

            {/* Quick Add Button */}
            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-none bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-stone-200 text-white dark:text-black flex items-center justify-center transition-all active:scale-95 shadow-2xs"
              title="Add to bag"
            >
              <ShoppingBag size={13} />
            </button>
          </div>
        </div>
      </Link>
    );
  }


  // 4. ⚡ NEO-BRUTALISM & STREETWEAR (Bold Urban Pop)
  if ('fashion-editorial' === 'neo-brutalism') {
    return (
      <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col p-2.5 border-[2.5px] border-black dark:border-white bg-white dark:bg-[#111] shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-none">
        <div className="relative aspect-square w-full bg-[#f4f4f4] dark:bg-[#222] border-[1.5px] border-black dark:border-white overflow-hidden mb-2 p-2 rounded-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
            alt={productTitle} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-none" 
            loading="lazy"
          />
          {badge && (
            <span className="absolute top-1.5 left-1.5 bg-black text-white dark:bg-white dark:text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded-none tracking-wider">
              {badge.text}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-1.5 right-1.5 p-1.5 rounded-none bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white hover:scale-110 active:scale-95 transition-all shadow-2xs"
            title="Save"
          >
            <Bookmark size={12} className={mounted && isFavorite ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-gray-400'} />
          </button>
        </div>

        <h3 className={`text-xs sm:text-sm font-black uppercase text-black dark:text-white line-clamp-1 mb-1 ${isKm ? 'tracking-normal' : 'tracking-wider'}`}>
          {productTitle}
        </h3>

        <div className="mt-auto pt-1.5 flex items-center justify-between border-t-[1.5px] border-black dark:border-white">
          <span className="text-xs sm:text-sm font-black bg-amber-300 text-black px-1.5 py-0.5 border border-black rounded-none">
            ${priceDisplay}
          </span>

          <button
            onClick={handleAdd}
            className="w-7 h-7 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-gray-100 text-white dark:text-black flex items-center justify-center border border-black dark:border-white active:scale-95 transition-all rounded-none"
            title="Add to cart"
          >
            <ShoppingBag size={13} />
          </button>
        </div>
      </Link>
    );
  }

  // 5. 🛍️ DEFAULT MODERN RETAIL (Smooth Glassmorphism & Soft Radii)
  return (
    <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col bg-white dark:bg-[#1A1C20] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10">
      <div className="relative aspect-square w-full bg-gray-50 dark:bg-black/20 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
          alt={productTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy"
        />

        {badge && (
          <span 
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide"
            style={{ backgroundColor: primaryColor || '#10B981' }}
          >
            {badge.text}
          </span>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full text-gray-500 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-all shadow-sm active:scale-95"
          title="Save"
        >
          <Bookmark size={15} strokeWidth={2} className={mounted && isFavorite ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <h3 className={`font-bold text-gray-900 dark:text-white line-clamp-1 mb-1 ${isKhmerTitle ? 'text-xs tracking-normal' : 'text-sm'}`}>
          {productTitle}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-black text-gray-900 dark:text-white">
            ${priceDisplay}
          </span>

          <button
            onClick={handleAdd}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white flex items-center justify-center transition-colors active:scale-95"
            title="Add to cart"
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </Link>
  );
}
