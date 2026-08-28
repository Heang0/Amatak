'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingBag, X, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPageTechMinimal({ params }: { params: { slug: string, locale: string } }) {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isKm = params.locale === 'km';
  const isPathRouting = pathname?.includes('/store/');
  const storeHomeHref = isPathRouting ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;
  const checkoutHref = isPathRouting ? `/${params.locale}/store/${params.slug}/checkout` : `/${params.locale}/checkout`;
  
  const [mounted, setMounted] = useState(false);
  const [themeStyle, setThemeStyle] = useState('tech-minimal');
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


  // -------------------------------------------------------------
  // THEME 3: NEO-BRUTALISM
  // -------------------------------------------------------------
  if (themeStyle === 'neo-brutalism') {
    if (items.length === 0) {
      return (
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#f4f4f4] dark:bg-[#111] font-sans">
          <div className="flex items-center justify-between py-4 border-b-[4px] border-black dark:border-white mb-8">
            <h1 className="text-lg font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>{text.shoppingBag}</span>
              <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-sm">0</span>
            </h1>
            <Link href={storeHomeHref} className="text-sm font-black text-black dark:text-white uppercase border-b-[3px] border-black dark:border-white pb-1 hover:bg-[#ff90e8] transition-colors">
              {text.continueShopping}
            </Link>
          </div>
          <div className="max-w-md mx-auto py-16 px-6 text-center border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-black space-y-6 mt-12">
            <div className="w-16 h-16 border-[3px] border-black dark:border-white flex items-center justify-center mx-auto bg-[#c084fc] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShoppingBag size={28} className="text-black" strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl font-black text-black dark:text-white uppercase mb-2 leading-tight">{text.cartEmpty}</h2>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">{text.cartEmptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-8 py-4 border-[3px] border-black dark:border-white text-black text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all" style={{ backgroundColor: primaryColor || '#4ade80' }}>
              {text.startShopping}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#f4f4f4] dark:bg-[#111] font-sans">
        <div className="flex items-center justify-between py-4 border-b-[4px] border-black dark:border-white mb-8">
          <h1 className="text-xl font-black text-black dark:text-white uppercase tracking-tight flex items-center gap-2">
            <span>{text.shoppingBag}</span>
            <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-sm">{items.reduce((acc, i) => acc + i.quantity, 0)}</span>
          </h1>
          <Link href={storeHomeHref} className="text-sm font-black text-black dark:text-white uppercase border-b-[3px] border-black dark:border-white pb-1 hover:bg-[#ff90e8] transition-colors hover:text-black">
            {text.continueShopping}
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {items.map((item) => (
              <div key={item.cartItemId} className="p-4 sm:p-5 flex gap-4 sm:gap-6 items-start bg-white dark:bg-black border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
                <div className="w-24 sm:w-28 aspect-square bg-white dark:bg-[#222] border-[3px] border-black dark:border-white shrink-0 p-2 relative">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} /></div>}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-black dark:text-white text-base sm:text-lg uppercase leading-tight">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                    <button onClick={() => removeItem(item.cartItemId)} className="w-8 h-8 flex items-center justify-center border-[2px] border-black dark:border-white bg-[#f87171] hover:bg-red-500 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0 transition-all"><X size={16} strokeWidth={3} /></button>
                  </div>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2 uppercase flex flex-wrap gap-2">
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span key={k} className="bg-gray-200 dark:bg-gray-800 px-2 py-1 border border-black dark:border-white">{k}: {v}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center bg-white dark:bg-black border-[3px] border-black dark:border-white h-10 w-fit shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="w-10 h-full flex items-center justify-center border-r-[3px] border-black dark:border-white bg-gray-100 hover:bg-gray-200 text-black"><Minus size={16} strokeWidth={3} /></button>
                      <span className="w-10 text-center font-black text-black dark:text-white text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-10 h-full flex items-center justify-center border-l-[3px] border-black dark:border-white bg-gray-100 hover:bg-gray-200 text-black"><Plus size={16} strokeWidth={3} /></button>
                    </div>
                    <span className="font-black text-black dark:text-white text-xl sm:text-2xl">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 p-6 border-[4px] border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] space-y-6 relative overflow-hidden">
            <h2 className="text-lg font-black text-black dark:text-white uppercase tracking-tight pb-4 border-b-[4px] border-black dark:border-white">SUMMARY</h2>
            <div className="space-y-3 text-sm font-bold uppercase text-gray-800 dark:text-gray-200">
              <div className="flex justify-between items-center"><span>{text.subtotal}</span><span className="font-black text-black dark:text-white text-base">${getTotalPrice().toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span>SHIPPING</span><span className="text-xs">AT CHECKOUT</span></div>
            </div>
            <div className="pt-4 border-t-[4px] border-black dark:border-white flex justify-between items-center">
              <span className="text-base font-black text-black dark:text-white uppercase">TOTAL</span>
              <span className="text-3xl font-black text-black dark:text-white bg-[#ffeb3b] px-2 border-[2px] border-black text-black">${getTotalPrice().toFixed(2)}</span>
            </div>
            <button onClick={() => router.push(checkoutHref)} className="w-full py-4 text-black text-lg font-black uppercase border-[4px] border-black flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all mt-4" style={{ backgroundColor: primaryColor || '#4ade80' }}>
              <span>{text.proceedCheckout}</span>
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
  if (themeStyle === 'default') {
    if (items.length === 0) {
      return (
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-gray-50 dark:bg-[#111318] font-sans">
          <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/10 mb-8">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{text.shoppingBag}</span>
              <span className="text-gray-400 bg-gray-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full text-sm font-semibold">0</span>
            </h1>
            <Link href={storeHomeHref} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              {text.continueShopping}
            </Link>
          </div>
          <div className="max-w-md mx-auto py-16 px-8 text-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm rounded-3xl space-y-6 mt-12">
            <div className="w-16 h-16 bg-gray-50 dark:bg-black/20 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
              <ShoppingBag size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{text.cartEmpty}</h2>
              <p className="text-sm text-gray-500">{text.cartEmptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-8 py-3.5 text-white dark:text-gray-900 text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all" style={{ backgroundColor: primaryColor || '#000' }}>
              {text.startShopping}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-gray-50 dark:bg-[#111318] font-sans">
        <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-white/10 mb-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>{text.shoppingBag}</span>
            <span className="text-sm font-semibold text-white px-3 py-1 rounded-full shadow-sm" style={{ backgroundColor: primaryColor || '#000' }}>{items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
          </h1>
          <Link href={storeHomeHref} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            {text.continueShopping}
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div key={item.cartItemId} className="p-4 sm:p-5 flex gap-5 items-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-24 aspect-[4/5] bg-gray-50 dark:bg-black/20 rounded-2xl overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="text-gray-300" /></div>}
                </div>
                <div className="flex flex-col flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                    <button onClick={() => removeItem(item.cartItemId)} className="w-8 h-8 flex items-center justify-center bg-gray-50 dark:bg-white/10 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"><X size={16} strokeWidth={2.5} /></button>
                  </div>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-xs font-medium text-gray-500 mt-2 flex flex-wrap gap-2">
                      {Object.entries(item.selectedVariants).map(([k, v]) => (
                        <span key={k} className="bg-gray-50 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-white/5">{k}: {v}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 h-10 px-1 rounded-xl">
                      <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"><Minus size={14} strokeWidth={2.5} /></button>
                      <span className="w-8 text-center font-bold text-gray-900 dark:text-white text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors"><Plus size={14} strokeWidth={2.5} /></button>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 p-6 sm:p-8 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white pb-4 border-b border-gray-100 dark:border-white/10">Order Summary</h2>
            <div className="space-y-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              <div className="flex justify-between items-center"><span>{text.subtotal}</span><span className="font-semibold text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span>Shipping</span><span>Calculated at next step</span></div>
            </div>
            <div className="pt-6 border-t border-gray-100 dark:border-white/10 flex justify-between items-end">
              <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
              <span className="text-3xl font-black" style={{ color: primaryColor || undefined }}>${getTotalPrice().toFixed(2)}</span>
            </div>
            <button onClick={() => router.push(checkoutHref)} className="w-full py-4 mt-2 text-white dark:text-gray-900 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all" style={{ backgroundColor: primaryColor || '#000' }}>
              <span>{text.proceedCheckout}</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
  if (themeStyle === 'skincare-clean') {
    if (items.length === 0) {
      return (
        <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#FAF9F6] dark:bg-[#0C0C0C] font-sans">
          <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] dark:border-[#222] mb-8">
            <h1 className="text-sm font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest flex items-center gap-2">
              <span>{text.shoppingBag}</span>
              <span className="bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] px-2 py-0.5 rounded-sm text-[10px]">0</span>
            </h1>
            <Link href={storeHomeHref} className="text-[11px] font-medium text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] uppercase tracking-widest transition-colors border-b border-transparent hover:border-[#333] dark:hover:border-[#E5E5E5]">
              {text.continueShopping}
            </Link>
          </div>
          <div className="max-w-md mx-auto py-20 px-8 text-center space-y-6">
            <ShoppingBag size={32} strokeWidth={1} className="text-[#888] mx-auto" />
            <div>
              <h2 className="text-sm font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest mb-3">{text.cartEmpty}</h2>
              <p className="text-xs text-[#888]">{text.cartEmptyDesc}</p>
            </div>
            <Link href={storeHomeHref} className="inline-block px-10 py-3 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity">
              {text.startShopping}
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh] bg-[#FAF9F6] dark:bg-[#0C0C0C] font-sans">
        <div className="flex items-center justify-between py-4 border-b border-[#E5E5E5] dark:border-[#222] mb-8">
          <h1 className="text-sm font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest flex items-center gap-3">
            <span>{text.shoppingBag}</span>
            <span className="text-[11px] bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] px-2 py-1 rounded-sm">{items.reduce((acc, i) => acc + i.quantity, 0)} ITEMS</span>
          </h1>
          <Link href={storeHomeHref} className="text-[11px] font-medium text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] uppercase tracking-widest transition-colors border-b border-transparent hover:border-[#333] dark:hover:border-[#E5E5E5]">
            {text.continueShopping}
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 flex flex-col">
            {items.map((item) => (
              <div key={item.cartItemId} className="py-6 flex gap-6 items-start border-b border-[#E5E5E5] dark:border-[#222] first:pt-0">
                <div className="w-24 sm:w-28 aspect-square bg-white dark:bg-[#111] p-3 border border-[#E5E5E5] dark:border-[#222] shrink-0">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="text-[#888]" strokeWidth={1}/></div>}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-medium text-[#333] dark:text-[#E5E5E5] text-sm sm:text-base leading-snug">{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                    <button onClick={() => removeItem(item.cartItemId)} className="p-1 text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] transition-colors"><X size={16} strokeWidth={1.5} /></button>
                  </div>
                  {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                    <div className="text-[11px] text-[#888] mt-2 uppercase tracking-widest">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  )}
                  <div className="mt-6 flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5]"><Minus size={14} strokeWidth={1.5} /></button>
                      <span className="w-6 text-center font-mono text-[#333] dark:text-[#E5E5E5] text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5]"><Plus size={14} strokeWidth={1.5} /></button>
                    </div>
                    <span className="font-mono text-[#333] dark:text-[#E5E5E5] text-base">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 p-8 bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] space-y-6">
            <h2 className="text-xs font-medium text-[#333] dark:text-[#E5E5E5] uppercase tracking-widest pb-4 border-b border-[#E5E5E5] dark:border-[#222]">Order Summary</h2>
            <div className="space-y-4 text-xs font-medium text-[#888] uppercase tracking-widest">
              <div className="flex justify-between items-center"><span>{text.subtotal}</span><span className="font-mono text-[#333] dark:text-[#E5E5E5]">${getTotalPrice().toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span>Shipping</span><span>At checkout</span></div>
            </div>
            <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#222] flex justify-between items-end text-[#333] dark:text-[#E5E5E5]">
              <span className="text-xs font-medium uppercase tracking-widest">Total</span>
              <span className="text-2xl font-mono">${getTotalPrice().toFixed(2)}</span>
            </div>
            <button onClick={() => router.push(checkoutHref)} className="w-full py-4 mt-2 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] text-xs font-medium uppercase tracking-widest hover:opacity-80 transition-opacity">
              {text.proceedCheckout}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: FASHION EDITORIAL / AURUM (Fallback)
  // -------------------------------------------------------------
  if (items.length === 0) {
    return (
      <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 min-h-[70vh]">
        {/* Sub-bar */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-6">
          <h1 className={`text-xs sm:text-sm font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white flex items-center gap-2`}>
            <span>{text.shoppingBag}</span>
            <span className="text-gray-400 font-normal">| 0 |</span>
          </h1>
          <Link href={storeHomeHref} className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}>
            {text.continueShopping}
          </Link>
        </div>

        {/* Empty Box */}
        <div className="max-w-md mx-auto py-16 px-6 text-center border border-gray-200 dark:border-white/[0.08] bg-stone-50/40 dark:bg-stone-900/20 rounded-none space-y-4 my-6">
          <div className="w-10 h-10 bg-white dark:bg-stone-900 border border-gray-200 dark:border-white/10 rounded-none flex items-center justify-center mx-auto">
            <ShoppingBag size={18} className="text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-1">
            <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>{text.cartEmpty}</h2>
            <p className="text-[11px] text-gray-400 max-w-xs mx-auto">{text.cartEmptyDesc}</p>
          </div>
          <div className="pt-2">
            <Link href={storeHomeHref} className={`inline-block px-6 py-2.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all rounded-none shadow-xs`} style={{ backgroundColor: primaryColor || undefined }}>
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
        <Link href={storeHomeHref} className={`text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}>
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
                {item.imageUrl ? <img src={item.imageUrl.replace('/upload/', '/upload/w_300,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={20} /></div>}
              </div>
              {/* Item Details */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-2 ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'}`}>{isKm && item.titleKm ? item.titleKm : item.title}</h3>
                  <button onClick={() => removeItem(item.cartItemId)} className="p-1 -mr-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0" title="Remove"><X size={15} /></button>
                </div>
                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                  <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">
                    {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 dark:border-white/20 h-8 px-1.5 shrink-0 rounded-none">
                    <button onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))} className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Minus size={11} /></button>
                    <span className="w-7 text-center font-bold text-xs">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"><Plus size={11} /></button>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-gray-900 dark:text-white text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 p-5 border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#13161F] rounded-none shadow-2xs space-y-5">
          <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-white/[0.06]`}>{isKm ? 'សង្ខេបការបញ្ជាទិញ' : 'ORDER SUMMARY'}</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-gray-500"><span>{text.subtotal}</span><span className="font-bold text-gray-900 dark:text-white font-mono">${getTotalPrice().toFixed(2)}</span></div>
            <div className="flex justify-between items-center text-gray-500"><span>{isKm ? 'ថ្លៃដឹកជញ្ជូន' : 'ESTIMATED SHIPPING'}</span><span className="font-medium text-gray-400">{isKm ? 'គណនាក្នុងទំព័រទូទាត់' : 'Calculated at checkout'}</span></div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center">
            <span className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">{isKm ? 'តម្លៃសរុប' : 'TOTAL'}</span>
            <span className="text-lg font-black text-gray-900 dark:text-white">${getTotalPrice().toFixed(2)}</span>
          </div>
          <button onClick={() => router.push(checkoutHref)} className={`w-full py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-2 rounded-none shadow-sm active:scale-98`} style={{ backgroundColor: primaryColor || undefined }}>
            <span>{text.proceedCheckout}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
