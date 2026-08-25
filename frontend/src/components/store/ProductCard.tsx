'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { Heart, Bookmark, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams, useRouter } from 'next/navigation';

export default function ProductCard({ 
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

  const isFavorite = user?.favorites?.some(f => 
    typeof f === 'string' ? f === product._id : f?._id === product._id
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants && product.variants.length > 0) {
      router.push(`${basePath}/product/${product.slug || product._id}`);
      return;
    }

    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    onAddToCart(product);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`${basePath}/profile`);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/favorites/${product._id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerInfo({ ...user, favorites: data.favorites });
      }
    } catch (err) {
      console.error(err);
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
  const productTitle = params.locale === 'km' && product.titleKm ? product.titleKm : product.title;

  // 1. 👗 FASHION EDITORIAL THEME (Minimalist Luxury / Zara & COS Aesthetic)
  if (themeStyle === 'fashion-editorial' || themeStyle === 'minimalist') {
    return (
      <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col">
        {/* Square Image (Sharp Corners) */}
        <div className="relative aspect-square w-full bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden mb-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
            alt={productTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />

          {/* Clean Bookmark Badge */}
          <button
            onClick={handleWishlist}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-none bg-white/90 dark:bg-black/80 backdrop-blur-xs text-gray-900 dark:text-white hover:scale-110 active:scale-95 transition-all shadow-xs"
            title="Save"
          >
            <Bookmark size={13} className={isFavorite ? 'fill-current text-black dark:text-white' : 'text-gray-600 dark:text-gray-300'} />
          </button>

          {badge && (
            <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 ${params.locale === 'km' ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none ${badge.bg}`}>
              {badge.text}
            </span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-1">
          <h3 className={`text-xs sm:text-sm font-bold ${params.locale === 'km' ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white line-clamp-1 mb-1`}>
            {productTitle}
          </h3>
          <p className="text-xs font-extrabold text-gray-900 dark:text-white mb-2">
            ${product.price.toFixed(2)}
          </p>

          {/* Clean Monochromatic Button (Sharp Corners) */}
          <button
            onClick={handleAdd}
            className={`w-full mt-auto py-2 px-3 border border-gray-900 dark:border-white text-gray-900 dark:text-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 text-[10px] sm:text-xs font-bold ${params.locale === 'km' ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-1.5 active:scale-98 rounded-none`}
          >
            <ShoppingBag size={12} />
            <span>{params.locale === 'km' ? 'ដាក់កន្ត្រក' : 'ADD TO BAG'}</span>
          </button>
        </div>
      </Link>
    );
  }

  // 2. 🧴 CLEAN SKINCARE & BEAUTY THEME (Clinical & Apothecary Clean Box)
  if (themeStyle === 'skincare-clean') {
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
            <Bookmark size={13} className={isFavorite ? 'fill-stone-900 text-stone-900 dark:fill-white dark:text-white' : 'text-stone-400'} />
          </button>
        </div>

        {/* Product Details */}
        <div className="flex flex-col flex-1 px-0.5">
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-mono uppercase tracking-wider mb-0.5 truncate">
            {product.category?.name || 'FORMULA'}
          </p>

          <h3 className={`text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 line-clamp-1 mb-2 ${isKm ? 'tracking-normal' : 'tracking-tight'}`}>
            {productTitle}
          </h3>

          <div className="mt-auto pt-2 flex items-center justify-between border-t border-stone-100 dark:border-white/[0.06]">
            <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white font-mono">
              ${product.price.toFixed(2)}
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

  // 3. 💻 MODERN TECH & MINIMALIST GADGETS (Clean Precision Electronics)
  if (themeStyle === 'minimal-tech') {
    return (
      <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col p-3 rounded-none bg-white dark:bg-[#0D0F14] border border-gray-200 dark:border-white/[0.08] hover:border-cyan-500/60 dark:hover:border-cyan-400/50 transition-all shadow-2xs">
        <div className="relative aspect-square w-full bg-[#F4F6F9] dark:bg-[#151922] rounded-none mb-2.5 overflow-hidden p-2.5 flex items-center justify-center border border-gray-100 dark:border-white/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
            alt={productTitle} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-none" 
            loading="lazy"
          />

          {badge && (
            <span className="absolute top-2 left-2 text-[8px] font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/90 border border-cyan-300 dark:border-cyan-500/30 px-1.5 py-0.5 rounded-none uppercase tracking-widest">
              {badge.text}
            </span>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-1.5 rounded-none bg-white/95 dark:bg-black/80 backdrop-blur-xs text-gray-700 dark:text-gray-300 hover:scale-110 active:scale-95 transition-all shadow-2xs border border-gray-200/60 dark:border-white/10"
            title="Save"
          >
            <Bookmark size={13} className={isFavorite ? 'fill-cyan-500 text-cyan-500' : 'text-gray-400'} />
          </button>
        </div>

        <div className="flex flex-col flex-1 px-0.5">
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400/80 font-mono uppercase tracking-wider mb-0.5 truncate">
            {product.category?.name || 'TECH'}
          </p>

          <h3 className={`text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 ${isKm ? 'tracking-normal' : 'tracking-tight'}`}>
            {productTitle}
          </h3>

          <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-100 dark:border-white/[0.06]">
            <span className="text-xs sm:text-sm font-mono font-black text-gray-900 dark:text-cyan-300">
              ${product.price.toFixed(2)}
            </span>

            <button
              onClick={handleAdd}
              className="w-7 h-7 rounded-none bg-black dark:bg-cyan-500 hover:bg-neutral-800 dark:hover:bg-cyan-400 text-white dark:text-black flex items-center justify-center transition-all active:scale-95 shadow-xs"
              title="Add to cart"
            >
              <ShoppingBag size={13} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // 4. ⚡ NEO-BRUTALISM & STREETWEAR (Bold Urban Pop)
  if (themeStyle === 'neo-brutalism') {
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
            <Bookmark size={12} className={isFavorite ? 'fill-black text-black dark:fill-white dark:text-white' : 'text-gray-400'} />
          </button>
        </div>

        <h3 className={`text-xs sm:text-sm font-black uppercase text-black dark:text-white line-clamp-1 mb-1 ${isKm ? 'tracking-normal' : 'tracking-wider'}`}>
          {productTitle}
        </h3>

        <div className="mt-auto pt-1.5 flex items-center justify-between border-t-[1.5px] border-black dark:border-white">
          <span className="text-xs sm:text-sm font-black bg-amber-300 text-black px-1.5 py-0.5 border border-black rounded-none">
            ${product.price.toFixed(2)}
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

  // 5. 🛍️ DEFAULT MODERN RETAIL (Editorial Fashion)
  return (
    <Link href={`${basePath}/product/${product.slug || product._id}`} className="group flex flex-col p-3 rounded-none bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] shadow-2xs hover:border-black dark:hover:border-white transition-all">
      <div className="relative aspect-square w-full bg-stone-100 dark:bg-stone-900 rounded-none mb-2.5 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.imageUrl?.replace('/upload/', '/upload/w_600,c_limit,q_auto/')} 
          alt={productTitle} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-none" 
          loading="lazy"
        />
        
        {badge && (
          <span 
            className="absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider shadow-2xs"
            style={{ backgroundColor: primaryColor || '#E84C3D' }}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 px-0.5">
        <h3 className={`text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'}`}>
          {productTitle}
        </h3>
        
        <div className="mt-auto pt-1 flex items-center justify-between">
          <span 
            className="text-xs sm:text-sm font-black text-gray-900 dark:text-white font-mono"
            style={{ color: primaryColor && primaryColor !== '#000000' && primaryColor !== '#111111' ? primaryColor : undefined }}
          >
            ${product.price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAdd}
            className="w-7 h-7 rounded-none flex items-center justify-center text-white shadow-2xs hover:scale-105 active:scale-95 transition-all bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            title="Add to cart"
          >
            <ShoppingBag size={13} />
          </button>
        </div>
      </div>
    </Link>
  );
}
