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
  if ('skincare-clean' === 'neo-brutalism') {
    return (
      <div className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-3 bg-white dark:bg-black border-[3px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] px-4 py-3 rounded-none text-black dark:text-white text-sm font-black uppercase tracking-wider transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <CheckCircle size={20} strokeWidth={2.5} style={{ color: primaryColor || '#4ade80' }} />
        <span className="truncate">{message}</span>
      </div>
    );
  }
  


  if ('skincare-clean' === 'default') {
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

export default function ProductDetailSkincare({
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
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
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
