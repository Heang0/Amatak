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
  if ('neo-brutalism' === 'neo-brutalism') {
    return (
      <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-3 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] px-4 py-3 rounded-none text-black dark:text-white text-sm font-black uppercase tracking-wider transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <CheckCircle size={20} strokeWidth={2.5} style={{ color: primaryColor || '#4ade80' }} />
        <span className="truncate">{message}</span>
      </div>
    );
  }
  


  if ('neo-brutalism' === 'default') {
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

export default function ProductDetailNeoBrutalism({
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
