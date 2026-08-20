'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';

export default function OrderTracking() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminOrders');
  const locale = useLocale();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [user, currentPage]);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/store?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      } else {
        const data = await res.json();
        alert(data.message || t('failed_update'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 /40 mt-0.5">Track and manage customer orders</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#111111] rounded-2xl border-none p-12 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E84C3D]/30 border-t-[#E84C3D] rounded-full animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border-none overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#F4F7FE]/50 dark:bg-[#080808]">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('order_id')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('customer')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('items')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('total_amount')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('payment')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('fulfillment')}</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('date')}</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{locale === 'km' ? 'សកម្មភាព' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-[#F4F7FE]/70 dark:hover:bg-gray-800/30 transition-colors duration-150 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
                      #{order._id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0">
                        {(order.isGuest ? order.guestInfo?.name : order.customerId?.name)?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {order.isGuest ? order.guestInfo?.name || t('guest') : order.customerId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{order.isGuest ? order.guestInfo?.phone : order.customerId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{order.items.length} <span className="text-gray-600 dark:text-gray-400">{t('items')}</span></span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-black text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.paymentStatus === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        {t('status_paid')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        {t('status_pending')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.orderStatus || 'PENDING'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 ring-1 focus:outline-none focus:ring-2 focus:ring-[#E84C3D]/50 transition-colors cursor-pointer ${ order.orderStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800/50' : order.orderStatus === 'SHIPPED' ? 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800/50' : order.orderStatus === 'PROCESSING' ? 'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-800/50' : order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800/50' : 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/50' }`}
                    >
                      <option value="PENDING">{t('status_pending')}</option>
                      <option value="PROCESSING">{t('status_processing')}</option>
                      <option value="SHIPPED">{t('status_shipped')}</option>
                      <option value="DELIVERED">{t('status_delivered')}</option>
                      <option value="CANCELLED">{t('status_cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {t('order_details')}
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('no_orders')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-[#F4F7FE] dark:bg-[#111111]">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-[#F4F7FE] dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {t('previous')}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-[#F4F7FE] dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && typeof window !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 ${locale === 'km' ? 'font-khmer' : ''}`}>
          <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 pr-14 sm:pr-16 relative">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('order_details')}</h3>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => window.print()}
                  className="bg-[#E84C3D] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                  Print Label
                </button>
                <button
                  onClick={() => {
                    const storeSlug = selectedOrder?.storeId?.slug || 'unknown';
                    const link = `${window.location.origin}/${locale}/store/${storeSlug}/orders/${selectedOrder._id}`;
                    navigator.clipboard.writeText(link);
                    try {
                      alert(t('link_copied'));
                    } catch (e) {
                      alert(locale === 'km' ? 'បានចម្លងតំណភ្ជាប់!' : 'Tracking link copied to clipboard!');
                    }
                  }}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                  Share Link
                </button>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 sm:right-6 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">{t('customer_info')}</h4>
                  {selectedOrder.isGuest ? (
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.guestInfo?.name}</p>
                      <p className="text-gray-600 dark:text-gray-400 font-mono">{selectedOrder.guestInfo?.phone}</p>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.guestInfo?.name || selectedOrder.customerId?.name}</p>
                      {selectedOrder.guestInfo?.phone && selectedOrder.guestInfo?.phone !== selectedOrder.customerId?.email && (
                        <p className="text-gray-600 dark:text-gray-400 font-mono">{selectedOrder.guestInfo?.phone}</p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{selectedOrder.customerId?.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-2">{t('delivery')}</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.deliveryPartner || 'J&T Express'}</p>
                    <p className="text-gray-600 dark:text-gray-400 bg-[#F4F7FE] dark:bg-gray-900 p-2 rounded-lg mt-2 leading-relaxed">
                      {selectedOrder.guestInfo?.address || 'No address provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-3">{t('order_items')}</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-start p-3 bg-[#F4F7FE] dark:bg-[#080808] rounded-xl border-none">
                      <div className="flex gap-3">
                        {item.productId?.imageUrl && (
                          <div className="w-12 h-12 shrink-0 bg-white dark:bg-gray-800 rounded-lg border-none overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={item.productId.imageUrl.replace('/upload/', '/upload/w_300,c_limit,q_auto/')} 
                              alt="Product" 
                              className="w-full h-full object-cover" 
                              loading="lazy" 
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.quantity}x {item.productId?.title || t('unknown_item')}
                          </p>
                          {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(item.selectedVariants).map(([k, v]) => (
                                <span key={k} className="text-[11px] font-medium bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                                  {k}: {v as string}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Status */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="font-semibold text-gray-600 dark:text-gray-400">{t('total_paid_khqr')}</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">${selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>,
        document.getElementById('app-root') || document.body
      )}

      {/* Hidden Print Layout (Shipping Label - 4x6 / 100x150mm) */}
      {selectedOrder && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] text-black font-sans" style={{ width: '100mm', margin: '0 auto', padding: '5mm', boxSizing: 'border-box' }}>
          <style>{`
            @media print {
              @page {
                size: 100mm 150mm; /* Standard 4x6 shipping label */
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          `}</style>

          <div className="border-2 border-black h-full flex flex-col p-2">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
              <div>
                <div className="font-bold text-lg uppercase tracking-wider">
                  {selectedOrder.deliveryPartner || 'STANDARD'}
                </div>
                {selectedOrder.storeId && (
                  <div className="text-[10px] mt-1 text-gray-700 dark:text-gray-300 font-medium">
                    SENDER: {selectedOrder.storeId.name}
                    {selectedOrder.storeId.contact?.phone && <><br/>TEL: {selectedOrder.storeId.contact.phone}</>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-mono text-sm tracking-widest font-bold bg-black text-white px-2 py-1 inline-block mb-1">
                  {selectedOrder._id.substring(0, 12).toUpperCase()}
                </div>
                <div className="text-[10px] font-bold">ORDER ID</div>
                <div className="text-[10px] mt-1">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Ship To */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="text-xs font-bold tracking-widest mb-1">SHIP TO:</div>
              {selectedOrder.isGuest ? (
                <div>
                  <div className="font-bold text-xl leading-tight">{selectedOrder.guestInfo?.name}</div>
                  <div className="text-sm font-medium mt-1">{selectedOrder.guestInfo?.phone}</div>
                  <div className="text-sm mt-1 whitespace-pre-line leading-snug">{selectedOrder.guestInfo?.address}</div>
                </div>
              ) : (
                <div>
                  <div className="font-bold text-xl leading-tight">{selectedOrder.customerId?.name}</div>
                  <div className="text-sm mt-1">{selectedOrder.customerId?.email}</div>
                  <div className="text-sm mt-1 italic text-gray-700 dark:text-gray-300">See system for address</div>
                </div>
              )}
            </div>

            {/* Delivery Note */}
            {selectedOrder.deliveryNote && (
              <div className="border-b-2 border-black pb-2 mb-2">
                <div className="text-xs font-bold tracking-widest mb-1">NOTE:</div>
                <div className="text-sm font-bold uppercase">{selectedOrder.deliveryNote}</div>
              </div>
            )}

            {/* Order Items */}
            <div className="flex-1">
              <div className="text-xs font-bold tracking-widest border-b border-black pb-1 mb-1">ITEMS ({selectedOrder.items.length}):</div>
              <table className="w-full text-xs">
                <tbody>
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className="py-1 font-bold">
                        {item.quantity}x
                      </td>
                      <td className="py-1 pl-2">
                        {item.productId?.title || 'Unknown Item'}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <span className="text-[10px] text-gray-600 dark:text-gray-400 ml-1">
                            ({Object.values(item.selectedVariants).join(', ')})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-2 border-t-2 border-black text-center">
              <div className="text-xs font-bold tracking-widest uppercase">
                Thank you for shopping with us!
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                Please include this label clearly on the package.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
