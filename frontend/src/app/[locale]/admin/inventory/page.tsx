'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Search, AlertCircle, CheckCircle2, XCircle, ArrowUpDown, PackageX } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface Product {
  _id: string;
  title: string;
  sku: string;
  barcode: string;
  stock: number;
  imageUrl: string;
  price: number;
}

export default function InventoryPage() {
  const t = useTranslations('Dashboard');
  const user = useAuthStore((state) => state.user);
  const params = useParams();
  const isKm = params?.locale === 'km';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Track updating state for individual rows
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchProducts = useCallback(async () => {
    if (!user?._id) return;
    try {
      // Find the user's store ID first (we assume they have one)
      const storesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const stores = await storesRes.json();
      const myStore = stores.find((s: any) => s.ownerId === user._id || s.ownerId?._id === user._id);
      
      if (myStore) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${myStore._id}`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch products for inventory:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockChange = async (productId: string, newStock: number) => {
    if (!user?.token) return;
    
    // Optimistic update
    setProducts(prev => prev.map(p => p._id === productId ? { ...p, stock: newStock } : p));
    setUpdatingId(productId);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      
      if (!res.ok) {
        // Revert on failure (simple reload for now)
        fetchProducts();
        alert('Failed to update stock');
      }
    } catch (error) {
      console.error(error);
      fetchProducts();
    } finally {
      setTimeout(() => setUpdatingId(null), 500); // Show success state briefly
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: isKm ? 'អស់ពីស្តុក' : 'Out of Stock', color: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10', icon: <XCircle size={14} /> };
    if (stock <= 5) return { label: isKm ? 'ស្តុកជិតអស់' : 'Low Stock', color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10', icon: <AlertCircle size={14} /> };
    return { label: isKm ? 'មានក្នុងស្តុក' : 'In Stock', color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10', icon: <CheckCircle2 size={14} /> };
  };

  // Filter and Search logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()));
    
    let matchesFilter = true;
    if (filter === 'low') matchesFilter = p.stock > 0 && p.stock <= 5;
    if (filter === 'out') matchesFilter = p.stock <= 0;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{isKm ? 'ការគ្រប់គ្រងស្តុក' : 'Inventory Management'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isKm ? 'មើល និងធ្វើបច្ចុប្បន្នភាពចំនួនស្តុកទំនិញរបស់អ្នកយ៉ាងរហ័ស។' : 'Quickly view and update your product stock levels.'}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-[#111111] p-4 border border-gray-100 dark:border-white/10 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex bg-gray-100 dark:bg-gray-800/50 rounded-lg p-1 w-full sm:w-auto">
          <button 
            onClick={() => setFilter('all')}
            className={`flex-1 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            {isKm ? 'ទំនិញទាំងអស់' : 'All Items'}
          </button>
          <button 
            onClick={() => setFilter('low')}
            className={`flex-1 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'low' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-orange-500 hover:text-orange-600'}`}
          >
            {isKm ? 'ស្តុកជិតអស់' : 'Low Stock'}
          </button>
          <button 
            onClick={() => setFilter('out')}
            className={`flex-1 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === 'out' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-red-500 hover:text-red-600'}`}
          >
            {isKm ? 'អស់ពីស្តុក' : 'Out of Stock'}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={isKm ? 'ស្វែងរកតាមឈ្មោះ ឬកូដ...' : 'Search by name or SKU...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#E84C3D] outline-none"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
            <thead className="bg-gray-50 dark:bg-[#0a0a0a]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ផលិតផល' : 'Product'}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'កូដទំនិញ (SKU)' : 'SKU'}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ស្ថានភាព' : 'Status'}</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{isKm ? 'ចំនួនស្តុកមាន' : 'Available Stock'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isKm ? 'កំពុងផ្ទុកទិន្នន័យស្តុក...' : 'Loading inventory data...'}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <PackageX size={48} className="mb-4 opacity-20" />
                      <p className="text-sm">{isKm ? 'រកមិនឃើញផលិតផលដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។' : 'No products found matching your criteria.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  const isUpdating = updatingId === product._id;
                  
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-white/10">
                            {product.imageUrl ? (
                              <img className="h-10 w-10 object-cover" src={product.imageUrl} alt="" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <PackageX size={16} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{product.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={product.stock}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val >= 0 && val !== product.stock) {
                                handleStockChange(product._id, val);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className={`w-24 px-3 py-1.5 text-sm border rounded-lg outline-none transition-all ${
                              isUpdating 
                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' 
                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:border-[#E84C3D] focus:ring-1 focus:ring-[#E84C3D]'
                            }`}
                            min="0"
                          />
                          {isUpdating && <CheckCircle2 size={16} className="text-green-500 animate-in fade-in zoom-in" />}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
