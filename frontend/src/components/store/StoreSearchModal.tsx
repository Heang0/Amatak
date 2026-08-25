'use client';

import { useState, useEffect } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

interface Product {
  _id: string;
  title: string;
  titleKm?: string;
  slug: string;
  imageUrl: string;
  price: number;
}

export default function StoreSearchModal({ 
  isOpen, 
  onClose, 
  slug, 
  locale, 
  primaryColor 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  slug: string; 
  locale: string; 
  primaryColor: string; 
}) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const params = useParams();

  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting && params?.slug ? `/${locale}/store/${params.slug}` : `/${locale}`;

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`);
          if (!storeRes.ok) return;
          const store = await storeRes.json();
          const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${store._id}`);
          if (!prodRes.ok) return;
          const prods = await prodRes.json();
          setProducts(prods.products || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, slug]);

  if (!isOpen) return null;

  const isKm = locale === 'km';

  const filteredProducts = query 
    ? products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        (p.titleKm && p.titleKm.includes(query))
      )
    : products;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-2xs flex items-start justify-center pt-12 sm:pt-20 px-4 pb-4 animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#111318] rounded-none border border-gray-200 dark:border-white/[0.1] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-top-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100 dark:border-white/[0.06] shrink-0 gap-3">
          <Search className="text-gray-400 shrink-0" size={18} />
          
          <input
            autoFocus
            type="text"
            placeholder={isKm ? 'ស្វែងរកផលិតផល...' : 'Search for products, items, or collections...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base font-medium text-gray-900 dark:text-white placeholder-gray-400"
          />

          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-black dark:border-t-white rounded-none animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-xs font-bold uppercase tracking-wider text-gray-400">
              {isKm ? 'រកមិនឃើញលទ្ធផល' : 'No results found'} {query ? `for "${query}"` : ''}
            </div>
          ) : (
            <div>
              {!query && (
                <h3 className={`text-[11px] font-bold text-gray-400 ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} mb-3 px-1`}>
                  {isKm ? 'ផលិតផលណែនាំ' : 'SUGGESTED FOR YOU'}
                </h3>
              )}
              
              <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredProducts.map(product => {
                  const title = isKm && product.titleKm ? product.titleKm : product.title;

                  return (
                    <Link 
                      key={product._id} 
                      href={`${basePath}/product/${product.slug || product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 group hover:bg-gray-50 dark:hover:bg-white/[0.03] px-2 rounded-none transition-colors"
                    >
                      {/* Product Thumbnail (Square & Sharp Corners) */}
                      <div className="w-14 h-14 shrink-0 bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} 
                            alt={title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white line-clamp-1 group-hover:text-black dark:group-hover:text-white`}>
                          {title}
                        </h4>
                        <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>

                      <ArrowRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
