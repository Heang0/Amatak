'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useFavoritesStore } from '@/lib/store/useFavoritesStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { 
  Minus, 
  Plus, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Bookmark,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import { useRouter } from 'next/navigation';

// --- Toast Component ---
function AddToCartToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-none shadow-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
      }`}
    >
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
    if (isFav) {
      removeFavorite(product._id);
    } else {
      addFavorite(product._id);
    }

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
      try {
        await navigator.share({
          title: product.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(isKm ? 'បានចម្លងតំណភ្ជាប់!' : 'Link copied to clipboard!');
      } catch (e) {
        console.error('Clipboard copy failed', e);
      }
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

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#0E1117] text-gray-900 dark:text-white transition-colors pb-24 md:pb-16">
      <AddToCartToast message={toast.message} visible={toast.visible} />

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
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 bg-black dark:bg-white text-white dark:text-black text-[8px] font-bold rounded-none flex items-center justify-center">
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
                <span className={`absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-0.5 ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} rounded-none`}>
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
