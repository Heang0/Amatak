'use client';

import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isKm = params.locale === 'km';
  const orderId = params.orderId as string;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Order not found');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-6 h-6 text-blue-500" />;
      case 'PROCESSING': return <Package className="w-6 h-6 text-purple-500" />;
      case 'CANCELLED': return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DELIVERED': return isKm ? 'បានដឹកជញ្ជូន' : 'Delivered';
      case 'SHIPPED': return isKm ? 'កំពុងដឹកជញ្ជូន' : 'Shipped';
      case 'PROCESSING': return isKm ? 'កំពុងរៀបចំ' : 'Processing';
      case 'CANCELLED': return isKm ? 'បានលុបចោល' : 'Cancelled';
      default: return isKm ? 'កំពុងរង់ចាំ' : 'Pending';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="animate-spin rounded-none h-7 w-7 border-2 border-black dark:border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-[#13161F] p-8 rounded-none shadow-2xs text-center max-w-md w-full border border-gray-200 dark:border-white/[0.08] space-y-4">
          <XCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className={`text-base font-extrabold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white`}>
            {isKm ? 'រកមិនឃើញការបញ្ជាទិញទេ' : 'ORDER NOT FOUND'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            {isKm ? 'សូមពិនិត្យមើលលេខកូដបញ្ជាទិញរបស់អ្នកម្ដងទៀត។' : 'Please check your order ID and try again.'}
          </p>
          <Link
            href={`/${params.locale}/store/${params.slug}`}
            className="inline-block bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-none hover:opacity-85 transition-opacity shadow-xs"
          >
            {isKm ? 'ត្រឡប់ទៅហាងវិញ' : 'RETURN TO STORE'}
          </Link>
        </div>
      </div>
    );
  }

  const shortId = order._id.substring(0, 10).toUpperCase();

  return (
    <div className="w-full mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-20 space-y-6 min-h-[70vh]">
      {/* Top Sub-Bar */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/[0.08] mb-4">
        <Link 
          href={`/${params.locale}/store/${params.slug}`}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-400 hover:text-black dark:hover:text-white transition-colors`}
        >
          <ArrowLeft size={14} />
          <span>{isKm ? 'ត្រឡប់ទៅហាងវិញ' : 'BACK TO STORE'}</span>
        </Link>
        <span className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>
          {isKm ? 'តាមដានការបញ្ជាទិញ' : 'ORDER TRACKING'}
        </span>
      </div>

      <div className="space-y-6">
        {/* Status Banner */}
        <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] rounded-none p-6 shadow-2xs flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-none flex items-center justify-center border border-gray-200 dark:border-white/10 mb-1">
            {getStatusIcon(order.orderStatus)}
          </div>
          <h1 className={`text-lg font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'} text-gray-900 dark:text-white`}>
            {getStatusText(order.orderStatus)}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-xs">
            ID: {shortId}
          </p>
          <p className="text-gray-400 text-[11px]">
            {new Date(order.createdAt).toLocaleString(params.locale === 'km' ? 'km-KH' : 'en-US', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </p>
        </div>

        {/* Customer & Delivery Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] rounded-none p-5 shadow-2xs space-y-3">
            <h3 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/[0.06]`}>
              {isKm ? 'ព័ត៌មានអ្នកទទួល' : 'DELIVERY INFORMATION'}
            </h3>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-600 dark:text-gray-300">
                <span className="text-gray-400">{isKm ? 'ឈ្មោះ: ' : 'Name: '}</span>
                <span className="font-bold text-gray-900 dark:text-white">{order.guestInfo?.name || order.customerId?.name}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <span className="text-gray-400">{isKm ? 'ទូរស័ព្ទ: ' : 'Phone: '}</span>
                <span className="font-mono text-gray-900 dark:text-white">{order.guestInfo?.phone || order.customerId?.phone}</span>
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-1">
                <span className="text-gray-400">{isKm ? 'ទីតាំង: ' : 'Address: '}</span>
                <span className="text-gray-900 dark:text-white font-medium">{order.guestInfo?.address || order.customerId?.address}</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] rounded-none p-5 shadow-2xs space-y-3">
            <h3 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/[0.06]`}>
              {isKm ? 'ការទូទាត់' : 'PAYMENT DETAILS'}
            </h3>
            <div className="space-y-1.5 text-xs">
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <span className="text-gray-400">{isKm ? 'វិធីទូទាត់: ' : 'Method: '}</span>
                {order.paymentMethod === 'bakong_app' ? 'Bakong App' : 
                 order.paymentMethod === 'CASH' ? 'Cash' : 
                 <span className="flex items-center gap-2 text-gray-900 dark:text-white font-bold">
                   <span className="flex items-center justify-center bg-[#E1232E] w-7 h-4 rounded-none px-1">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img src="/logo/KHQR Logo.png" alt="KHQR" className="h-[9px] w-auto object-contain brightness-0 invert" />
                   </span>
                 </span>
                }
              </p>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <span className="text-gray-400">{isKm ? 'ស្ថានភាព: ' : 'Status: '}</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider ${
                  order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] rounded-none p-5 shadow-2xs space-y-4">
          <h3 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-white/[0.06]`}>
            {isKm ? 'ទំនិញរបស់អ្នក' : 'ORDER ITEMS'}
          </h3>
          <div className="space-y-3 divide-y divide-gray-100 dark:divide-white/[0.04]">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 pt-3 first:pt-0 items-center">
                <div className="w-16 h-16 rounded-none bg-stone-100 dark:bg-stone-900 flex-shrink-0 overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                  {item.productId?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.productId.imageUrl} alt={item.productId.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-gray-900 dark:text-white text-xs truncate ${isKm ? 'tracking-normal' : 'uppercase tracking-wider'}`}>
                    {isKm && item.productId?.titleKm ? item.productId.titleKm : item.productId?.title || 'Product'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ${item.price?.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-900 dark:text-white text-xs font-mono">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center text-xs">
            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase">{isKm ? 'តម្លៃសរុប' : 'TOTAL AMOUNT'}</span>
            <span className="text-base font-black text-gray-900 dark:text-white font-mono">${order.totalAmount?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
