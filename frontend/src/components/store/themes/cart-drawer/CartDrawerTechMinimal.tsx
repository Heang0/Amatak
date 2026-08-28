'use client';

import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartDrawerTechMinimal({
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

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isCheckoutLoading) {
      setIsCheckoutLoading(false);
      setDrawerOpen(false);
    }
  }, [pathname, isCheckoutLoading, setDrawerOpen]);

  if (!isDrawerOpen) return null;
  const subtotal = getTotalPrice();

  // -------------------------------------------------------------
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
  if ('tech-minimal' === 'default') {
    return (
      <>
        <div className="fixed inset-0 bg-gray-900/40 z-[100] transition-opacity backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-[#111318] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-white/10 rounded-l-3xl overflow-hidden">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/5 shrink-0 bg-gray-50/50 dark:bg-white/5">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {isKm ? 'កន្ត្រករបស់អ្នក' : 'Your Bag'}
            </span>
            <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-white/5 rounded-full shadow-sm hover:shadow-md transition-all">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-6 px-6 border-b border-gray-100 dark:border-white/5 text-sm font-semibold">
            <button onClick={() => setActiveTab('bag')} className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${activeTab === 'bag' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <span>{isKm ? 'កន្ត្រក' : 'Shopping Bag'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'bag' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-white/10'}`}>{items.length}</span>
            </button>
            <button onClick={() => setActiveTab('fav')} className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${activeTab === 'fav' ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <span>{isKm ? 'ចំណូលចិត្ត' : 'Favorites'}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'fav' ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-500 dark:bg-white/10'}`}>{favorites.length}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gray-50/30 dark:bg-black/20">
            {activeTab === 'bag' ? (
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-white/5">
                    <ShoppingBag size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                    {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your bag is empty'}
                  </p>
                  <button onClick={() => setDrawerOpen(false)} className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    {isKm ? 'បន្តការទិញ' : 'Continue Shopping'}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="w-20 h-20 shrink-0 bg-gray-50 dark:bg-black/20 rounded-xl overflow-hidden">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={20} /></div>}
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                        <button onClick={() => removeItem(item.cartItemId)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-white/5 dark:hover:bg-red-500/20 rounded-full transition-colors"><Trash2 size={14} /></button>
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-1">${item.price.toFixed(2)}</p>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[11px] text-gray-500 mt-1">{Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>
                      )}
                      <div className="mt-auto pt-2 flex items-center gap-2">
                        <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 h-8 rounded-lg px-1">
                          <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white rounded-md"><Minus size={12} strokeWidth={2.5} /></button>
                          <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-white rounded-md"><Plus size={12} strokeWidth={2.5} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-white/5">
                  <Bookmark size={24} className="text-gray-400" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  {isKm ? `អ្នកមាន ${favorites.length} ចំណូលចិត្ត` : `You have ${favorites.length} saved items`}
                </p>
                <button onClick={() => { setDrawerOpen(false); router.push(isPathRouting ? `/${params.locale}/store/${params.slug}/favorites` : `/${params.locale}/favorites`); }} className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  {isKm ? 'មើលចំណូលចិត្ត' : 'View Favorites'}
                </button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 bg-white dark:bg-[#111318] border-t border-gray-100 dark:border-white/5 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <div className="space-y-2 text-sm font-medium">
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{isKm ? 'សរុបបណ្ដោះអាសន្ន' : 'Subtotal'}</span><span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{isKm ? 'តម្លៃដឹកជញ្ជូន' : 'Delivery fee'}</span><span className="font-bold text-emerald-500">Free</span></div>
                <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-base font-black text-gray-900 dark:text-white"><span>{isKm ? 'សរុបរួម' : 'Total'}</span><span>${subtotal.toFixed(2)}</span></div>
              </div>
              <button onClick={(e) => { e.preventDefault(); setIsCheckoutLoading(true); router.push(checkoutHref); }} disabled={isCheckoutLoading} className="w-full py-3.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all" style={{ backgroundColor: primaryColor || undefined, borderColor: primaryColor || undefined }}>
                <span>{isKm ? 'បន្តការទូទាត់' : 'Proceed to Checkout'}</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
  if ('tech-minimal' === 'skincare-clean') {
    return (
      <>
        <div className="fixed inset-0 bg-[#333]/20 z-[100] transition-opacity backdrop-blur-md" onClick={() => setDrawerOpen(false)} />
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#FAF9F6] dark:bg-[#0C0C0C] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E5E5] dark:border-[#222] shrink-0">
            <span className="text-xs font-medium uppercase tracking-widest text-[#333] dark:text-[#E5E5E5]">
              {isKm ? 'កន្ត្រករបស់អ្នក' : 'APOTHECARY BAG'}
            </span>
            <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-2 text-[#333] dark:text-[#E5E5E5] hover:opacity-70 transition-opacity">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-6 px-6 border-b border-[#E5E5E5] dark:border-[#222] text-xs uppercase tracking-widest">
            <button onClick={() => setActiveTab('bag')} className={`flex items-center gap-2 py-4 transition-colors ${activeTab === 'bag' ? 'text-[#333] dark:text-[#E5E5E5] border-b border-[#333] dark:border-[#E5E5E5]' : 'text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] border-b border-transparent'}`}>
              <span>{isKm ? 'កន្ត្រក' : 'BAG'}</span>
              <span className="text-[10px] bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] px-1.5 py-0.5 rounded-sm">{items.length}</span>
            </button>
            <button onClick={() => setActiveTab('fav')} className={`flex items-center gap-2 py-4 transition-colors ${activeTab === 'fav' ? 'text-[#333] dark:text-[#E5E5E5] border-b border-[#333] dark:border-[#E5E5E5]' : 'text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] border-b border-transparent'}`}>
              <span>{isKm ? 'ចំណូលចិត្ត' : 'SAVED'}</span>
              <span className="text-[10px] bg-[#E5E5E5] text-[#333] dark:bg-[#222] dark:text-[#E5E5E5] px-1.5 py-0.5 rounded-sm">{favorites.length}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {activeTab === 'bag' ? (
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={24} strokeWidth={1} className="text-[#888] mb-4" />
                  <p className="text-xs font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest mb-4">
                    {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your bag is empty'}
                  </p>
                  <button onClick={() => setDrawerOpen(false)} className="px-8 py-3 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                    {isKm ? 'បន្តការទិញ' : 'DISCOVER'}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 pb-4 border-b border-[#E5E5E5] dark:border-[#222] last:border-0">
                    <div className="w-20 h-20 shrink-0 bg-white dark:bg-[#111] p-2 border border-[#E5E5E5] dark:border-[#222]">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-[#E5E5E5]" /></div>}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-xs text-[#333] dark:text-[#E5E5E5] line-clamp-1">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                        <button onClick={() => removeItem(item.cartItemId)} className="p-1 text-[#888] hover:text-[#333] dark:hover:text-white transition-colors"><X size={14} strokeWidth={1.5} /></button>
                      </div>
                      <p className="text-xs font-mono text-[#333] dark:text-[#E5E5E5] mt-1">${item.price.toFixed(2)}</p>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[10px] text-[#888] mt-1 uppercase tracking-widest">{Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
                      )}
                      <div className="mt-auto pt-2 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="text-[#888] hover:text-[#333] dark:hover:text-white"><Minus size={12} strokeWidth={1.5} /></button>
                          <span className="w-4 text-center font-mono text-xs">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="text-[#888] hover:text-[#333] dark:hover:text-white"><Plus size={12} strokeWidth={1.5} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bookmark size={24} strokeWidth={1} className="text-[#888] mb-4" />
                <p className="text-xs font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest mb-4">
                  {isKm ? `អ្នកមាន ${favorites.length} ចំណូលចិត្ត` : `${favorites.length} SAVED ITEMS`}
                </p>
                <button onClick={() => { setDrawerOpen(false); router.push(isPathRouting ? `/${params.locale}/store/${params.slug}/favorites` : `/${params.locale}/favorites`); }} className="px-8 py-3 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                  {isKm ? 'មើលចំណូលចិត្ត' : 'VIEW SAVED'}
                </button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-[#E5E5E5] dark:border-[#222] bg-[#FAF9F6] dark:bg-[#0C0C0C] space-y-4">
              <div className="space-y-2 text-xs uppercase tracking-widest font-medium">
                <div className="flex justify-between text-[#888]"><span>{isKm ? 'សរុបបណ្ដោះអាសន្ន' : 'SUBTOTAL'}</span><span className="font-mono text-[#333] dark:text-[#E5E5E5]">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between pt-3 border-t border-[#E5E5E5] dark:border-[#222] text-[#333] dark:text-[#E5E5E5]"><span>{isKm ? 'សរុបរួម' : 'TOTAL'}</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
              </div>
              <button onClick={(e) => { e.preventDefault(); setIsCheckoutLoading(true); router.push(checkoutHref); }} disabled={isCheckoutLoading} className="w-full py-4 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
                <span>{isKm ? 'បន្តការទូទាត់' : 'CHECKOUT'}</span>
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // THEME 3: NEO-BRUTALISM
  // -------------------------------------------------------------
  if ('tech-minimal' === 'neo-brutalism') {
    return (
      <>
        <div className="fixed inset-0 bg-black/60 z-[100]" onClick={() => setDrawerOpen(false)} />
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-[#111] z-[101] shadow-[-10px_0px_0px_0px_rgba(0,0,0,1)] dark:shadow-[-10px_0px_0px_0px_rgba(255,255,255,1)] flex flex-col transform transition-transform duration-200 border-l-[4px] border-black dark:border-white">
          <div className="h-16 flex items-center justify-between px-6 border-b-[4px] border-black dark:border-white shrink-0 bg-[#c084fc] dark:bg-[#9333ea]">
            <span className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
              {isKm ? 'កន្ត្រករបស់អ្នក' : 'YOUR SELECTION'}
            </span>
            <button onClick={() => setDrawerOpen(false)} className="p-1 border-[3px] border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="flex items-center px-6 border-b-[4px] border-black dark:border-white text-sm font-black uppercase tracking-tight bg-gray-100 dark:bg-black">
            <button onClick={() => setActiveTab('bag')} className={`flex-1 flex items-center justify-center gap-2 py-4 border-r-[4px] border-black dark:border-white transition-colors ${activeTab === 'bag' ? 'bg-[#ffeb3b] text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}>
              <span>{isKm ? 'កន្ត្រក' : 'BAG'}</span>
              <span className="bg-black text-white px-2 py-0.5 border-[2px] border-black">{items.length}</span>
            </button>
            <button onClick={() => setActiveTab('fav')} className={`flex-1 flex items-center justify-center gap-2 py-4 transition-colors ${activeTab === 'fav' ? 'bg-[#4ade80] text-black' : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'}`}>
              <span>{isKm ? 'ចំណូលចិត្ត' : 'FAV'}</span>
              <span className="bg-black text-white px-2 py-0.5 border-[2px] border-black">{favorites.length}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {activeTab === 'bag' ? (
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-[#ffeb3b] border-[3px] border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <ShoppingBag size={28} strokeWidth={3} className="text-black" />
                  </div>
                  <p className="text-base font-black text-black dark:text-white uppercase mb-4">
                    {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'CART IS EMPTY'}
                  </p>
                  <button onClick={() => setDrawerOpen(false)} className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                    {isKm ? 'ទិញទំនិញ' : 'SHOP NOW'}
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 p-3 border-[3px] border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <div className="w-20 h-20 shrink-0 bg-gray-100 dark:bg-gray-800 border-[2px] border-black dark:border-white p-1">
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover border-[2px] border-black dark:border-white" /> : <div className="w-full h-full flex items-center justify-center border-[2px] border-black"><ShoppingBag size={20} /></div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-black text-sm uppercase text-black dark:text-white line-clamp-1">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                          <button onClick={() => removeItem(item.cartItemId)} className="p-1 border-[2px] border-black dark:border-white bg-rose-400 text-black hover:bg-rose-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"><Trash2 size={12} strokeWidth={3} /></button>
                        </div>
                        <p className="text-sm font-black text-black dark:text-white bg-[#ffeb3b] w-fit px-1 border-[2px] border-black mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1 border-[2px] border-black dark:border-white w-fit bg-gray-100 dark:bg-gray-800">
                        <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center text-black dark:text-white border-r-[2px] border-black dark:border-white hover:bg-white dark:hover:bg-gray-700"><Minus size={14} strokeWidth={3} /></button>
                        <span className="w-8 text-center font-black text-sm text-black dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-black dark:text-white border-l-[2px] border-black dark:border-white hover:bg-white dark:hover:bg-gray-700"><Plus size={14} strokeWidth={3} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-[#4ade80] border-[3px] border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Bookmark size={28} strokeWidth={3} className="text-black" />
                </div>
                <p className="text-base font-black text-black dark:text-white uppercase mb-4">
                  {isKm ? `អ្នកមាន ${favorites.length} ចំណូលចិត្ត` : `${favorites.length} SAVED`}
                </p>
                <button onClick={() => { setDrawerOpen(false); router.push(isPathRouting ? `/${params.locale}/store/${params.slug}/favorites` : `/${params.locale}/favorites`); }} className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                  {isKm ? 'មើលចំណូលចិត្ត' : 'VIEW SAVED'}
                </button>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t-[4px] border-black dark:border-white bg-white dark:bg-[#111] space-y-4">
              <div className="space-y-2 text-sm font-black uppercase tracking-tight">
                <div className="flex justify-between text-black dark:text-white"><span>{isKm ? 'សរុបបណ្ដោះអាសន្ន' : 'SUBTOTAL'}</span><span className="bg-[#ffeb3b] px-1 border-[2px] border-black text-black">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between pt-3 border-t-[3px] border-black dark:border-white text-black dark:text-white text-lg"><span>{isKm ? 'សរុបរួម' : 'TOTAL'}</span><span className="bg-[#4ade80] px-1 border-[2px] border-black text-black">${subtotal.toFixed(2)}</span></div>
              </div>
              <button onClick={(e) => { e.preventDefault(); setIsCheckoutLoading(true); router.push(checkoutHref); }} disabled={isCheckoutLoading} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black text-base font-black uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || undefined }}>
                <span>{isKm ? 'ទូទាត់ប្រាក់' : 'CHECKOUT'}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: FASHION EDITORIAL / AURUM (Fallback)
  // -------------------------------------------------------------
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] transition-opacity backdrop-blur-2xs" onClick={() => setDrawerOpen(false)} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-[#111318] z-[101] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-white/[0.08]">
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {isKm ? 'កន្ត្រករបស់អ្នក' : 'YOUR SELECTION'}
          </span>
          <button onClick={() => setDrawerOpen(false)} className="p-2 -mr-1 text-gray-800 dark:text-white hover:opacity-60 transition-opacity">
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        <div className={`flex items-center gap-6 px-4 md:px-6 pt-3 pb-3 border-b border-gray-100 dark:border-white/[0.06] text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'}`}>
          <button onClick={() => setActiveTab('bag')} className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${activeTab === 'bag' ? 'border-black dark:border-white text-black dark:text-white font-extrabold' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}>
            <span>{isKm ? 'កន្ត្រក' : 'SHOPPING BAG'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 min-w-[20px] text-center leading-none ${activeTab === 'bag' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>{items.length}</span>
          </button>
          <button onClick={() => setActiveTab('fav')} className={`flex items-center gap-2 transition-colors pb-1 border-b-2 ${activeTab === 'fav' ? 'border-black dark:border-white text-black dark:text-white font-extrabold' : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'}`}>
            <span>{isKm ? 'ចំណូលចិត្ត' : 'FAVORITE'}</span>
            <span className={`text-[10px] px-1.5 py-0.5 min-w-[20px] text-center leading-none ${activeTab === 'fav' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'}`}>{favorites.length}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 divide-y divide-gray-100 dark:divide-white/[0.04]">
          {activeTab === 'bag' ? (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.05] rounded-none flex items-center justify-center mb-3 border border-gray-200 dark:border-white/10">
                  <ShoppingBag size={22} className="text-gray-400" />
                </div>
                <p className={`text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white`}>
                  {isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your bag is empty'}
                </p>
                <button onClick={() => setDrawerOpen(false)} className={`mt-4 px-6 py-2.5 text-white text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none transition-all`} style={{ backgroundColor: primaryColor || '#000' }}>
                  {isKm ? 'បន្តការទិញ' : 'Continue Shopping'}
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartItemId} className="pt-5 first:pt-0 flex gap-4">
                  <div className="w-20 h-20 shrink-0 bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>}
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white line-clamp-1">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5">${item.price.toFixed(2)}</p>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">{Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2">
                      <div className="flex items-center border border-gray-300 dark:border-white/20 h-8 px-1">
                        <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="p-1 text-gray-500 hover:text-black dark:hover:text-white"><Minus size={11} /></button>
                        <span className="w-7 text-center font-bold text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 text-gray-500 hover:text-black dark:hover:text-white"><Plus size={11} /></button>
                      </div>
                      <button onClick={() => removeItem(item.cartItemId)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-14 h-14 bg-gray-100 dark:bg-white/[0.05] rounded-none flex items-center justify-center mb-3 border border-gray-200 dark:border-white/10">
                <Bookmark size={22} className="text-gray-400" />
              </div>
              <p className={`text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white mb-2`}>
                {isKm ? `អ្នកមាន ${favorites.length} ចំណូលចិត្ត` : `You have ${favorites.length} saved items`}
              </p>
              <button onClick={() => { setDrawerOpen(false); router.push(isPathRouting ? `/${params.locale}/store/${params.slug}/favorites` : `/${params.locale}/favorites`); }} className={`mt-4 px-6 py-2.5 text-white text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none transition-all`} style={{ backgroundColor: primaryColor || '#000' }}>
                {isKm ? 'មើលចំណូលចិត្ត' : 'View Favorites'}
              </button>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111318] space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400"><span className="uppercase tracking-wider">{isKm ? 'សរុបបណ្ដោះអាសន្ន' : 'Subtotal'}</span><span className="font-bold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-gray-600 dark:text-gray-400"><span className="uppercase tracking-wider">{isKm ? 'តម្លៃដឹកជញ្ជូន' : 'Estimated delivery fee'}</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{isKm ? 'ឥតគិតថ្លៃ' : 'Free'}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-white/[0.06] text-sm font-black text-gray-900 dark:text-white"><span className="uppercase tracking-wider">{isKm ? 'សរុបរួម' : 'TOTAL'}</span><span>${subtotal.toFixed(2)}</span></div>
            </div>
            <button onClick={(e) => { e.preventDefault(); setIsCheckoutLoading(true); router.push(checkoutHref); }} disabled={isCheckoutLoading} className={`w-full h-12 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm rounded-none`} style={{ backgroundColor: primaryColor || '#000' }}>
              <span>{isKm ? 'បន្តការទូទាត់' : 'CONTINUE TO CHECKOUT'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
