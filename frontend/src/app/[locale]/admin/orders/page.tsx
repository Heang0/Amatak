'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Filter, ChevronDown, Check, X, Phone, Mail, Send, 
  Package, ShoppingBag, Truck, Calendar, Clock, MoreHorizontal,
  ChevronLeft, ChevronRight, ExternalLink, Printer, CheckCircle2, MapPin, Settings, XCircle } from 'lucide-react';

export default function OrderTracking() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminOrders');
  const locale = useLocale();
  const isKm = locale === 'km';

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [user, currentPage]);

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/store?page=${page}&limit=12`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
        // Default select the first order if none selected
        if (!selectedOrder && data.orders?.length > 0) {
          setSelectedOrder(data.orders[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
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
        const updated = orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order);
        setOrders(updated);
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filter & Sort Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PAID' && order.paymentStatus !== 'PAID') return false;
        if (statusFilter !== 'PAID' && order.orderStatus !== statusFilter) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const customerName = (order.isGuest ? order.guestInfo?.name : order.customerId?.name || '').toLowerCase();
        const orderId = order._id.toLowerCase();
        const phone = (order.isGuest ? order.guestInfo?.phone : order.customerId?.phone || '').toLowerCase();
        return customerName.includes(query) || orderId.includes(query) || phone.includes(query);
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'highest') return b.totalAmount - a.totalAmount;
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // newest
    });
  }, [orders, statusFilter, searchQuery, sortBy]);

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o._id));
    }
  };

  const toggleSelectOrder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Status Badge Component
  const getStatusBadge = (order: any) => {
    if (order.orderStatus === 'COMPLETED' || order.orderStatus === 'DELIVERED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-[#D1FAE5] dark:bg-emerald-950/40 text-[#047857] dark:text-emerald-300">
          {order.orderStatus === 'DELIVERED' ? (isKm ? 'បានដឹកជញ្ជូន' : 'Delivered') : (isKm ? 'បានបញ្ចប់' : 'Completed')}
        </span>
      );
    }
    if (order.paymentStatus === 'PAID') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-[#FEF3C7] dark:bg-amber-950/40 text-[#B45309] dark:text-amber-300">
          {isKm ? 'បានបង់ប្រាក់' : 'Paid'}
        </span>
      );
    }
    if (order.orderStatus === 'PROCESSING') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-[#FFEDD5] dark:bg-orange-950/40 text-[#C2410C] dark:text-orange-300">
          {isKm ? 'កំពុងរៀបចំ' : 'Processing'}
        </span>
      );
    }
    if (order.orderStatus === 'CANCELLED') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-[#FFE4E6] dark:bg-rose-950/40 text-[#BE123C] dark:text-rose-300">
          {isKm ? 'បានបោះបង់' : 'Cancelled'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        {isKm ? 'រង់ចាំ' : 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Filter Controls (Matching Reference Design) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {isKm ? 'ការបញ្ជាទិញ' : 'Orders'}
          </h1>
        </div>

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold pl-4 pr-9 py-2.5 rounded-none shadow-xs hover:border-gray-300 dark:hover:border-white/20 focus:outline-none cursor-pointer transition-all"
            >
              <option value="ALL">{isKm ? 'ស្ថានភាពទាំងអស់' : 'Any status'}</option>
              <option value="PAID">{isKm ? 'បានបង់ប្រាក់ (Paid)' : 'Paid'}</option>
              <option value="PROCESSING">{isKm ? 'កំពុងរៀបចំ (Processing)' : 'Processing'}</option>
              <option value="DELIVERED">{isKm ? 'បានដឹកជញ្ជូន (Delivered)' : 'Delivered'}</option>
              <option value="COMPLETED">{isKm ? 'បានបញ្ចប់ (Completed)' : 'Completed'}</option>
              <option value="CANCELLED">{isKm ? 'បានបោះបង់ (Cancelled)' : 'Cancelled'}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/[0.08] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-semibold pl-4 pr-9 py-2.5 rounded-none shadow-xs hover:border-gray-300 dark:hover:border-white/20 focus:outline-none cursor-pointer transition-all"
            >
              <option value="newest">{isKm ? 'តម្រៀបតាម: ថ្មីបំផុត' : 'Sort by Date'}</option>
              <option value="oldest">{isKm ? 'តម្រៀបតាម: ចាស់បំផុត' : 'Sort by Oldest'}</option>
              <option value="highest">{isKm ? 'តម្រៀបតាម: តម្លៃខ្ពស់' : 'Sort by Highest'}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={isKm ? 'ស្វែងរកឈ្មោះ ឬលេខកូដ...' : 'Search orders...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#161922] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-xs sm:text-sm font-medium pl-9 pr-4 py-2.5 rounded-none placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Orders Table (Left) + Detail Slide-over (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Table Container Column */}
        <div className={`${selectedOrder ? 'xl:col-span-8' : 'xl:col-span-12'} transition-all duration-300`}>
          <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none shadow-sm overflow-hidden">
            
            {loading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-red-500/20 border-t-[#E84C3D] rounded-none animate-spin" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('loading')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      <th className="py-4 pl-6 pr-3 w-10">
                        <button 
                          onClick={toggleSelectAll}
                          className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                            selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length
                              ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent'
                          }`}
                        >
                          {selectedOrderIds.length > 0 && <Check size={10} strokeWidth={3} />}
                        </button>
                      </th>
                      <th className="py-4 px-3">{isKm ? 'លេខបញ្ជាទិញ' : 'Order'}</th>
                      <th className="py-4 px-4">{isKm ? 'អតិថិជន' : 'Customer'}</th>
                      <th className="py-4 px-4">{isKm ? 'ស្ថានភាព' : 'Status'}</th>
                      <th className="py-4 px-4">{isKm ? 'សរុប' : 'Total'}</th>
                      <th className="py-4 px-4">{isKm ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                      <th className="py-4 pr-6 text-right w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03] text-sm font-medium">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrder?._id === order._id;
                      const isChecked = selectedOrderIds.includes(order._id);
                      const customerName = order.isGuest ? (order.guestInfo?.name || 'Guest') : (order.customerId?.name || 'Customer');

                      return (
                        <tr
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer transition-all duration-150 group ${
                            isSelected
                              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md font-bold'
                              : 'hover:bg-gray-50/80 dark:hover:bg-white/[0.03] text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="py-4 pl-6 pr-3" onClick={(e) => toggleSelectOrder(order._id, e)}>
                            <div className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                              isChecked
                                ? (isSelected ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white')
                                : (isSelected ? 'border-white/40' : 'border-gray-300 dark:border-gray-600')
                            }`}>
                              {isChecked && <Check size={10} strokeWidth={3} />}
                            </div>
                          </td>

                          {/* Order ID */}
                          <td className="py-4 px-3 font-mono font-bold text-xs whitespace-nowrap">
                            #{order._id.substring(order._id.length - 6).toUpperCase()}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-none flex items-center justify-center text-xs font-black shrink-0 ${
                                isSelected 
                                  ? 'bg-white/20 text-white dark:bg-gray-900/20 dark:text-gray-900' 
                                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                              }`}>
                                {customerName.charAt(0).toUpperCase()}
                              </div>
                              <span className="truncate max-w-[140px] font-semibold">{customerName}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {getStatusBadge(order)}
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4 font-extrabold whitespace-nowrap">
                            ${order.totalAmount?.toFixed(2)}
                          </td>

                          {/* Date */}
                          <td className={`py-4 px-4 text-xs whitespace-nowrap ${isSelected ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            {new Date(order.createdAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric' })}
                          </td>

                          {/* More Action */}
                          <td className="py-4 pr-6 text-right whitespace-nowrap">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className={`p-1 rounded-none transition-colors ${
                                isSelected ? 'text-white dark:text-gray-900 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                              }`}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-400 dark:text-gray-500 font-medium">
                          {isKm ? 'មិនមានការបញ្ជាទិញត្រូវនឹងការស្វែងរកទេ' : 'No orders match your filter.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-none text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                  <span>{t('previous')}</span>
                </button>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-none text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  <span>{t('next')}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Slide-Over Panel (Matching Reference Design!) */}
        {selectedOrder && (
          <div className="xl:col-span-4 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-xl sticky top-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Order #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedOrder)}
                  <span className="text-xs text-gray-400">
                    {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-none text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Customer Profile Card with Quick Action Buttons */}
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-[#171B26] rounded-none border border-gray-100 dark:border-white/[0.04] space-y-3">
              <div className="w-16 h-16 rounded-none bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 font-black text-xl flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-800">
                {(selectedOrder.isGuest ? selectedOrder.guestInfo?.name : selectedOrder.customerId?.name)?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">
                  {selectedOrder.isGuest ? selectedOrder.guestInfo?.name : selectedOrder.customerId?.name || 'Customer'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {selectedOrder.isGuest ? selectedOrder.guestInfo?.phone : selectedOrder.customerId?.email || 'N/A'}
                </p>
                {selectedOrder.guestInfo?.address && (
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 max-w-xs truncate">
                    <MapPin className="w-4 h-4 inline-block mr-1" /> {selectedOrder.guestInfo.address}
                  </p>
                )}
              </div>

              {/* Quick Contact Action Pills (Call / Email / Telegram) */}
              <div className="flex items-center gap-3 pt-1">
                {(selectedOrder.isGuest ? selectedOrder.guestInfo?.phone : selectedOrder.customerId?.phone) && (
                  <a
                    href={`tel:${selectedOrder.isGuest ? selectedOrder.guestInfo?.phone : selectedOrder.customerId?.phone}`}
                    className="w-9 h-9 rounded-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 transition-colors shadow-xs"
                    title="Call Customer"
                  >
                    <Phone size={15} />
                  </a>
                )}
                {selectedOrder.customerId?.email && (
                  <a
                    href={`mailto:${selectedOrder.customerId?.email}`}
                    className="w-9 h-9 rounded-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-colors shadow-xs"
                    title="Email Customer"
                  >
                    <Mail size={15} />
                  </a>
                )}
                {selectedOrder.deliveryPartner && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-300">
                    <Truck size={13} className="text-[#E84C3D]" />
                    <span>{selectedOrder.deliveryPartner}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {isKm ? 'ទំនិញដែលបានកុម្ម៉ង់' : 'Order items'} ({selectedOrder.items?.length || 0})
              </h4>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-2.5 rounded-none bg-gray-50 dark:bg-[#171B26] border border-gray-100 dark:border-white/[0.04]">
                    <div className="w-11 h-11 rounded-none bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {item.productId?.images?.[0] ? (
                        <img src={item.productId.images[0]} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.productId?.name?.en || item.productId?.name || 'Product Item'}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} {item.selectedVariants ? `• ${Object.values(item.selectedVariants).join(', ')}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-white/[0.06] text-xs">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{isKm ? 'តម្លៃសរុបទំនិញ' : 'Subtotal'}</span>
                <span className="font-semibold text-gray-900 dark:text-white">${selectedOrder.subtotal?.toFixed(2) || selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
              {selectedOrder.deliveryFee > 0 && (
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>{isKm ? 'ថ្លៃដឹកជញ្ជូន' : 'Delivery Fee'}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.discountApplied > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>{isKm ? 'បញ្ចុះតម្លៃ' : 'Discount'}</span>
                  <span className="font-bold">-${selectedOrder.discountApplied.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                <span>{isKm ? 'សរុបទាំងអស់' : 'Total'}</span>
                <span className="text-[#E84C3D]">${selectedOrder.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Status Changer & Action Buttons (Matching Reference Design!) */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {isKm ? 'ប្តូរស្ថានភាពការបញ្ជាទិញ' : 'Update Status'}
                </label>
                <select
                  value={selectedOrder.orderStatus || 'PENDING'}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  disabled={updatingStatus}
                  className="w-full bg-gray-50 dark:bg-[#171B26] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-xs font-bold px-4 py-3 rounded-none focus:outline-none cursor-pointer"
                >
                  <option value="PENDING">⏳ {isKm ? 'រង់ចាំ (Pending)' : 'Pending'}</option>
                  <option value="PROCESSING"><Settings className="w-4 h-4 inline-block mr-1" /> {isKm ? 'កំពុងរៀបចំ (Processing)' : 'Processing'}</option>
                  <option value="SHIPPED"><Truck className="w-4 h-4 inline-block mr-1" /> {isKm ? 'កំពុងដឹកជញ្ជូន (Shipped)' : 'Shipped'}</option>
                  <option value="DELIVERED"><Package className="w-4 h-4 inline-block mr-1" /> {isKm ? 'បានដឹកជញ្ជូន (Delivered)' : 'Delivered'}</option>
                  <option value="COMPLETED"><CheckCircle className="w-4 h-4 inline-block mr-1 text-green-500" /> {isKm ? 'បានបញ្ចប់ (Completed)' : 'Completed'}</option>
                  <option value="CANCELLED"><XCircle className="w-4 h-4 inline-block mr-1 text-red-500" /> {isKm ? 'បានបោះបង់ (Cancelled)' : 'Cancelled'}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-bold transition-all shadow-sm"
                >
                  <Printer size={14} />
                  <span>{isKm ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}</span>
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder._id, 'COMPLETED')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-none bg-amber-400 hover:bg-amber-500 text-amber-950 text-xs font-bold transition-all shadow-sm"
                >
                  <CheckCircle2 size={14} />
                  <span>{isKm ? 'បញ្ចប់ការលក់' : 'Complete'}</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
