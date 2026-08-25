'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingBag, X, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage({ params }: { params: { slug: string, locale: string } }) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isKm = params.locale === 'km';
  const isPathRouting = pathname?.includes('/store/');
  const storeHomeHref = isPathRouting ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;
  const checkoutHref = isPathRouting ? `/${params.locale}/store/${params.slug}/checkout` : `/${params.locale}/checkout`;
  
  const [mounted, setMounted] = useState(false);
  const [themeStyle, setThemeStyle] = useState('fashion-editorial');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  
  const text = {
    shoppingBag: isKm ? 'កន្ត្រកទំនិញ' : 'SHOPPING BAG',
    continueShopping: isKm ? 'បន្តការទិញទំនិញ' : 'CONTINUE SHOPPING',
    cartEmpty: isKm ? 'កន្ត្រករបស់អ្នកទំនេរ' : 'YOUR SHOPPING BAG IS EMPTY',
    cartEmptyDesc: isKm ? 'មិនទាន់មានទំនិញណាមួយនៅក្នុងកន្ត្រកនៅឡើយទេ។' : 'You currently have no items in your shopping bag.',
    startShopping: isKm ? 'រុករកទំនិញ' : 'DISCOVER COLLECTION',
    subtotal: isKm ? 'តម្លៃសរុប' : 'SUBTOTAL',
    proceedCheckout: isKm ? 'បន្តទៅការទូទាត់' : 'PROCEED TO CHECKOUT',
  };

  useEffect(() => {
    setMounted(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setThemeStyle(data.branding?.themeStyle || 'fashion-editorial');
        setPrimaryColor(data.branding?.primaryColor || '#000000');
      })
      .catch(console.error);
  }, [params.slug, searchParams]);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh]">
        {/* Sub-bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-6">
          <h1 className={`text-xs sm:text-sm font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white flex items-center gap-2`}>
            <span>{text.shoppingBag}</span>
            <span className="text-gray-400 font-normal">| 0 |</span>
          </h1>
          <Link
            href={storeHomeHref}
            className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}
          >
            {text.continueShopping}
          </Link>
        </div>

        {/* Empty Box */}
        <div className="max-w-md mx-auto py-16 px-6 text-center border border-gray-200 dark:border-white/[0.08] bg-stone-50/40 dark:bg-stone-900/20 rounded-none space-y-4 my-6">
          <div className="w-10 h-10 bg-white dark:bg-stone-900 border border-gray-200 dark:border-white/10 rounded-none flex items-center justify-center mx-auto">
            <ShoppingBag size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>
              {text.cartEmpty}
            </h2>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
              {text.cartEmptyDesc}
            </p>
          </div>

          <div className="pt-2">
            <Link 
              href={storeHomeHref} 
              className={`inline-block px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all rounded-none shadow-xs`}
            >
              {text.startShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh]">
      {/* Top Sub-Bar */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-6">
        <h1 className={`text-xs sm:text-sm font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white flex items-center gap-2`}>
          <span>{text.shoppingBag}</span>
          <span className="text-gray-400 font-normal">| {items.reduce((acc, i) => acc + i.quantity, 0)} |</span>
        </h1>

        <Link
          href={storeHomeHref}
          className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}
        >
          {text.continueShopping}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 divide-y divide-gray-100 dark:divide-white/[0.06] border-y border-gray-100 dark:border-white/[0.06]">
          {items.map((item) => (
            <div key={item.cartItemId} className="py-4 flex gap-4 items-start">
              {/* Square Image Thumbnail */}
              <div className="w-20 sm:w-24 aspect-square bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden shrink-0 border border-gray-200 dark:border-white/[0.08]">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl.replace('/upload/', '/upload/w_300,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={20} />
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'}`}>
                    {isKm && item.titleKm ? item.titleKm : item.title}
                  </h3>
                  <button 
                    onClick={() => removeItem(item.cartItemId)} 
                    className="p-1 -mr-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
                    title="Remove"
                  >
                    <X size={15} />
                  </button>
                </div>
                
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  {/* Stepper */}
                  <div className="flex items-center border border-gray-200 dark:border-white/20 h-8 px-1.5 shrink-0 rounded-none">
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} 
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="w-7 text-center font-bold text-xs">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} 
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      aria-label="Increase"
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 p-5 border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#13161F] rounded-none shadow-2xs space-y-5">
          <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-white/[0.06]`}>
            {isKm ? 'សង្ខេបការបញ្ជាទិញ' : 'ORDER SUMMARY'}
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-500">
              <span>{text.subtotal}</span>
              <span className="font-bold text-gray-900 dark:text-white font-mono">${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-500">
              <span>{isKm ? 'ថ្លៃដឹកជញ្ជូន' : 'ESTIMATED SHIPPING'}</span>
              <span className="font-medium text-gray-400">{isKm ? 'គណនាក្នុងទំព័រទូទាត់' : 'Calculated at checkout'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{isKm ? 'តម្លៃសរុប' : 'TOTAL'}</span>
            <span className="text-lg font-black text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
          </div>

          <button 
            onClick={() => router.push(checkoutHref)}
            className={`w-full py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-2 rounded-none shadow-sm active:scale-98`}
          >
            <span>{text.proceedCheckout}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
