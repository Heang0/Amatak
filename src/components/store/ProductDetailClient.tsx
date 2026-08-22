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
  Sparkles
} from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';

// --- Toast Component ---
function AddToCartToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-full shadow-2xl text-sm font-semibold transition-all duration-300 ${
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
  const themeStyle = store?.branding?.themeStyle || 'default';
  const primaryColor = store?.branding?.primaryColor || '#000000';

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const addItem = useCartStore((state) => state.addItem);
  const customer = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const logout = useCustomerAuthStore((state) => state.logout);
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
    addToCart: isKm ? 'បញ្ចូលទៅកន្ត្រក' : 'Add to Cart',
    addedToCart: isKm ? 'បានបញ្ចូលទៅកន្ត្រក!' : 'Added to cart!',
    productNotFound: isKm ? 'រកមិនឃើញផលិតផល' : 'Product not found',
    goBack: isKm ? 'ត្រឡប់ក្រោយ' : 'Go Back',
    home: isKm ? 'ទំព័រដើម' : 'Home',
    selectPrefix: isKm ? 'សូមជ្រើសរើស' : 'Please select a',
    relatedProducts: isKm ? 'ផលិតផលស្រដៀងគ្នា' : 'You might also like',
    inStock: isKm ? 'មានក្នុងស្តុក' : 'In Stock',
    outOfStock: isKm ? 'អស់ពីស្តុក' : 'Out of Stock',
    fastDelivery: isKm ? 'ដឹកជញ្ជូនរហ័សទូទាំងប្រទេស' : 'Fast Delivery Nationwide',
    authentic: isKm ? 'ទំនិញសុទ្ធ ១០០% ធានាគុណភាព' : '100% Genuine & Quality Guaranteed',
    easyReturn: isKm ? 'សេវាកម្មបម្រើអតិថិជនរហ័ស' : 'Dedicated Customer Support',
    description: isKm ? 'ព័ត៌មានលម្អិតពីទំនិញ' : 'Product Description',
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
        if (res.status === 401) {
          // Token expired — clear session
          logout();
          return;
        }
        if (res.ok) {
          const updatedFavorites = await res.json();
          setCustomerInfo({ ...customer, favorites: updatedFavorites });
        }
      } catch (err) {
        console.error(err);
      }
    }

    setToast({
      message: isFav 
        ? (isKm ? 'បានដកចេញពីចំណូលចិត្ត' : 'Removed from favorites') 
        : (isKm ? 'បានបញ្ចូលទៅចំណូលចិត្ត!' : 'Added to favorites!'),
      visible: true
    });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: isKm && product.titleKm ? product.titleKm : product.title,
            url: window.location.href,
          });
          return;
        } catch (err) {
          // Fallback to clipboard
        }
      }
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setToast({ message: isKm ? 'បានចម្លងតំណភ្ជាប់!' : 'Link copied to clipboard!', visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 1500);
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
  const priceColor = primaryColor && primaryColor !== '#000000' && primaryColor !== '#000' ? primaryColor : '#E84C3D';
  const categoryName = product.category?.name || '';

  return (
    <div className="flex flex-col min-h-full bg-white dark:bg-[#0c0c0c] text-gray-900 dark:text-white transition-colors pb-24 md:pb-16">
      <AddToCartToast message={toast.message} visible={toast.visible} />

      {/* Main Product Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT: Product Gallery (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col gap-3 sm:gap-4">
            {/* Main Image Container */}
            <div className="w-full aspect-square bg-[#F8F9FA] dark:bg-[#161616] rounded-none border border-gray-100 dark:border-white/[0.08] relative overflow-hidden group shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imagesList[currentImageIndex]} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />

              {/* Best Seller / Tag Badge */}
              {product.isBestSeller && (
                <div className="absolute top-3 left-3 z-10">
                  <span 
                    className="inline-flex items-center gap-1 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-none uppercase tracking-wider shadow-md"
                    style={{ backgroundColor: primaryColor || '#E84C3D' }}
                  >
                    <Sparkles size={12} />
                    Best Seller
                  </span>
                </div>
              )}
              
              {/* Carousel Arrows & Counter */}
              {imagesList.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/25 hover:bg-black/40 active:bg-black/60 text-white flex items-center justify-center transition-all active:scale-90 rounded-full backdrop-blur-[2px]"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-black/25 hover:bg-black/40 active:bg-black/60 text-white flex items-center justify-center transition-all active:scale-90 rounded-full backdrop-blur-[2px]"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>

                  {/* Dot Indicators (mobile app style) */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {imagesList.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`transition-all rounded-full ${currentImageIndex === idx ? 'w-4 h-1.5 bg-white shadow-sm' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnails Row */}
            {imagesList.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {imagesList.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 shrink-0 rounded-none overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx 
                        ? 'border-gray-900 dark:border-white opacity-100' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col">
            
            {/* Title, Price & (Heart + Share) Same Row Header */}
            <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06] mb-4">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {categoryName && (
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                    {categoryName}
                  </span>
                )}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight break-words">
                  {isKm && product.titleKm ? product.titleKm : product.title}
                </h1>
                <div className="mt-1">
                  <span 
                    className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight" 
                    style={{ color: priceColor }}
                  >
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Heart & Share buttons on the same row */}
              <div className="flex items-center gap-2 shrink-0 pt-1">
                {/* Heart Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-none border shadow-sm hover:scale-105 active:scale-95 transition-all ${
                    isFav 
                      ? 'text-white border-transparent' 
                      : 'border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400'
                  }`}
                  style={isFav ? { backgroundColor: primaryColor || '#E84C3D', borderColor: primaryColor || '#E84C3D' } : undefined}
                  title={isKm ? 'ចូលចិត្ត' : 'Favorite'}
                  aria-label="Favorite"
                >
                  <Heart 
                    size={18} 
                    className={`transition-transform duration-200 ${isFav ? 'fill-white text-white scale-110' : 'fill-none'}`} 
                  />
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-none border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.04] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 hover:scale-105 active:scale-95 transition-all shadow-sm"
                  title={isKm ? 'ចែករំលែក' : 'Share'}
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Description */}
            {(product.description || product.descriptionKm) && (
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-5 whitespace-pre-line">
                {isKm && product.descriptionKm ? product.descriptionKm : product.description}
              </p>
            )}

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                {product.variants.map((variant: any) => (
                  <div key={variant.name}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                      {variant.name}
                    </label>

                    <div className="flex flex-wrap gap-2 sm:gap-2.5">
                      {variant.options.map((opt: string) => {
                        const isSelected = selectedVariants[variant.name] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelect(variant.name, opt)}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-none text-sm font-bold transition-all border ${
                              isSelected
                                ? 'text-white border-transparent shadow-sm'
                                : 'bg-gray-50 dark:bg-white/[0.04] text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/[0.1] hover:border-gray-400 dark:hover:border-white/30 active:scale-95'
                            }`}
                            style={isSelected ? { backgroundColor: primaryColor || '#000', borderColor: primaryColor || '#000', color: '#fff' } : undefined}
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

            {/* Quantity & Add to Cart Action Row */}
            <div className="pt-5 flex items-center gap-2.5 sm:gap-3 w-full">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-gray-200 dark:border-white/[0.1] rounded-none p-0.5 sm:p-1 bg-gray-50 dark:bg-white/[0.03] shrink-0 shadow-sm h-10 sm:h-11">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-none text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white transition-colors"
                  type="button"
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="w-8 sm:w-9 text-center font-black text-xs sm:text-sm text-gray-900 dark:text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-none text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white transition-colors"
                  type="button"
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 h-10 sm:h-11 px-4 sm:px-6 rounded-none text-xs sm:text-sm md:text-base font-bold text-white shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                style={{ backgroundColor: primaryColor || '#000' }}
              >
                <ShoppingBag size={16} />
                <span>{text.addToCart}</span>
              </button>
            </div>

            {/* Trust Badges / Guarantees (Zando style) */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 p-2 sm:p-0 rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-white/[0.02] sm:dark:bg-transparent">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0">
                  <Truck size={15} />
                </div>
                <span>{text.fastDelivery}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 p-2 sm:p-0 rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-white/[0.02] sm:dark:bg-transparent">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <span>{text.authentic}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400 p-2 sm:p-0 rounded-none bg-gray-50/50 sm:bg-transparent dark:bg-white/[0.02] sm:dark:bg-transparent">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-none bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0">
                  <RotateCcw size={15} />
                </div>
                <span>{text.easyReturn}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 border-t border-gray-100 dark:border-white/[0.06]">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-6 sm:mb-8">
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
