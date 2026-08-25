'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { Store, Globe, ExternalLink, ShieldCheck, ShieldAlert, Edit2, Check, X } from 'lucide-react';

interface StoreItem {
  _id: string;
  name: string;
  slug: string;
  ownerId: { name: string; email: string };
  plan: {
    planId: { name: string; price: number };
    expiresAt: string;
    isActive: boolean;
  };
  customDomain?: string;
  isActive: boolean;
}

export default function StoresManagement() {
  const user = useAuthStore((state) => state.user);
  const baseDomain = useBaseDomain();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<{ id: string; domain: string; name: string } | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStore = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/stores/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (res.ok) {
        fetchStores();
      } else {
        alert('Failed to toggle store status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDomain = async () => {
    if (!selectedStore) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/stores/${selectedStore.id}/domain`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ customDomain: domainInput })
      });
      if (res.ok) {
        fetchStores();
        setIsDomainModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update domain');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Stores & Subscriptions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all tenant stores, custom domains, and subscription lifecycles.
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-bold shadow-xs">
          Total Stores: {stores.length}
        </span>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl">
          <div className="w-8 h-8 border-3 border-red-500/20 border-t-[#E84C3D] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading stores...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Store Name</th>
                  <th className="py-4 px-4">Owner</th>
                  <th className="py-4 px-4">Domain</th>
                  <th className="py-4 px-4">Plan</th>
                  <th className="py-4 px-4">Expiry</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03] text-sm font-medium">
                {stores.map((store) => {
                  const storeUrl = baseDomain.includes('vercel.app') 
                    ? `https://amatak-kh.vercel.app/store/${store.slug}` 
                    : `http://${store.slug}${baseDomain}`;

                  return (
                    <tr key={store._id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E84C3D] to-red-400 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {store.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{store.name}</p>
                            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E84C3D] hover:underline flex items-center gap-1 mt-0.5">
                              {store.slug} <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900 dark:text-white">{store.ownerId?.name || 'Owner'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{store.ownerId?.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        {store.customDomain ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full">
                            <Globe size={11} /> {store.customDomain}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {store.plan?.planId?.name || 'Free'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {store.plan?.expiresAt ? new Date(store.plan.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {store.plan?.isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                              Expired
                            </span>
                          )}
                          {!store.isActive && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStore({ id: store._id, domain: store.customDomain || '', name: store.name });
                              setDomainInput(store.customDomain || '');
                              setIsDomainModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                          >
                            Domain
                          </button>
                          <button
                            onClick={() => toggleStore(store._id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                              store.isActive 
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                            }`}
                          >
                            {store.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Custom Domain Modal */}
      {isDomainModalOpen && selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-3xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-white/[0.06]">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Custom Domain</h3>
              <button onClick={() => setIsDomainModalOpen(false)} className="p-1 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Setting custom domain for <strong className="text-gray-900 dark:text-white">{selectedStore.name}</strong>
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Domain Name</label>
              <input
                type="text"
                placeholder="e.g. store.brand.com"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50 dark:bg-[#171B26] text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:border-[#E84C3D]"
              />
              <p className="text-[11px] text-gray-400">Leave empty to remove custom domain.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsDomainModalOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-2xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDomain}
                disabled={isSubmitting}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#E84C3D] hover:bg-red-600 rounded-2xl transition-colors disabled:opacity-50 shadow-md shadow-red-500/20"
              >
                {isSubmitting ? 'Saving...' : 'Save Domain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
