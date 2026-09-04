'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';
import { ChevronLeft } from 'lucide-react';
import Select from 'react-select';

export default function CheckoutPageNeoBrutalism({ params }: { params: { slug: string, locale: string } }) {
  const { items, getTotalPrice, clearCart, _hasHydrated } = useCartStore();
  const user = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; orderId: string; totalAmount: number; currency: string; deepLink?: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'PAID' | 'FAILED'>('IDLE');
  const [paymentMethod, setPaymentMethod] = useState<'KHQR' | 'bakong_app'>('KHQR');

  // Checkout State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  
  // Geo Data State
  const [geoData, setGeoData] = useState<any[]>([]);
  const [tempProvince, setTempProvince] = useState<any>(null);
  const [tempDistrict, setTempDistrict] = useState<any>(null);
  const [tempCommune, setTempCommune] = useState<any>(null);
  const [tempStreet, setTempStreet] = useState('');
  const [deliveryPartner, setDeliveryPartner] = useState('J&T Express');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Promo State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [themeStyle, setThemeStyle] = useState('neo-brutalism');
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const searchParams = useSearchParams();
  const isKm = params.locale === 'km';

  const text = {
    checkout: isKm ? 'ការទូទាត់' : 'CHECKOUT',
    fillGuest: isKm ? 'សូមបំពេញព័ត៌មានទំនាក់ទំនងទាំងអស់ដើម្បីបន្ត។' : 'Please fill in all contact details to proceed.',
    createOrderError: isKm ? 'មានបញ្ហាក្នុងការបង្កើតការបញ្ជាទិញ' : 'Error creating order',
    guestDetails: isKm ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'SHIPPING ADDRESS',
    fullName: isKm ? 'ឈ្មោះពេញ' : 'Full Name',
    phoneNumber: isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number',
    deliveryAddress: isKm ? 'អាសយដ្ឋានលម្អិត' : 'Detailed Address (House / Street)',
    deliveryPartners: isKm ? 'ជម្រើសដឹកជញ្ជូន' : 'DELIVERY OPTION',
    deliveryNote: isKm ? 'ចំណាំពីការដឹកជញ្ជូន' : 'DELIVERY NOTE (OPTIONAL)',
    deliveryNotePlaceholder: isKm ? 'ឧទាហរណ៍: ផ្ទះជាន់ផ្ទាល់ដី ជាដើម' : 'Ex: Leave at front door / Ground floor',
    paymentMethod: isKm ? 'វិធីសាស្ត្រទូទាត់' : 'PAYMENT METHOD',
    acceptedPaymentMethods: isKm ? 'ជ្រើសរើសវិធីទូទាត់ប្រាក់' : 'Select payment option',
    instantApproval: isKm ? 'អនុម័តភ្លាមៗ' : 'Instant Approval',
    bakongPayment: isKm ? 'ទូទាត់តាម Bakong KHQR (ABA, Wing, ACLEDA, etc.)' : 'Scan & pay with any Cambodian Banking App',
    bakongApp: isKm ? 'កម្មវិធីបាគង' : 'Bakong App',
    bakongAppDesc: isKm ? 'ចុចដើម្បីបើកកម្មវិធីបាគងដោយផ្ទាល់' : 'Tap to pay directly with Bakong',
    mobileOnly: isKm ? 'សម្រាប់តែទូរស័ព្ទដៃ' : 'Mobile Only',
    totalProduct: isKm ? 'តម្លៃទំនិញសរុប' : 'Subtotal',
    discount: isKm ? 'បញ្ចុះតម្លៃ' : 'Discount',
    totalAfterDiscount: isKm ? 'សរុបក្រោយបញ្ចុះតម្លៃ' : 'After Discount',
    deliveryFee: isKm ? 'ថ្លៃដឹកជញ្ជូន' : 'Delivery Fee',
    grandTotal: isKm ? 'តម្លៃសរុបទាំងអស់' : 'GRAND TOTAL',
    onlinePaymentsUnavailable: isKm ? 'មិនអាចទូទាត់តាមអនឡាញបានទេ' : 'Online Payments Unavailable',
    freePlanMessage: isKm
      ? 'ហាងនេះកំពុងប្រើគម្រោងឥតគិតថ្លៃ ហើយមិនអាចទទួលការទូទាត់ Bakong KHQR បានទេ។'
      : 'This store is on a Free Plan and cannot accept Bakong KHQR payments.',
    processing: isKm ? 'កំពុងដំណើរការ...' : 'PROCESSING...',
    checkoutBtn: isKm ? 'បញ្ជាទិញ (KHQR)' : 'PLACE ORDER (KHQR)',
  };

  const deliveryOptions = [
    { id: 'J&T Express', name: isKm ? 'ក្រុមហ៊ុន J&T Express' : 'J&T Express', logo: '/logo/J&T.webp', desc: isKm ? 'ដឹកជញ្ជូនទូទាំង ២៥ ខេត្ត-ក្រុង' : 'Delivery across Cambodia', fee: 0 },
    { id: 'VET Express', name: isKm ? 'វីរៈប៊ុនថាំ (VET)' : 'VET Express', logo: '/logo/VET.png', desc: isKm ? 'ដឹកជញ្ជូនទូទាំង ២៥ ខេត្ត-ក្រុង' : 'Delivery across Cambodia', fee: 0 },
    { id: 'Grab', name: isKm ? 'ហ្គ្រេប (Grab Express)' : 'Grab Express', logo: '/logo/Grab.png', desc: isKm ? 'ដឹកជញ្ជូនរហ័សក្នុងក្រុង' : 'Fast Delivery in City', fee: 0 },
  ];

  const totalProduct = getTotalPrice();

  const currentDeliveryFee = useMemo(() => {
    let fee = store?.deliverySettings?.standardDeliveryFee || 0;
    
    // Override if a specific partner has an extra fee defined in the future
    const partnerFee = deliveryOptions.find(d => d.id === deliveryPartner)?.fee;
    if (partnerFee && partnerFee > 0) {
      fee = partnerFee;
    }

    if (store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0) {
      if (totalProduct >= store.deliverySettings.freeDeliveryThreshold) {
        fee = 0;
      }
    }
    return fee;
  }, [deliveryPartner, store, totalProduct]);

  const discount = discountAmount;
  const totalAfterDiscount = totalProduct - discount;
  const grandTotal = totalAfterDiscount + currentDeliveryFee;

  useEffect(() => {
    setMounted(true);

    const savedQR = sessionStorage.getItem('pendingCartQR');
    if (savedQR) {
      try {
        const data = JSON.parse(savedQR);
        if (Date.now() - data.timestamp < 300000) {
          setQrData(data);
          setPaymentStatus('PENDING');
          pollPaymentStatus(data.orderId, data.md5);
        } else {
          sessionStorage.removeItem('pendingCartQR');
        }
      } catch (e) { }
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => {
        setStoreId(data._id);
        setStore(data);
        const previewTheme = searchParams.get('theme');
        const previewColor = searchParams.get('color');
        setThemeStyle(previewTheme || data.branding?.themeStyle || 'default');
        setPrimaryColor(previewColor || data.branding?.primaryColor || '#000000');
      })
      .catch(console.error);

    // Fetch Cambodia Geo Data
    fetch('/data/cambodia_geo.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
  }, [params.slug, searchParams, items.length, router, params.locale]);

  useEffect(() => {
    if (user) {
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        if (!guestAddress) {
          setGuestName(defaultAddr.recipientName);
          setGuestPhone(defaultAddr.phoneNumber);
          setGuestAddress(defaultAddr.addressString);
        }
      } else {
        if (!guestName) setGuestName(user.name || '');
        if (!guestPhone) setGuestPhone(user.phone || '');
        if (!guestAddress) setGuestAddress(user.address || '');
      }
    }
  }, [user]);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/promos/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          code: promoInput,
          orderValue: totalProduct,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setAppliedPromo(data.code);
      setDiscountAmount(data.discountAmount);
    } catch (err: any) {
      setPromoError(err.message);
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!guestName || !guestPhone || !guestAddress) {
      alert(text.fillGuest);
      return;
    }

    if (!storeId || items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        storeId,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          selectedVariants: i.selectedVariants
        })),
        totalAmount: grandTotal,
        subtotal: totalProduct,
        deliveryPartner,
        deliveryFee: currentDeliveryFee,
        deliveryNote,
        promoCode: appliedPromo,
        guestInfo: { name: guestName, phone: guestPhone, address: guestAddress },
        paymentMethod
      };

      const endpoint = user ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders` : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/guest`;
      const headers: any = { 'Content-Type': 'application/json' };
      if (user) headers['Authorization'] = `Bearer ${user.token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setPaymentStatus('PENDING');
      sessionStorage.setItem('pendingCartQR', JSON.stringify({ ...data, timestamp: Date.now() }));
      pollPaymentStatus(data.orderId, data.md5);

    } catch (err: any) {
      console.error(err);
      alert(err.message || text.createOrderError);
      setLoading(false);
    }
  };

  const pollIntervalRef = useRef<any>(null);

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollPaymentStatus = (orderId: string, md5: string) => {
    clearPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5 }),
        });
        const data = await res.json();
        if (data.status === 'PAID') {
          setPaymentStatus('PAID');
          clearPolling();
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000);

    setTimeout(() => {
      clearPolling();
      setPaymentStatus((current) => {
        if (current === 'PENDING') {
          sessionStorage.removeItem('pendingCartQR');
          return 'FAILED';
        }
        return current;
      });
    }, 300000);
  };

  const handleSimulatePay = async () => {
    if (!qrData?.orderId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/${qrData.orderId}/simulate-pay`, { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  if (!mounted) return null;

  if (_hasHydrated && items.length === 0 && !sessionStorage.getItem('pendingCartQR')) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4 text-center bg-white dark:bg-[#111111]">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isKm ? 'កន្ត្រករបស់អ្នកទទេ' : 'Your cart is empty'}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{isKm ? 'អ្នកមិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេដើម្បីធ្វើការទូទាត់។' : 'You have no items in your cart to checkout.'}</p>
        <Link
          href={`/${params.locale}`}
          className="text-white font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform bg-black dark:bg-white dark:text-black"
          style={{ backgroundColor: primaryColor || undefined }}
        >
          {isKm ? 'ត្រលប់ទៅទិញទំនិញវិញ' : 'Return to Shopping'}
        </Link>
      </div>
    );
  }

  const provinceOptions = geoData.map((p: any) => ({ value: p, label: isKm ? p.name_km : p.name_en }));
  const districtOptions = tempProvince ? tempProvince.districts.map((d: any) => ({ value: d, label: isKm ? d.name_km : d.name_en })) : [];
  const communeOptions = tempDistrict ? tempDistrict.communes.map((c: any) => ({ value: c, label: isKm ? c.name_km : c.name_en })) : [];

  const modalsJsx = (
    <>
      {qrData && (
        <BakongKHQRModal
          qrString={qrData.qrString}
          amount={qrData.totalAmount}
          currency={qrData.currency}
          merchantName={store?.name || "Amatak Merchant"}
          isPaid={paymentStatus === 'PAID'}
          locale={params.locale}
          onClose={() => { clearPolling(); setQrData(null); sessionStorage.removeItem('pendingCartQR'); }}
          onSuccessClose={() => { clearPolling(); setQrData(null); sessionStorage.removeItem('pendingCartQR'); clearCart(); window.location.href = `/store/${params.slug}/orders/${qrData.orderId}`; }}
        />
      )}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white dark:bg-[#111318] p-6 border border-gray-200 dark:border-white/10 rounded-none shadow-2xl overflow-hidden space-y-5">
            <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
              {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'ENTER NEW ADDRESS'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium bg-white dark:bg-[#111318] text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 focus:border-black dark:focus:border-white rounded-none outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'លេខទូរស័ព្ទ' : 'Phone Number'}</label>
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={e => setTempPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-medium bg-white dark:bg-[#111318] text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 focus:border-black dark:focus:border-white rounded-none outline-none transition-all"
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'រាជធានី / ខេត្ត' : 'Province'}</label>
                  <Select menuPosition='fixed'
                    options={provinceOptions}
                    value={tempProvince ? { value: tempProvince, label: isKm ? tempProvince.name_km : tempProvince.name_en } : null}
                    onChange={(selected: any) => {
                      setTempProvince(selected.value);
                      setTempDistrict(null);
                      setTempCommune(null);
                    }}
                    placeholder={isKm ? "ជ្រើសរើសខេត្ត" : "Select Province"}
                    styles={{
                      control: (base) => ({ ...base, minHeight: '40px', borderRadius: '0', borderColor: '#d1d5db', backgroundColor: 'transparent', boxShadow: 'none', '&:hover': { borderColor: '#000' } }),
                      option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#f3f4f6' : 'transparent', color: '#111827' }),
                      menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0' })
                    }}
                  />
                </div>
                {tempProvince && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'ក្រុង / ស្រុក / ខណ្ឌ' : 'District'}</label>
                    <Select menuPosition='fixed'
                      options={districtOptions}
                      value={tempDistrict ? { value: tempDistrict, label: isKm ? tempDistrict.name_km : tempDistrict.name_en } : null}
                      onChange={(selected: any) => {
                        setTempDistrict(selected.value);
                        setTempCommune(null);
                      }}
                      placeholder={isKm ? "ជ្រើសរើសស្រុក" : "Select District"}
                      styles={{
                        control: (base) => ({ ...base, minHeight: '40px', borderRadius: '0', borderColor: '#d1d5db', backgroundColor: 'transparent', boxShadow: 'none', '&:hover': { borderColor: '#000' } }),
                        option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#f3f4f6' : 'transparent', color: '#111827' }),
                        menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0' })
                      }}
                    />
                  </div>
                )}
                {tempDistrict && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'ឃុំ / សង្កាត់' : 'Commune'}</label>
                    <Select menuPosition='fixed'
                      options={communeOptions}
                      value={tempCommune ? { value: tempCommune, label: isKm ? tempCommune.name_km : tempCommune.name_en } : null}
                      onChange={(selected: any) => {
                        setTempCommune(selected.value);
                      }}
                      placeholder={isKm ? "ជ្រើសរើសឃុំ" : "Select Commune"}
                      styles={{
                        control: (base) => ({ ...base, minHeight: '40px', borderRadius: '0', borderColor: '#d1d5db', backgroundColor: 'transparent', boxShadow: 'none', '&:hover': { borderColor: '#000' } }),
                        option: (base, { isFocused }) => ({ ...base, backgroundColor: isFocused ? '#f3f4f6' : 'transparent', color: '#111827' }),
                        menu: (base) => ({ ...base, zIndex: 9999, borderRadius: '0' })
                      }}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'ផ្ទះលេខ / ផ្លូវ (ជាជម្រើស)' : 'House / Street (Optional)'}</label>
                  <input
                    type="text"
                    value={tempStreet}
                    onChange={e => setTempStreet(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs font-medium bg-white dark:bg-[#111318] text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 focus:border-black dark:focus:border-white rounded-none outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 rounded-none"
              >
                {isKm ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  let finalAddressString = '';
                  if (tempProvince) {
                    const prov = isKm ? tempProvince.name_km : tempProvince.name_en;
                    const dist = tempDistrict ? (isKm ? tempDistrict.name_km : tempDistrict.name_en) : '';
                    const comm = tempCommune ? (isKm ? tempCommune.name_km : tempCommune.name_en) : '';
                    finalAddressString = [tempStreet, comm, dist, prov].filter(Boolean).join(', ');
                  } else {
                    finalAddressString = tempStreet;
                  }
                  
                  if (!tempName || !tempPhone || !finalAddressString) {
                    alert('Please fill in all address details.');
                    return;
                  }

                  setGuestName(tempName);
                  setGuestPhone(tempPhone);
                  setGuestAddress(finalAddressString);

                  if (user) {
                    try {
                      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${user.token}`
                        },
                        body: JSON.stringify({
                          address: {
                            recipientName: tempName,
                            phoneNumber: tempPhone,
                            addressString: finalAddressString,
                            isDefault: true
                          }
                        })
                      });
                      
                      if (res.ok) {
                        const updatedUser = await res.json();
                        setCustomerInfo({ ...user, ...updatedUser });
                      }
                    } catch (error) {
                      console.error("Failed to save address to profile:", error);
                    }
                  }

                  setIsAddressModalOpen(false);
                }}
                className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black text-xs font-bold uppercase tracking-widest rounded-none"
              >
                {isKm ? 'រក្សាទុក' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // -------------------------------------------------------------
  // THEME 3: NEO-BRUTALISM
  // -------------------------------------------------------------
  if (themeStyle === 'neo-brutalism') {
    return (
      <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#111] font-sans text-black dark:text-white pb-32">
        {modalsJsx}
        <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between border-b-[4px] border-black dark:border-white mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1 border-[3px] border-black dark:border-white bg-white dark:bg-black text-black dark:text-white hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {text.checkout}
            </h1>
          </div>
          <span className="text-sm font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 border-[2px] border-black dark:border-white">
            {items.length} {isKm ? 'ទំនិញ' : 'ITEMS'}
          </span>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 lg:grid lg:grid-cols-12 lg:gap-10 items-start">
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-20 order-1">
            
            {/* ITEMS CARD */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">
                {isKm ? 'ទំនិញក្នុងការបញ្ជាទិញ' : 'ORDER SUMMARY'}
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 py-3 border-b-[3px] border-black/20 dark:border-white/20 last:border-0">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 border-[3px] border-black dark:border-white shrink-0 p-1">
                      {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover border-[2px] border-black dark:border-white" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-black text-black dark:text-white text-base line-clamp-1 uppercase">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                      <div className="text-black dark:text-white text-sm font-bold mt-1 bg-[#ffeb3b] w-fit px-1 border-[2px] border-black">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mt-1 border-[2px] border-black w-fit px-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center">
                      <span className="font-black text-black dark:text-white text-lg bg-[#4ade80] px-1 border-[2px] border-black">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMO CODE */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'PROMO CODE'}</h3>
              <div className="flex gap-2">
                <input type="text" placeholder={isKm ? 'បញ្ចូលលេខកូដ...' : 'ENTER CODE'} value={promoInput} onChange={e => setPromoInput(e.target.value)} disabled={applyingPromo || !!appliedPromo}
                  className="flex-1 w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white uppercase placeholder-gray-500" />
                {appliedPromo ? (
                  <button onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(''); setPromoError(''); }} className="px-6 py-3 border-[3px] border-black bg-[#f87171] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
                    {isKm ? 'ដកចេញ' : 'REMOVE'}
                  </button>
                ) : (
                  <button onClick={handleApplyPromo} disabled={applyingPromo || !promoInput.trim()} className="px-6 py-3 border-[3px] border-black bg-[#4ade80] text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:opacity-50">
                    {applyingPromo ? '...' : (isKm ? 'អនុវត្ត' : 'APPLY')}
                  </button>
                )}
              </div>
              {promoError && <p className="text-sm text-[#f87171] font-black mt-2 bg-black px-2 py-1 w-fit">{promoError}</p>}
              {appliedPromo && <p className="text-sm text-[#4ade80] font-black mt-2 bg-black px-2 py-1 w-fit">{isKm ? `លេខកូដបញ្ចុះតម្លៃ '${appliedPromo}' បានអនុវត្តដោយជោគជ័យ!` : `Promo code '${appliedPromo}' applied successfully!`}</p>}
            </div>

            {/* TOTALS */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <div className="space-y-3 font-bold text-sm uppercase">
                <div className="flex justify-between"><span>{text.totalProduct}</span><span className="font-black bg-[#ffeb3b] px-1 border-[2px] border-black text-black">${totalProduct.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.discount}</span><span className="font-black bg-[#f87171] px-1 border-[2px] border-black text-black">-${discount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.deliveryFee}</span><span className="font-black bg-gray-200 px-1 border-[2px] border-black text-black">${currentDeliveryFee.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t-[4px] border-black dark:border-white text-xl">
                <span className="font-black uppercase">{text.grandTotal}</span>
                <span className="font-black bg-[#4ade80] px-2 py-1 border-[3px] border-black text-black">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 mt-8 lg:mt-0 order-2">
            {/* GUEST DETAILS */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">{text.guestDetails}</h3>
              {user ? (
                <div className="space-y-4">
                  {user?.addresses && user.addresses.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-black uppercase mb-2">{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន' : 'Select Address'}</label>
                      <select className="w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white"
                        onChange={(e) => {
                          const addr = user?.addresses?.find((a: any) => a._id === e.target.value);
                          if (addr) { setGuestName(addr.recipientName); setGuestPhone(addr.phoneNumber); setGuestAddress(addr.addressString); }
                        }}
                        value={user?.addresses?.find((a: any) => a.addressString === guestAddress)?._id || ''}>
                        <option value="" disabled>{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន...' : 'Select an address...'}</option>
                        {user?.addresses?.map((addr: any) => <option key={addr._id} value={addr._id}>{addr.recipientName} - {addr.addressString}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="p-4 border-[3px] border-black dark:border-white bg-[#ffeb3b] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-black text-lg uppercase tracking-wide">{guestName}</p>
                    <p className="font-bold border-[2px] border-black w-fit px-1 bg-white mt-1">{guestPhone}</p>
                    <p className="font-bold mt-2 leading-relaxed bg-white border-[2px] border-black p-2">{guestAddress || (isKm ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន' : 'Please provide a shipping address')}</p>
                  </div>
                  <button onClick={() => { setTempName(user?.name || ''); setTempPhone(user?.phone || ''); setTempProvince(null); setTempDistrict(null); setTempCommune(null); setTempStreet(''); setIsAddressModalOpen(true); }}
                    className="w-full py-3 border-[3px] border-black bg-black text-white dark:bg-white dark:text-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
                    {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Add New Address'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input type="text" placeholder={text.fullName} value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white uppercase placeholder-gray-500" />
                  <input type="tel" placeholder={text.phoneNumber} value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white uppercase placeholder-gray-500" />
                  <textarea placeholder={text.deliveryAddress} value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3} className="w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white uppercase placeholder-gray-500 resize-none" />
                </div>
              )}
            </div>

            {/* DELIVERY OPTIONS */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">{text.deliveryPartners}</h3>
              <div className="space-y-4">
                {deliveryOptions.map((partner) => (
                  <label key={partner.id} className={`flex items-center gap-4 p-4 border-[3px] cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${deliveryPartner === partner.id ? 'border-black bg-[#c084fc] text-black' : 'border-black bg-white text-black'}`}>
                    <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                    <div className={`w-6 h-6 border-[3px] border-black flex items-center justify-center bg-white`}>
                      {deliveryPartner === partner.id && <div className="w-2.5 h-2.5 bg-black" />}
                    </div>
                    <img src={partner.logo} alt={partner.name} className="h-10 w-16 object-contain bg-white border-[3px] border-black p-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-black uppercase block">{partner.name}</span>
                      <span className="text-sm font-bold block">{partner.desc}</span>
                    </div>
                    <span className="text-base font-black uppercase bg-white border-[3px] border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {(store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && totalProduct >= store.deliverySettings.freeDeliveryThreshold)
                        ? 'FREE' : `$${partner.fee.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* DELIVERY NOTE */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">{text.deliveryNote}</h3>
              <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black border-[3px] border-black dark:border-white focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-black dark:text-white uppercase placeholder-gray-500" />
            </div>

            {/* PAYMENT */}
            <div className="bg-white dark:bg-black border-[4px] border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
              <h3 className="text-lg font-black uppercase border-b-[4px] border-black dark:border-white pb-3 mb-4">{text.paymentMethod}</h3>
              <label className={`flex items-start gap-4 p-4 border-[3px] cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${paymentMethod === 'KHQR' ? 'border-black bg-[#ffeb3b] text-black' : 'border-black bg-white text-black'}`}>
                <input type="radio" checked={paymentMethod === 'KHQR'} onChange={() => setPaymentMethod('KHQR')} className="hidden" />
                <div className={`w-6 h-6 border-[3px] border-black flex items-center justify-center bg-white mt-1`}>
                  {paymentMethod === 'KHQR' && <div className="w-2.5 h-2.5 bg-black" />}
                </div>
                <div className="w-12 h-12 bg-red-600 border-[3px] border-black flex items-center justify-center p-2">
                  <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase">Bakong KHQR <span className="text-xs bg-black text-white px-2 py-0.5 ml-2 border-[2px] border-black">{text.instantApproval}</span></h4>
                  <p className="text-sm font-bold mt-1">{text.bakongPayment}</p>
                </div>
              </label>
            </div>

            {/* BUTTON */}
            {(store as any)?.plan?.planId?.price === 0 ? (
              <div className="w-full bg-[#f87171] text-black p-4 border-[4px] border-black text-center text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                {text.freePlanMessage}
              </div>
            ) : (
              <button onClick={handleCheckout} disabled={loading || paymentStatus === 'PENDING'} className="w-full py-5 bg-[#4ade80] text-black text-2xl font-black uppercase border-[4px] border-black flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50">
                {loading ? text.processing : text.checkoutBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 5: SKINCARE & BEAUTY (Clean Apothecary)
  // -------------------------------------------------------------
  if (themeStyle === 'skincare-clean') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0C0C] font-sans text-[#333] dark:text-[#E5E5E5] pb-32">
        {modalsJsx}
        <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-4 flex flex-col items-center border-b border-[#E5E5E5] dark:border-[#222] mb-10">
          <button onClick={() => router.back()} className="self-start text-[#888] hover:text-[#333] dark:hover:text-[#E5E5E5] transition-colors mb-2">
            <ChevronLeft size={20} strokeWidth={1} />
          </button>
          <h1 className="text-2xl font-light uppercase tracking-widest text-[#222] dark:text-[#FFF] text-center w-full">
            {text.checkout}
          </h1>
          <span className="text-[10px] uppercase tracking-widest mt-2 bg-[#333] text-[#FAF9F6] dark:bg-[#E5E5E5] dark:text-[#0C0C0C] px-2 py-1">
            {items.length} {isKm ? 'ទំនិញ' : 'ITEMS'}
          </span>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10 order-1">
            {/* ITEMS */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-6 border-b border-[#E5E5E5] dark:border-[#222]">
                {isKm ? 'ទំនិញក្នុងការបញ្ជាទិញ' : 'ORDER SUMMARY'}
              </h3>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-6 pb-6 border-b border-[#F0F0F0] dark:border-[#222] last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] shrink-0 p-2">
                      {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-contain" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-medium text-[#333] dark:text-[#E5E5E5] text-sm line-clamp-2">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                      <div className="text-[#888] text-xs mt-1 font-mono">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[10px] text-[#999] uppercase tracking-widest mt-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[#333] dark:text-[#E5E5E5] text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMO */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-6 border-b border-[#E5E5E5] dark:border-[#222]">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'PROMO CODE'}</h3>
              <div className="flex gap-0">
                <input type="text" placeholder={isKm ? 'បញ្ចូលលេខកូដ...' : 'ENTER CODE'} value={promoInput} onChange={e => setPromoInput(e.target.value)} disabled={applyingPromo || !!appliedPromo}
                  className="flex-1 px-4 py-3 bg-transparent border border-[#CCC] dark:border-[#444] border-r-0 focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] placeholder-[#999] text-xs font-medium uppercase tracking-widest" />
                {appliedPromo ? (
                  <button onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(''); setPromoError(''); }} className="px-6 py-3 border border-[#333] dark:border-[#E5E5E5] bg-transparent text-[#333] dark:text-[#E5E5E5] text-xs font-medium uppercase tracking-widest hover:opacity-70">
                    {isKm ? 'ដកចេញ' : 'REMOVE'}
                  </button>
                ) : (
                  <button onClick={handleApplyPromo} disabled={applyingPromo || !promoInput.trim()} className="px-6 py-3 border border-[#333] dark:border-[#E5E5E5] bg-[#333] dark:bg-[#E5E5E5] text-[#FAF9F6] dark:text-[#0C0C0C] text-xs font-medium uppercase tracking-widest hover:opacity-80 disabled:opacity-50">
                    {applyingPromo ? '...' : (isKm ? 'អនុវត្ត' : 'APPLY')}
                  </button>
                )}
              </div>
              {promoError && <p className="text-xs text-[#E74C3C] mt-3 uppercase tracking-widest font-medium">{promoError}</p>}
              {appliedPromo && <p className="text-xs text-[#2ECC71] mt-3 uppercase tracking-widest font-medium">{isKm ? `លេខកូដបញ្ចុះតម្លៃ '${appliedPromo}' បានអនុវត្តដោយជោគជ័យ!` : `Promo code '${appliedPromo}' applied successfully!`}</p>}
            </div>

            {/* TOTALS */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <div className="space-y-4 text-xs font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA]">
                <div className="flex justify-between"><span>{text.totalProduct}</span><span className="font-mono text-[#333] dark:text-[#E5E5E5]">${totalProduct.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.discount}</span><span className="font-mono text-[#333] dark:text-[#E5E5E5]">-${discount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.deliveryFee}</span><span className="font-mono text-[#333] dark:text-[#E5E5E5]">${currentDeliveryFee.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-[#E5E5E5] dark:border-[#222]">
                <span className="text-sm font-medium uppercase tracking-widest text-[#333] dark:text-[#E5E5E5]">{text.grandTotal}</span>
                <span className="font-mono text-xl text-[#333] dark:text-[#E5E5E5]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10 mt-8 lg:mt-0 order-2">
            {/* GUEST DETAILS */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-6 border-b border-[#E5E5E5] dark:border-[#222]">{text.guestDetails}</h3>
              {user ? (
                <div className="space-y-6">
                  {user?.addresses && user.addresses.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium uppercase tracking-widest text-[#888] mb-2">{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន' : 'Select Address'}</label>
                      <select className="w-full px-0 py-3 bg-transparent border-b border-[#CCC] dark:border-[#444] focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] text-sm uppercase tracking-widest"
                        onChange={(e) => {
                          const addr = user?.addresses?.find((a: any) => a._id === e.target.value);
                          if (addr) { setGuestName(addr.recipientName); setGuestPhone(addr.phoneNumber); setGuestAddress(addr.addressString); }
                        }}
                        value={user?.addresses?.find((a: any) => a.addressString === guestAddress)?._id || ''}>
                        <option value="" disabled>{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន...' : 'Select an address...'}</option>
                        {user?.addresses?.map((addr: any) => <option key={addr._id} value={addr._id}>{addr.recipientName} - {addr.addressString}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="pb-4 border-b border-[#F0F0F0] dark:border-[#222]">
                    <p className="font-medium text-sm uppercase tracking-widest text-[#333] dark:text-[#E5E5E5]">{guestName}</p>
                    <p className="font-mono text-xs text-[#888] mt-1">{guestPhone}</p>
                    <p className="text-xs text-[#888] mt-3 leading-relaxed uppercase tracking-widest">{guestAddress || (isKm ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន' : 'Please provide a shipping address')}</p>
                  </div>
                  <button onClick={() => { setTempName(user?.name || ''); setTempPhone(user?.phone || ''); setTempProvince(null); setTempDistrict(null); setTempCommune(null); setTempStreet(''); setIsAddressModalOpen(true); }}
                    className="text-xs font-medium uppercase tracking-widest text-[#333] dark:text-[#E5E5E5] underline underline-offset-4 hover:opacity-70 transition-opacity">
                    {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Add New Address'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-[#888] mb-1">{text.fullName}</label>
                    <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-0 py-3 bg-transparent border-b border-[#CCC] dark:border-[#444] focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] placeholder-[#999] text-sm uppercase tracking-widest" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-[#888] mb-1">{text.phoneNumber}</label>
                    <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-0 py-3 bg-transparent border-b border-[#CCC] dark:border-[#444] focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] placeholder-[#999] text-sm uppercase tracking-widest font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-widest text-[#888] mb-1">{text.deliveryAddress}</label>
                    <textarea value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3} className="w-full px-0 py-3 bg-transparent border-b border-[#CCC] dark:border-[#444] focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] placeholder-[#999] text-sm uppercase tracking-widest resize-none" />
                  </div>
                </div>
              )}
            </div>

            {/* DELIVERY OPTIONS */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-6 border-b border-[#E5E5E5] dark:border-[#222]">{text.deliveryPartners}</h3>
              <div className="space-y-4">
                {deliveryOptions.map((partner) => (
                  <label key={partner.id} className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${deliveryPartner === partner.id ? 'border-[#333] dark:border-[#E5E5E5] bg-[#FAF9F6] dark:bg-[#1A1A1A]' : 'border-[#E5E5E5] dark:border-[#222] hover:border-[#CCC] dark:hover:border-[#444]'}`}>
                    <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                    <div className={`w-4 h-4 border flex items-center justify-center rounded-full ${deliveryPartner === partner.id ? 'border-[#333] dark:border-[#E5E5E5]' : 'border-[#CCC] dark:border-[#555]'}`}>
                      {deliveryPartner === partner.id && <div className="w-2 h-2 bg-[#333] dark:bg-[#E5E5E5] rounded-full" />}
                    </div>
                    <img src={partner.logo} alt={partner.name} className="h-8 w-12 object-contain grayscale opacity-80" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium uppercase tracking-widest text-[#333] dark:text-[#E5E5E5] block">{partner.name}</span>
                    </div>
                    <span className="text-xs font-mono text-[#333] dark:text-[#E5E5E5]">
                      {(store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && totalProduct >= store.deliverySettings.freeDeliveryThreshold)
                        ? 'FREE' : `$${partner.fee.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* DELIVERY NOTE */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-4 border-b border-[#E5E5E5] dark:border-[#222]">{text.deliveryNote}</h3>
              <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="w-full px-0 py-3 bg-transparent border-b border-[#CCC] dark:border-[#444] focus:border-[#000] dark:focus:border-[#FFF] focus:outline-none text-[#222] dark:text-[#FFF] placeholder-[#999] text-xs uppercase tracking-widest" />
            </div>

            {/* PAYMENT */}
            <div className="bg-white dark:bg-[#111] border border-[#E5E5E5] dark:border-[#222] p-8">
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#555] dark:text-[#AAA] pb-4 mb-6 border-b border-[#E5E5E5] dark:border-[#222]">{text.paymentMethod}</h3>
              <label className={`flex items-center gap-6 p-6 border cursor-pointer transition-colors ${paymentMethod === 'KHQR' ? 'border-[#333] dark:border-[#E5E5E5] bg-[#FAF9F6] dark:bg-[#1A1A1A]' : 'border-[#E5E5E5] dark:border-[#222] hover:border-[#CCC] dark:hover:border-[#444]'}`}>
                <input type="radio" checked={paymentMethod === 'KHQR'} onChange={() => setPaymentMethod('KHQR')} className="hidden" />
                <div className={`w-4 h-4 border flex items-center justify-center rounded-full ${paymentMethod === 'KHQR' ? 'border-[#333] dark:border-[#E5E5E5]' : 'border-[#CCC] dark:border-[#555]'}`}>
                  {paymentMethod === 'KHQR' && <div className="w-2 h-2 bg-[#333] dark:bg-[#E5E5E5] rounded-full" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm uppercase tracking-widest text-[#333] dark:text-[#E5E5E5]">Bakong KHQR <span className="text-[10px] ml-2 text-[#888]">({text.instantApproval})</span></h4>
                  <p className="text-xs text-[#888] mt-1">{text.bakongPayment}</p>
                </div>
                <img src="/logo/KHQR Logo.png" alt="KHQR" className="h-8 object-contain grayscale opacity-80" />
              </label>
            </div>

            {/* BUTTON */}
            {(store as any)?.plan?.planId?.price === 0 ? (
              <div className="w-full text-center py-6 border border-[#E5E5E5] dark:border-[#222] text-[#888] text-xs font-medium uppercase tracking-widest">
                {text.freePlanMessage}
              </div>
            ) : (
              <button onClick={handleCheckout} disabled={loading || paymentStatus === 'PENDING'} className="w-full py-5 bg-[#333] dark:bg-[#E5E5E5] text-[#FAF9F6] dark:text-[#0C0C0C] text-sm font-medium uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50">
                {loading ? text.processing : text.checkoutBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 4: DEFAULT MODERN RETAIL (Glassmorphism & Soft Radii)
  // -------------------------------------------------------------
  if (themeStyle === 'default') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#111318] font-sans text-gray-900 dark:text-white pb-32">
        {modalsJsx}
        <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors shadow-sm">
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {text.checkout}
            </h1>
          </div>
          <span className="text-sm font-bold bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1 rounded-full shadow-sm text-gray-600 dark:text-gray-300">
            {items.length} {isKm ? 'ទំនិញ' : 'Items'}
          </span>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 mt-6 lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 order-1">
            
            {/* ITEMS CARD */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                {isKm ? 'ទំនិញក្នុងការបញ្ជាទិញ' : 'Order Summary'}
              </h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 py-4 border-b border-gray-100 dark:border-white/10 last:border-0">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 shrink-0 overflow-hidden">
                      {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                      <div className="text-gray-500 dark:text-gray-400 text-xs font-semibold mt-1">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-1">
                          {Object.entries(item.selectedVariants).map(([k, v]) => <span key={k} className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-md">{k}: {v}</span>)}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex items-center">
                      <span className="font-bold text-gray-900 dark:text-white text-base">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMO CODE */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'Promo Code'}</h3>
              <div className="flex gap-3">
                <input type="text" placeholder={isKm ? 'បញ្ចូលលេខកូដ...' : 'Enter code'} value={promoInput} onChange={e => setPromoInput(e.target.value)} disabled={applyingPromo || !!appliedPromo}
                  className="flex-1 w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-gray-200 dark:focus:ring-white/20 focus:outline-none rounded-xl font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                {appliedPromo ? (
                  <button onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(''); setPromoError(''); }} className="px-6 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-xl shadow-sm active:scale-95 transition-all">
                    {isKm ? 'ដកចេញ' : 'Remove'}
                  </button>
                ) : (
                  <button onClick={handleApplyPromo} disabled={applyingPromo || !promoInput.trim()} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50">
                    {applyingPromo ? '...' : (isKm ? 'អនុវត្ត' : 'Apply')}
                  </button>
                )}
              </div>
              {promoError && <p className="text-sm text-red-500 font-medium mt-3 px-2">{promoError}</p>}
              {appliedPromo && <p className="text-sm text-emerald-500 font-medium mt-3 px-2">{isKm ? `លេខកូដបញ្ចុះតម្លៃ '${appliedPromo}' បានអនុវត្តដោយជោគជ័យ!` : `Promo code '${appliedPromo}' applied successfully!`}</p>}
            </div>

            {/* TOTALS */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm">
              <div className="space-y-3 font-medium text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>{text.totalProduct}</span><span className="font-semibold text-gray-900 dark:text-white">${totalProduct.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.discount}</span><span className="font-semibold text-red-500">-${discount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>{text.deliveryFee}</span><span className="font-semibold text-gray-900 dark:text-white">${currentDeliveryFee.toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between items-end pt-5 mt-5 border-t border-gray-100 dark:border-white/10">
                <span className="font-bold text-gray-900 dark:text-white text-lg">{text.grandTotal}</span>
                <span className="font-black text-gray-900 dark:text-white text-3xl" style={{ color: primaryColor || undefined }}>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 mt-8 lg:mt-0 order-2">
            {/* GUEST DETAILS */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{text.guestDetails}</h3>
              {user ? (
                <div className="space-y-5">
                  {user?.addresses && user.addresses.length > 1 && (
                    <div className="mb-2">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន' : 'Select Address'}</label>
                      <select className="w-full px-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none font-medium text-gray-900 dark:text-white"
                        onChange={(e) => {
                          const addr = user?.addresses?.find((a: any) => a._id === e.target.value);
                          if (addr) { setGuestName(addr.recipientName); setGuestPhone(addr.phoneNumber); setGuestAddress(addr.addressString); }
                        }}
                        value={user?.addresses?.find((a: any) => a.addressString === guestAddress)?._id || ''}>
                        <option value="" disabled>{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន...' : 'Select an address...'}</option>
                        {user?.addresses?.map((addr: any) => <option key={addr._id} value={addr._id}>{addr.recipientName} - {addr.addressString}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="p-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
                    <p className="font-bold text-gray-900 dark:text-white text-base">{guestName}</p>
                    <p className="font-medium text-gray-500 mt-1">{guestPhone}</p>
                    <p className="font-medium text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{guestAddress || (isKm ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន' : 'Please provide a shipping address')}</p>
                  </div>
                  <button onClick={() => { setTempName(user?.name || ''); setTempPhone(user?.phone || ''); setTempProvince(null); setTempDistrict(null); setTempCommune(null); setTempStreet(''); setIsAddressModalOpen(true); }}
                    className="w-full py-3.5 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-98">
                    {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Add New Address'}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <input type="text" placeholder={text.fullName} value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                  <input type="tel" placeholder={text.phoneNumber} value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" />
                  <textarea placeholder={text.deliveryAddress} value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400 resize-none" />
                </div>
              )}
            </div>

            {/* DELIVERY OPTIONS */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{text.deliveryPartners}</h3>
              <div className="space-y-4">
                {deliveryOptions.map((partner) => (
                  <label key={partner.id} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${deliveryPartner === partner.id ? 'border-gray-900 dark:border-white bg-gray-50/50 dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent'}`}>
                    <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                    <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-full transition-colors ${deliveryPartner === partner.id ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}>
                      {deliveryPartner === partner.id && <div className="w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full" />}
                    </div>
                    <img src={partner.logo} alt={partner.name} className="h-10 w-16 object-contain bg-white border border-gray-100 rounded-xl p-1.5 shrink-0 shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-gray-900 dark:text-white block">{partner.name}</span>
                      <span className="text-xs font-medium text-gray-500 block mt-0.5">{partner.desc}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                      {(store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && totalProduct >= store.deliverySettings.freeDeliveryThreshold)
                        ? <span className="text-emerald-600 dark:text-emerald-400">FREE</span> : `$${partner.fee.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* DELIVERY NOTE */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{text.deliveryNote}</h3>
              <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="w-full px-4 py-3.5 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" />
            </div>

            {/* PAYMENT */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{text.paymentMethod}</h3>
              <label className={`flex items-center gap-5 p-5 rounded-2xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${paymentMethod === 'KHQR' ? 'border-gray-900 dark:border-white bg-gray-50/50 dark:bg-white/10 ring-1 ring-gray-900 dark:ring-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent'}`}>
                <input type="radio" checked={paymentMethod === 'KHQR'} onChange={() => setPaymentMethod('KHQR')} className="hidden" />
                <div className={`w-5 h-5 border-2 flex items-center justify-center rounded-full transition-colors ${paymentMethod === 'KHQR' ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}>
                  {paymentMethod === 'KHQR' && <div className="w-2.5 h-2.5 bg-gray-900 dark:bg-white rounded-full" />}
                </div>
                <div className="w-12 h-12 bg-red-600 border-4 border-red-100 dark:border-red-900/50 rounded-xl flex items-center justify-center p-2 shadow-sm">
                  <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Bakong KHQR <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-2">{text.instantApproval}</span></h4>
                  <p className="text-xs font-medium text-gray-500 mt-1">{text.bakongPayment}</p>
                </div>
              </label>
            </div>

            {/* BUTTON */}
            {(store as any)?.plan?.planId?.price === 0 ? (
              <div className="w-full bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 p-6 rounded-2xl border border-gray-200 dark:border-white/10 text-center text-sm font-semibold shadow-inner">
                {text.freePlanMessage}
              </div>
            ) : (
              <button onClick={handleCheckout} disabled={loading || paymentStatus === 'PENDING'} className="w-full py-4.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:scale-98 transition-all disabled:opacity-50" style={{ backgroundColor: primaryColor || undefined }}>
                {loading ? text.processing : text.checkoutBtn}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // THEME 1: FASHION EDITORIAL / AURUM (Fallback)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white dark:bg-[#0E1117] font-sans text-gray-900 dark:text-white pb-32">
      {modalsJsx}
      <div className="w-full max-w-5xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.08] mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 -ml-1 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
            {text.checkout}
          </h1>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {items.length} {isKm ? 'ទំនិញ' : 'ITEMS'}
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 lg:grid lg:grid-cols-12 lg:gap-10 items-start">
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 order-1">
          
          {/* ITEMS CARD */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-5 border-b border-gray-100 dark:border-white/[0.08]">
              {isKm ? 'ទំនិញក្នុងការបញ្ជាទិញ' : 'ORDER SUMMARY'}
            </h3>
            <div className="space-y-4 divide-y divide-gray-100 dark:divide-white/[0.04]">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 pt-4 first:pt-0">
                  <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 border border-gray-200 dark:border-white/[0.08] shrink-0 overflow-hidden">
                    {item.imageUrl && <img src={item.imageUrl.replace('/upload/', '/upload/w_200,c_limit,q_auto/')} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1 uppercase tracking-wider">{isKm && item.titleKm ? item.titleKm : item.title}</h4>
                    <div className="text-gray-500 text-xs mt-1">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </div>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                        {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex items-center">
                    <span className="font-extrabold text-gray-900 dark:text-white text-xs">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PROMO CODE */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-4">{isKm ? 'លេខកូដបញ្ចុះតម្លៃ' : 'PROMO CODE'}</h3>
            <div className="flex gap-2">
              <input type="text" placeholder={isKm ? 'បញ្ចូលលេខកូដ...' : 'ENTER CODE'} value={promoInput} onChange={e => setPromoInput(e.target.value)} disabled={applyingPromo || !!appliedPromo}
                className="flex-1 w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white placeholder-gray-400" />
              {appliedPromo ? (
                <button onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(''); setPromoError(''); }} className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest transition-all">
                  {isKm ? 'ដកចេញ' : 'REMOVE'}
                </button>
              ) : (
                <button onClick={handleApplyPromo} disabled={applyingPromo || !promoInput.trim()} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50">
                  {applyingPromo ? '...' : (isKm ? 'អនុវត្ត' : 'APPLY')}
                </button>
              )}
            </div>
            {promoError && <p className="text-xs text-red-500 font-bold mt-2">{promoError}</p>}
            {appliedPromo && <p className="text-xs text-green-600 font-bold mt-2">{isKm ? `លេខកូដបញ្ចុះតម្លៃ '${appliedPromo}' បានអនុវត្តដោយជោគជ័យ!` : `Promo code '${appliedPromo}' applied successfully!`}</p>}
          </div>

          {/* TOTALS */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <div className="space-y-3 font-medium text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between"><span>{text.totalProduct}</span><span className="font-bold text-gray-900 dark:text-white">${totalProduct.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{text.discount}</span><span className="font-bold text-red-500">-${discount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{text.deliveryFee}</span><span className="font-bold text-gray-900 dark:text-white">${currentDeliveryFee.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 dark:border-white/[0.08]">
              <span className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest">{text.grandTotal}</span>
              <span className="font-black text-gray-900 dark:text-white text-lg">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 mt-8 lg:mt-0 order-2">
          {/* GUEST DETAILS */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-5 border-b border-gray-100 dark:border-white/[0.08]">{text.guestDetails}</h3>
            {user ? (
              <div className="space-y-5">
                {user?.addresses && user.addresses.length > 1 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន' : 'Select Address'}</label>
                    <select className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider rounded-none"
                      onChange={(e) => {
                        const addr = user?.addresses?.find((a: any) => a._id === e.target.value);
                        if (addr) { setGuestName(addr.recipientName); setGuestPhone(addr.phoneNumber); setGuestAddress(addr.addressString); }
                      }}
                      value={user?.addresses?.find((a: any) => a.addressString === guestAddress)?._id || ''}>
                      <option value="" disabled>{isKm ? 'ជ្រើសរើសអាសយដ្ឋាន...' : 'Select an address...'}</option>
                      {user?.addresses?.map((addr: any) => <option key={addr._id} value={addr._id}>{addr.recipientName} - {addr.addressString}</option>)}
                    </select>
                  </div>
                )}
                <div className="p-4 bg-stone-50 dark:bg-stone-900/30 border border-gray-200 dark:border-white/[0.08] rounded-none">
                  <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">{guestName}</p>
                  <p className="font-mono text-gray-500 text-xs mt-1">{guestPhone}</p>
                  <p className="font-medium text-gray-600 dark:text-gray-400 text-xs mt-3 leading-relaxed uppercase tracking-wider">{guestAddress || (isKm ? 'សូមបញ្ចូលអាសយដ្ឋានដឹកជញ្ជូន' : 'Please provide a shipping address')}</p>
                </div>
                <button onClick={() => { setTempName(user?.name || ''); setTempPhone(user?.phone || ''); setTempProvince(null); setTempDistrict(null); setTempCommune(null); setTempStreet(''); setIsAddressModalOpen(true); }}
                  className="w-full py-2.5 border border-black dark:border-white text-black dark:text-white text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-none">
                  {isKm ? 'បញ្ចូលអាសយដ្ឋានថ្មី' : 'Add New Address'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">{text.fullName}</label>
                  <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white placeholder-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">{text.phoneNumber}</label>
                  <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white placeholder-gray-400 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">{text.deliveryAddress}</label>
                  <textarea value={guestAddress} onChange={e => setGuestAddress(e.target.value)} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white placeholder-gray-400 resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* DELIVERY OPTIONS */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-5 border-b border-gray-100 dark:border-white/[0.08]">{text.deliveryPartners}</h3>
            <div className="space-y-3">
              {deliveryOptions.map((partner) => (
                <label key={partner.id} className={`flex items-center gap-4 p-4 border rounded-none cursor-pointer transition-all ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-stone-50 dark:bg-white/[0.02]' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent'}`}>
                  <input type="radio" name="delivery" value={partner.id} checked={deliveryPartner === partner.id} onChange={(e) => setDeliveryPartner(e.target.value)} className="hidden" />
                  <div className={`w-4 h-4 border flex items-center justify-center rounded-none ${deliveryPartner === partner.id ? 'border-black dark:border-white bg-black dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                    {deliveryPartner === partner.id && <div className="w-1.5 h-1.5 bg-white dark:bg-black" />}
                  </div>
                  <img src={partner.logo} alt={partner.name} className="h-8 w-12 object-contain bg-white border border-gray-100 p-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white block">{partner.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {(store?.deliverySettings?.isFreeDeliveryEnabled && store?.deliverySettings?.freeDeliveryThreshold > 0 && totalProduct >= store.deliverySettings.freeDeliveryThreshold)
                      ? <span className="text-gray-500 uppercase">FREE</span> : `$${partner.fee.toFixed(2)}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* DELIVERY NOTE */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-4">{text.deliveryNote}</h3>
            <input type="text" placeholder={text.deliveryNotePlaceholder} value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0E1117] border border-gray-200 dark:border-white/10 focus:outline-none focus:border-black dark:focus:border-white rounded-none text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white placeholder-gray-400" />
          </div>

          {/* PAYMENT */}
          <div className="bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] p-6 rounded-none shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white pb-3 mb-5 border-b border-gray-100 dark:border-white/[0.08]">{text.paymentMethod}</h3>
            <label className={`flex items-center gap-4 p-4 border rounded-none cursor-pointer transition-all ${paymentMethod === 'KHQR' ? 'border-black dark:border-white bg-stone-50 dark:bg-white/[0.02]' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-transparent'}`}>
              <input type="radio" checked={paymentMethod === 'KHQR'} onChange={() => setPaymentMethod('KHQR')} className="hidden" />
              <div className={`w-4 h-4 border flex items-center justify-center rounded-none ${paymentMethod === 'KHQR' ? 'border-black dark:border-white bg-black dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                {paymentMethod === 'KHQR' && <div className="w-1.5 h-1.5 bg-white dark:bg-black" />}
              </div>
              <div className="w-10 h-10 bg-red-600 flex items-center justify-center p-1.5 shrink-0">
                <img src="/logo/KHQR Logo.png" alt="KHQR" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">Bakong KHQR <span className="text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 ml-1">{text.instantApproval}</span></h4>
                <p className="text-[11px] font-medium text-gray-500 mt-0.5">{text.bakongPayment}</p>
              </div>
            </label>
          </div>

          {/* BUTTON */}
          {(store as any)?.plan?.planId?.price === 0 ? (
            <div className="w-full text-center py-4 bg-stone-50 dark:bg-stone-900/30 border border-gray-200 dark:border-white/10 text-gray-500 text-xs font-bold uppercase tracking-widest">
              {text.freePlanMessage}
            </div>
          ) : (
            <button onClick={handleCheckout} disabled={loading || paymentStatus === 'PENDING'} className="w-full py-3.5 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all rounded-none disabled:opacity-50" style={{ backgroundColor: primaryColor || undefined }}>
              {loading ? text.processing : text.checkoutBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
