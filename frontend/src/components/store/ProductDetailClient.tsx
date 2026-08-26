'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { 
  Minus, Plus, CheckCircle, ChevronLeft, ChevronRight, 
  Heart, Share2, ShoppingBag, Truck, ShieldCheck, 
  RotateCcw, Sparkles, Bookmark, ChevronDown, ArrowLeft
} from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { useRouter } from 'next/navigation';

// --- Toast Component ---
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

  // Fashion Editorial
  return (
    <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-none shadow-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'}`}>
      <CheckCircle size={16} strokeWidth={2.5} className="shrink-0 text-emerald-400 dark:text-emerald-600" />
      <span className="truncate">{message}</span>
    </div>
  );
}

interface ProductDetailClientProps {
  product: any;
  store: any;
  relatedProducts: any[];
  locale: string;
  slug: string;
}

export default function ProductDetailClient({
  product,
  store,
  relatedProducts,
  locale,
  slug
}: ProductDetailClientProps) {
  const router = useRouter();
  const themeStyle = store?.branding?.themeStyle || 'fashion-editorial';
  const primaryColor = store?.branding?.primaryColor || '#111111';

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('desc');
  
  const addItem = useCartStore((state) => state.addItem);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const totalCartItems = useCartStore((state) => state.items.reduce((acc, i) => acc + i.quantity, 0));
  const customer = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isLocalFav = useFavoritesStore((state) => state.isFavorite(product._id));

  const isFav = Boolean(
    customer?.favorites?.some((f: any) => typeof f === 'string' ? f === product._id : f?._id === product._id) || isLocalFav
  );

  const isKm = locale === 'km';
  
  const text = {
    options: isKm ? 'ជម្រើស' : 'Options',
    quantity: isKm ? 'ចំនួន' : 'Quantity',
    addToCart: isKm ? 'ដាក់ក្នុងកន្ត្រក' : 'ADD TO BAG',
    addedToCart: isKm ? 'បានបញ្ចូលទៅកន្ត្រក!' : 'Added to bag!',
    productNotFound: isKm ? 'រកមិនឃើញផលិតផល' : 'Product not found',
    goBack: isKm ? 'ត្រឡប់ក្រោយ' : 'Go Back',
    selectPrefix: isKm ? 'សូមជ្រើសរើស' : 'Please select a',
    relatedProducts: isKm ? 'ផលិតផលស្រដៀងគ្នា' : 'RECOMMENDED FOR YOU',
    inStock: isKm ? 'មានក្នុងស្តុក' : 'In Stock',
    outOfStock: isKm ? 'អស់ពីស្តុក' : 'Out of Stock',
    sizeGuide: isKm ? 'តារាងទំហំ' : 'SIZE GUIDE',
    fitSuggestion: isKm ? 'ⓘ យើងណែនាំទំហំស្ដង់ដារ' : 'ⓘ Standard fit recommended',
    shippingReturns: isKm ? 'ការដឹកជញ្ជូន និងប្ដូរទំនិញ' : 'SHIPPING, EXCHANGES AND RETURNS',
    descAndFit: isKm ? 'ព័ត៌មានលម្អិត និងទំហំ' : 'DESCRIPTION & FIT',
  };

  const showToast = () => {
    setToast({ message: text.addedToCart, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  };

  const handleToggleWishlist = async () => {
    if (isFav) removeFavorite(product._id);
    else addFavorite(product._id);

    if (customer?.token) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/favorites/${product._id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${customer.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomerInfo({ ...customer, favorites: Array.isArray(data) ? data : data.favorites });
        }
      } catch (e) {
        console.error('Error toggling wishlist', e);
      }
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: product.title, url: window.location.href }); } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(isKm ? 'បានចម្លងតំណភ្ជាប់!' : 'Link copied to clipboard!');
      } catch (e) {}
    }
  };

  const handleSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: option }));
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find((v: any) => !selectedVariants[v.name]);
      if (missing) {
        alert(`${text.selectPrefix} ${missing.name}`);
        return;
      }
    }
    addItem({
      productId: product._id,
      title: product.title,
      titleKm: product.titleKm,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      selectedVariants,
    });
    showToast();
  };

  const imagesList = [product.imageUrl, ...(product.images || [])].filter(Boolean);
  const productTitle = isKm && product.titleKm ? product.titleKm : product.title;
  const productDesc = isKm && product.descriptionKm ? product.descriptionKm : (product.description || '');



  // -------------------------------------------------------------
  // THEME 3: NEO-BRUTALISM
  // -------------------------------------------------------------
  if (themeStyle === 'neo-brutalism') {
    return (
      <div className="flex flex-col min-h-full bg-[#f4f4f4] dark:bg-[#111111] text-black dark:text-white pb-24 md:pb-16 font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        {/* Top Mobile Bar */}
        <div className="w-full px-4 py-4 flex items-center justify-between border-b-[4px] border-black dark:border-white bg-[#ffeb3b] dark:bg-[#222]" style={{ backgroundColor: primaryColor || '#ffeb3b' }}>
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all">
            <ArrowLeft size={20} className="text-black dark:text-white" strokeWidth={3} />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleToggleWishlist} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all">
              <Bookmark size={20} className="text-black dark:text-white" strokeWidth={2.5} style={isFav ? { fill: '#000', color: '#000' } : {}} />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all relative">
              <ShoppingBag size={20} className="text-black dark:text-white" strokeWidth={2.5} />
              {totalCartItems > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#f87171] border-[2px] border-black text-black text-[10px] font-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            
            {/* Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-square bg-white dark:bg-[#222] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-4 relative">
                <img src={imagesList[currentImageIndex]} alt={productTitle} className="w-full h-full object-contain" />
                {imagesList.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#4ade80] border-[3px] border-black text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                      <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button onClick={() => setCurrentImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#60a5fa] border-[3px] border-black text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:col-span-6 flex flex-col pt-4">
              <div className="pb-6 mb-6 border-b-[4px] border-black dark:border-white">
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black dark:text-white mb-4 leading-none">{productTitle}</h1>
                <div className="inline-block px-4 py-2 bg-[#ff90e8] border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" style={{ backgroundColor: primaryColor || '#ff90e8' }}>
                  <p className="text-2xl font-black text-black">${Number(product.price ?? 0).toFixed(2)}</p>
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6 pb-8 border-b-[4px] border-black dark:border-white">
                  {product.variants.map((variant: any) => (
                    <div key={variant.name}>
                      <label className="text-sm font-black uppercase tracking-wider text-black dark:text-white mb-3 block">
                        {variant.name}: <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 ml-2">{selectedVariants[variant.name] || 'SELECT'}</span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {variant.options.map((opt: string) => {
                          const isSelected = selectedVariants[variant.name] === opt;
                          return (
                            <button
                              key={opt} onClick={() => handleSelect(variant.name, opt)}
                              className={`h-12 px-5 flex items-center justify-center text-sm font-black uppercase border-[3px] border-black dark:border-white transition-all ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-white dark:bg-black text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="py-8 flex flex-col sm:flex-row gap-6">
                <div className="flex items-center bg-white dark:bg-black border-[4px] border-black dark:border-white h-16 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center border-r-[4px] border-black dark:border-white bg-[#f87171] hover:bg-red-500 text-black active:bg-red-600 transition-colors"><Minus size={20} strokeWidth={4} /></button>
                  <span className="w-14 text-center font-black text-xl text-black dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center border-l-[4px] border-black dark:border-white bg-[#4ade80] hover:bg-green-500 text-black active:bg-green-600 transition-colors"><Plus size={20} strokeWidth={4} /></button>
                </div>
                <button onClick={handleAddToCart} className="flex-1 h-16 bg-[#c084fc] text-black text-lg font-black uppercase border-[4px] border-black dark:border-white flex items-center justify-center gap-3 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none" style={{ backgroundColor: primaryColor || '#c084fc' }}>
                  <ShoppingBag size={24} strokeWidth={3} /> {text.addToCart}
                </button>
              </div>

              <div className="border-t-[4px] border-black dark:border-white bg-white dark:bg-black border-x-[4px] border-b-[4px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] mt-4">
                <div className="border-b-[4px] border-black dark:border-white p-5">
                  <button onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')} className="w-full flex items-center justify-between text-sm font-black uppercase text-black dark:text-white text-left">
                    <span>{text.descAndFit}</span>
                    <ChevronDown size={24} strokeWidth={3} className={`transition-transform duration-200 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'desc' && <div className="pt-4 text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">{productDesc || 'LOUD DETAILS AND STREET FIT.'}</div>}
                </div>
                <div className="p-5">
                  <button onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')} className="w-full flex items-center justify-between text-sm font-black uppercase text-black dark:text-white text-left">
                    <span>{text.shippingReturns}</span>
                    <ChevronDown size={24} strokeWidth={3} className={`transition-transform duration-200 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeAccordion === 'shipping' && <div className="pt-4 text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed"><p>• BOLD SHIPPING POLICIES HERE.</p></div>}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
  if (themeStyle === 'default') {
    return (
      <div className="flex flex-col min-h-full bg-gray-50 dark:bg-[#111318] text-gray-900 dark:text-white pb-24 md:pb-16 font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        {/* Top Mobile Bar */}
        <div className="w-full px-4 py-4 flex items-center justify-between bg-white/70 dark:bg-black/40 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 sticky top-0 z-50">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow-sm">
            <ArrowLeft size={18} className="text-gray-900 dark:text-white" strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleToggleWishlist} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow-sm">
              <Bookmark size={18} className="text-gray-900 dark:text-white" strokeWidth={2.5} style={isFav ? { fill: primaryColor || '#10b981', color: primaryColor || '#10b981' } : {}} />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/10 rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow-sm relative">
              <ShoppingBag size={18} className="text-gray-900 dark:text-white" strokeWidth={2.5} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: primaryColor || '#10b981' }}>
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 items-start">
            
            {/* Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-[4/5] bg-white dark:bg-white/5 rounded-3xl relative overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
                <img src={imagesList[currentImageIndex]} alt={productTitle} className="w-full h-full object-cover" />
                {imagesList.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-900 dark:text-white hover:scale-105 active:scale-95 transition-all">
                      <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <button onClick={() => setCurrentImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-gray-900 dark:text-white hover:scale-105 active:scale-95 transition-all">
                      <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                  </>
                )}
              </div>
              {imagesList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {imagesList.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-gray-900 dark:border-white shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`} style={currentImageIndex === idx ? { borderColor: primaryColor || undefined } : {}}>
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-6 flex flex-col pt-2 sm:pt-4">
              <div className="pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-gray-200 dark:border-white/10">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">{productTitle}</h1>
                <p className="text-xl sm:text-3xl font-extrabold" style={{ color: primaryColor || undefined }}>${Number(product.price ?? 0).toFixed(2)}</p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6 pb-8 border-b border-gray-200 dark:border-white/10">
                  {product.variants.map((variant: any) => (
                    <div key={variant.name}>
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 block">
                        {variant.name}: <span className="font-normal text-gray-500 dark:text-gray-400">{selectedVariants[variant.name] || 'Select option'}</span>
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {variant.options.map((opt: string) => {
                          const isSelected = selectedVariants[variant.name] === opt;
                          return (
                            <button
                              key={opt} onClick={() => handleSelect(variant.name, opt)}
                              className={`h-12 px-6 flex items-center justify-center text-sm font-semibold rounded-2xl transition-all border ${isSelected ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-md' : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/30 hover:shadow-sm'}`}
                              style={isSelected ? { backgroundColor: primaryColor || undefined, color: '#fff' } : {}}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="py-6 sm:py-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center justify-between sm:justify-start bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 h-14 px-4 sm:px-2 rounded-2xl shadow-sm w-full sm:w-auto shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors active:scale-95"><Minus size={18} strokeWidth={2.5} /></button>
                  <span className="flex-1 sm:flex-none w-auto sm:w-12 text-center font-bold text-lg text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors active:scale-95"><Plus size={18} strokeWidth={2.5} /></button>
                </div>
                <button onClick={handleAddToCart} className="w-full sm:flex-1 h-14 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-bold flex items-center justify-center gap-3 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]" style={{ backgroundColor: primaryColor || undefined }}>
                  <ShoppingBag size={20} strokeWidth={2.5} /> {text.addToCart}
                </button>
              </div>

              <div className="bg-white dark:bg-white/5 rounded-3xl p-2 shadow-sm border border-gray-100 dark:border-white/5">
                <div className="p-4 border-b border-gray-100 dark:border-white/5">
                  <button onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')} className="w-full flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white text-left">
                    <span className="flex items-center gap-2"><Sparkles size={18} className="text-gray-400" /> {text.descAndFit}</span>
                    <ChevronDown size={20} strokeWidth={2.5} className={`text-gray-400 transition-transform duration-300 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 'desc' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-1 whitespace-pre-line">{productDesc || 'Soft minimal details describing this product.'}</div>
                  </div>
                </div>
                <div className="p-4">
                  <button onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')} className="w-full flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white text-left">
                    <span className="flex items-center gap-2"><Truck size={18} className="text-gray-400" /> {text.shippingReturns}</span>
                    <ChevronDown size={20} strokeWidth={2.5} className={`text-gray-400 transition-transform duration-300 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${activeAccordion === 'shipping' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-1"><p>• Premium shipping and smooth return policies.</p></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  
  // -------------------------------------------------------------
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
  if (themeStyle === 'skincare-clean') {
    return (
      <div className="flex flex-col min-h-full bg-[#FAF9F6] dark:bg-[#0C0C0C] text-[#333] dark:text-[#E5E5E5] pb-24 md:pb-16 font-sans">
        <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />
        
        {/* Top Mobile Bar */}
        <div className="w-full px-4 py-4 flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#222]">
          <button onClick={() => router.back()} className="text-[#333] dark:text-[#E5E5E5] hover:opacity-70 transition-opacity">
            <ArrowLeft size={22} strokeWidth={1.5} />
          </button>
          <div className="flex items-center gap-4">
            <button onClick={handleToggleWishlist} className="text-[#333] dark:text-[#E5E5E5] hover:opacity-70 transition-opacity">
              <Heart size={22} strokeWidth={1.5} style={isFav ? { fill: primaryColor || '#000', color: primaryColor || '#000' } : {}} />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="text-[#333] dark:text-[#E5E5E5] hover:opacity-70 transition-opacity relative">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] text-white text-[9px] font-medium rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor || '#000' }}>
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Gallery */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-full aspect-[4/5] bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-6 relative">
                <img src={imagesList[currentImageIndex]} alt={productTitle} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              {imagesList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {imagesList.map((img: string, idx: number) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-16 h-20 shrink-0 bg-white dark:bg-[#111] border p-1 ${currentImageIndex === idx ? 'border-[#333] dark:border-[#E5E5E5]' : 'border-[#E5E5E5] dark:border-[#222] opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="pb-6 border-b border-[#E5E5E5] dark:border-[#222] mb-6 text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl font-light uppercase tracking-widest text-[#222] dark:text-[#FFF] mb-3 leading-snug">{productTitle}</h1>
                <p className="text-xl font-medium" style={{ color: primaryColor || '#000' }}>${Number(product.price ?? 0).toFixed(2)}</p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="space-y-6 pb-6 border-b border-[#E5E5E5] dark:border-[#222]">
                  {product.variants.map((variant: any) => (
                    <div key={variant.name}>
                      <label className="text-xs font-medium uppercase tracking-widest text-[#888] mb-3 block text-center lg:text-left">
                        {variant.name}: <span className="text-[#333] dark:text-[#CCC]">{selectedVariants[variant.name] || 'SELECT'}</span>
                      </label>
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        {variant.options.map((opt: string) => {
                          const isSelected = selectedVariants[variant.name] === opt;
                          return (
                            <button
                              key={opt} onClick={() => handleSelect(variant.name, opt)}
                              className={`px-5 py-3 text-xs font-medium uppercase tracking-widest border transition-all ${isSelected ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-transparent text-[#555] border-[#E5E5E5] dark:border-[#333] hover:border-[#999]'}`}
                              style={isSelected ? { backgroundColor: primaryColor || undefined, borderColor: primaryColor || undefined, color: '#FFF' } : {}}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="py-8 flex flex-col items-center lg:items-start gap-4">
                <div className="flex items-center border-b border-[#E5E5E5] dark:border-[#333] h-12 px-2 w-32 shrink-0 justify-between">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-[#888] hover:text-[#000]"><Minus size={16} strokeWidth={1.5} /></button>
                  <span className="text-center font-light text-[#333] dark:text-[#E5E5E5] text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-[#888] hover:text-[#000]"><Plus size={16} strokeWidth={1.5} /></button>
                </div>
                <button onClick={handleAddToCart} className="w-full h-14 text-white text-sm font-medium uppercase tracking-widest flex items-center justify-center gap-3 transition-opacity hover:opacity-80" style={{ backgroundColor: primaryColor || '#000' }}>
                   {text.addToCart}
                </button>
              </div>

              <div className="divide-y divide-[#E5E5E5] dark:divide-[#222]">
                <div className="py-4">
                  <button onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')} className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] text-left">
                    <span>{text.descAndFit}</span>
                    <ChevronDown size={18} strokeWidth={1.5} className={`transition-transform duration-300 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-500 overflow-hidden ${activeAccordion === 'desc' ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pt-4 text-sm text-[#777] font-light leading-relaxed whitespace-pre-line">{productDesc || 'Apothecary clean details.'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: FASHION EDITORIAL / AURUM (Default original)
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#0E1117] text-gray-900 dark:text-white transition-colors pb-24 md:pb-16">
      <AddToCartToast message={toast.message} visible={toast.visible} themeStyle={themeStyle} primaryColor={primaryColor} />

      {/* Top Mobile & Desktop Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1 text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
          title={text.goBack}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleWishlist}
            className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            title="Save"
          >
            <Bookmark size={19} className={isFav ? 'fill-current text-black dark:text-white' : ''} />
          </button>
          <button
            onClick={handleShare}
            className="p-1.5 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
            title="Share"
          >
            <Share2 size={19} />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 text-gray-800 dark:text-white hover:opacity-70 transition-opacity relative"
            title="Cart"
          >
            <ShoppingBag size={20} />
            {totalCartItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold rounded-none flex items-center justify-center" style={{ backgroundColor: primaryColor || undefined }}>
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Gallery (Square Aspect Ratio & Sharp Corners) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="w-full aspect-square bg-stone-100 dark:bg-stone-900 rounded-none relative overflow-hidden group border border-gray-200 dark:border-white/[0.08]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagesList[currentImageIndex]} 
                alt={productTitle} 
                className="w-full h-full object-cover" 
              />

              {/* Status / Inventory Badge */}
              {product.stock !== undefined && product.stock > 0 && product.stock <= 3 && (
                <span className={`absolute top-3 left-3 text-white text-[9px] font-bold px-2 py-0.5 ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none`} style={{ backgroundColor: primaryColor || '#000' }}>
                  {isKm ? `នៅសល់តែ ${product.stock}` : `ONLY ${product.stock} LEFT`}
                </span>
              )}

              {/* Carousel Arrows */}
              {imagesList.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-black/80 text-black dark:text-white flex items-center justify-center transition-all rounded-none shadow-xs backdrop-blur-xs"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-black/80 text-black dark:text-white flex items-center justify-center transition-all rounded-none shadow-xs backdrop-blur-xs"
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Dot Indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {imagesList.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`transition-all ${currentImageIndex === idx ? 'w-4 h-0.5 bg-black dark:bg-white' : 'w-2 h-0.5 bg-black/40 dark:bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            {imagesList.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {imagesList.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 shrink-0 rounded-none overflow-hidden border transition-all ${
                      currentImageIndex === idx 
                        ? 'border-black dark:border-white ring-1 ring-black dark:ring-white' 
                        : 'border-stone-200 dark:border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information & Purchase Actions */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Title & Price */}
            <div className="pb-4 mb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2 leading-tight">
                {productTitle}
              </h1>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                ${Number(product.price ?? 0).toFixed(2)}
              </p>
            </div>

            {/* Variants Selection (Color & Size) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-5 pb-6 border-b border-gray-100 dark:border-white/[0.06]">
                {product.variants.map((variant: any) => {
                  const isSize = variant.name.toLowerCase().includes('size') || variant.name.toLowerCase().includes('ទំហំ');
                  const isColor = variant.name.toLowerCase().includes('color') || variant.name.toLowerCase().includes('colour') || variant.name.toLowerCase().includes('ពណ៌');

                  return (
                    <div key={variant.name}>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                          {variant.name}: <span className="font-normal text-gray-500">{selectedVariants[variant.name] || (isKm ? 'មិនទាន់ជ្រើស' : 'Select')}</span>
                        </label>

                        {isSize && (
                          <button type="button" className="text-[11px] font-bold text-gray-500 hover:text-black dark:hover:text-white underline underline-offset-4 tracking-wider">
                            {text.sizeGuide}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt: string) => {
                          const isSelected = selectedVariants[variant.name] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleSelect(variant.name, opt)}
                              className={`min-w-[48px] h-10 px-3 flex items-center justify-center text-xs font-bold uppercase tracking-wider transition-all border rounded-none ${
                                isSelected
                                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                                  : 'bg-white dark:bg-transparent text-gray-900 dark:text-white border-gray-200 dark:border-white/20 hover:border-gray-900 dark:hover:border-white'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isSize && (
                        <p className="text-[11px] text-gray-400 mt-2">
                          {text.fitSuggestion}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity Stepper & ADD TO BAG (Full-Width Solid Black) */}
            <div className="py-6 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-gray-300 dark:border-white/20 h-11 px-2 shrink-0 rounded-none">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                    aria-label="Decrease"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="p-1 text-gray-500 hover:text-black dark:hover:text-white"
                    aria-label="Increase"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Primary ADD TO BAG Action */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-11 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} transition-all flex items-center justify-center gap-2 active:scale-98 shadow-sm rounded-none`}
                  style={{ backgroundColor: primaryColor || undefined, borderColor: primaryColor || undefined }}
                >
                  <ShoppingBag size={14} />
                  <span>{text.addToCart}</span>
                </button>
              </div>
            </div>

            {/* Editorial Dropdown Accordions */}
            <div className="border-t border-gray-200 dark:border-white/[0.08] divide-y divide-gray-100 dark:divide-white/[0.06]">
              
              {/* Accordion 1: Description & Fit */}
              <div className="py-3.5">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'desc' ? null : 'desc')}
                  className={`w-full flex items-center justify-between text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white text-left`}
                >
                  <span>{text.descAndFit}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${activeAccordion === 'desc' ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === 'desc' && (
                  <div className="pt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {productDesc || (isKm ? 'ផលិតផលប្រណិត គុណភាពខ្ពស់ ធានាទំនិញសុទ្ធ ១០០%។' : 'High quality crafted materials. Standard regular fit.')}
                  </div>
                )}
              </div>

              {/* Accordion 2: Shipping & Returns */}
              <div className="py-3.5">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className={`w-full flex items-center justify-between text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white text-left`}
                >
                  <span>{text.shippingReturns}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="pt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                    <p>• {isKm ? 'ដឹកជញ្ជូនរហ័សទូទាំង ២៥ ខេត្ត-ក្រុង' : 'Fast delivery across Cambodia (1-2 business days).'}</p>
                    <p>• {isKm ? 'អាចប្ដូរទំនិញបានក្នុងរយៈពេល ៧ ថ្ងៃ' : 'Free exchanges within 7 days of purchase.'}</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {relatedProducts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 border-t border-gray-100 dark:border-white/[0.06]">
          <h2 className={`text-xs sm:text-sm font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white mb-6`}>
            {text.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rp => (
              <ProductCard
                key={rp._id}
                product={rp}
                primaryColor={primaryColor}
                themeStyle={themeStyle}
                onAddToCart={showToast}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
