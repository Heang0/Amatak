'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartDrawer({
  primaryColor = '#000000',
  themeStyle = 'fashion-editorial'
}: {
  primaryColor?: string;
  themeStyle?: string;
}) {
  const { items, isDrawerOpen, setDrawerOpen, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const favorites = useFavoritesStore(state => state.favorites);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const isKm = params.locale === 'km';
  const [activeTab, setActiveTab] = useState<'bag' | 'fav'>('bag');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const isPathRouting = pathname?.includes('/store/');
  const checkoutHref = isPathRouting ? `/${params.locale}/store/${params.slug}/checkout` : `/${params.locale}/checkout`;

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isCheckoutLoading) {
      setIsCheckoutLoading(false);
      setDrawerOpen(false);
    }
  }, [pathname, isCheckoutLoading, setDrawerOpen]);

  if (!isDrawerOpen) return null;

  const subtotal = getTotalPrice();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-2xs"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-[#111318] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-white/[0.08]"
      >
        {/* Header with Close Icon */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {isKm ? 'កន្ត្រករបស់អ្នក' : 'YOUR SELECTION'}
          </span>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 -mr-1 text-gray-800 dark:text-white hover:opacity-60 transition-opacity"
            title="Close"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        {/* Top Tabs */}
        <div className={`flex items-center gap-6 px-4 md:px-6 pt-3 pb-3 border-b border-gray-100 dark:border-white/[0.06] text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'}`}>
          <button
            onClick={() => setActiveTab('bag')}
            className={`transition-colors pb-1 border-b-2 ${
              activeTab === 'bag' 
                ? 'border-black dark:border-white text-black dark:text-white font-extrabold' 
                : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {isKm ? `កន្ត្រក | ${items.length} |` : `SHOPPING BAG | ${items.length} |`}
          </button>
          <button
            onClick={() => setActiveTab('fav')}
            className={`transition-colors pb-1 border-b-2 ${
              activeTab === 'fav' 
                ? 'border-black dark:border-white text-black dark:text-white font-extrabold' 
                : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {isKm ? `ចំណូលចិត្ត | ${favorites.length} |` : `FAVORITE | ${favorites.length} |`}
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 divide-y divide-gray-100 dark:divide-white/[0.04]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.05] rounded-none flex items-center justify-center mb-3 border border-gray-200 dark:border-white/10">
                <ShoppingBag size={22} className="text-gray-400" />
              </div>
              <p className={`text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white`}>
                {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your bag is empty'}
              </p>
              <button 
                onClick={() => setDrawerOpen(false)}
                className={`mt-4 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none transition-all`}
              >
                {isKm ? 'បន្តការទិញ' : 'Continue Shopping'}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="pt-5 first:pt-0 flex gap-4">
                {/* Product Thumbnail (Square) */}
                <div className="w-20 h-20 shrink-0 bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white line-clamp-1">
                      {isKm && item.titleKm ? item.titleKm : item.title}
                    </h3>
                    <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5">
                      ${item.price.toFixed(2)}
                    </p>
                    
                    {/* Selected Variant Tags */}
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}
                  </div>

                  {/* Stepper + Trash */}
                  <div className="flex items-center justify-between mt-3 pt-2">
                    <div className="flex items-center border border-gray-300 dark:border-white/20 h-8 px-1">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                        className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary (Matching Reference Screen) */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111318] space-y-4">
            
            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span className="uppercase tracking-wider">{isKm ? 'សរុបបណ្ដោះអាសន្ន' : 'Subtotal'}</span>
                <span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                <span className="uppercase tracking-wider">{isKm ? 'តម្លៃដឹកជញ្ជូន' : 'Estimated delivery fee'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{isKm ? 'ឥតគិតថ្លៃ' : 'Free'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/[0.06] text-sm font-black text-gray-900 dark:text-white">
                <span className="uppercase tracking-wider">{isKm ? 'សរុបរួម' : 'TOTAL'}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Solid Black Button: CONTINUE TO CHECKOUT */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsCheckoutLoading(true);
                router.push(checkoutHref);
              }}
              disabled={isCheckoutLoading}
              className={`w-full h-12 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm`}
            >
              <span>{isKm ? 'បន្តការទូទាត់' : 'CONTINUE TO CHECKOUT'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
