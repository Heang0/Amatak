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

export default function ProductDetailDefault({
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
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
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
