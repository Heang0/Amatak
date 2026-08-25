'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';
import { useCartStore } from '@/lib/store/useCartStore';
import StoreCustomerAuth from '@/components/store/StoreCustomerAuth';
import StoreEditProfileModal from '@/components/store/StoreEditProfileModal';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle, Camera, Edit2, Hash, Link2, Activity, CreditCard, Tag, Percent, MapPin, Calendar, FileText, RefreshCcw, X, Plus, Star, Heart, Bookmark } from 'lucide-react';
import Select from 'react-select';

export default function StoreProfilePage({ params }: { params: { slug: string, locale: string, path?: string[] } }) {
  const user = useCustomerAuthStore((state) => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore((state) => state.setCustomerInfo);
  const logout = useCustomerAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();
  const addItem = useCartStore((state) => state.addItem);

  const isPathRouting = pathname?.includes('/store/');
  const basePath = isPathRouting ? `/${params.locale}/store/${params.slug}` : `/${params.locale}`;

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        productId: item.productId?._id || item.productId,
        title: item.productId?.title || 'Product',
        titleKm: item.productId?.titleKm,
        price: item.price,
        imageUrl: item.productId?.imageUrl,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {}
      });
    });
    router.push(`${basePath}/checkout`);
  };

  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [themeStyle, setThemeStyle] = useState('default');
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'favorites'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);

  // Address Book State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Geo Data & Modal Form State
  const [geoData, setGeoData] = useState<any[]>([]);
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempProvince, setTempProvince] = useState<any>(null);
  const [tempDistrict, setTempDistrict] = useState<any>(null);
  const [tempCommune, setTempCommune] = useState<any>(null);
  const [tempStreet, setTempStreet] = useState('');

  useEffect(() => {
    fetch('/data/cambodia_geo.json')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const fetchStoreAndOrders = async () => {
      try {
        // 1. Always Fetch Store Details for Branding
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`);
        if (!storeRes.ok) throw new Error('Store not found');
        const storeData = await storeRes.json();
        setStoreId(storeData._id);
        setPrimaryColor(storeData.branding?.primaryColor || '#000000');
        setThemeStyle(storeData.branding?.themeStyle || 'default');

        // 2. Fetch Customer Orders if Logged In
        if (user) {
          const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/customer`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            // 3. Filter orders specifically for THIS store
            const storeOrders = ordersData.filter((order: any) =>
              order.storeId && order.storeId._id === storeData._id
            );
            setOrders(storeOrders);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreAndOrders();
  }, [params.slug, user]);

  // Sync selected order with URL Path
  useEffect(() => {
    const isOrderHistoryRoute = params.path?.[0] === 'order-history';
    const orderIdFromPath = isOrderHistoryRoute ? params.path?.[1] : null;

    if (orderIdFromPath && orders.length > 0) {
      const targetOrder = orders.find(o => o._id === orderIdFromPath);
      if (targetOrder) {
        setSelectedOrder(targetOrder);
      }
    } else if (!orderIdFromPath) {
      setSelectedOrder(null);
    }
  }, [params.path, orders]);

  const handleSelectOrder = (order: any) => {
    router.push(`${basePath}/profile/order-history/${order._id}`);
  };

  const handleBackToOrders = () => {
    router.push(`${basePath}/profile`);
  };

  const handleLogout = () => {
    logout();
    window.location.href = `/${params.locale}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Upload image
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload?type=profile`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || 'Upload failed');

      // Update profile
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ profilePic: uploadData.url })
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.message || 'Profile update failed');

      setCustomerInfo({ ...user, profilePic: profileData.profilePic });
    } catch (err) {
      console.error(err);
      alert(params.locale === 'km' ? 'បរាជ័យក្នុងការបញ្ចូលរូបភាព' : 'Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(params.locale === 'km' ? 'តើអ្នកពិតជាចង់លុបអាសយដ្ឋាននេះមែនទេ?' : 'Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      const updatedAddresses = await res.json();
      setCustomerInfo({ ...user!, addresses: updatedAddresses });
    } catch (err) {
      console.error(err);
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/addresses/${id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error('Failed to set default');
      const updatedAddresses = await res.json();
      setCustomerInfo({ ...user!, addresses: updatedAddresses });
    } catch (err) {
      console.error(err);
      alert('Failed to set default address');
    }
  };

  const handleSaveModalAddress = async () => {
    if (!tempName || !tempPhone || !tempProvince || !tempDistrict || !tempCommune || !tempStreet) {
      alert(params.locale === 'km' ? 'សូមបំពេញព័ត៌មានឲ្យបានគ្រប់គ្រាន់' : 'Please fill all required fields');
      return;
    }
    setIsSavingAddress(true);
    
    const addressString = `${tempStreet}, ${tempCommune.label}, ${tempDistrict.label}, ${tempProvince.label}`;
    
    try {
      const endpoint = editingAddressId 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/addresses/${editingAddressId}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/addresses`;
        
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}` 
        },
        body: JSON.stringify({
          recipientName: tempName,
          phoneNumber: tempPhone,
          addressString
        })
      });

      if (!res.ok) throw new Error('Failed to save address');
      const updatedAddresses = await res.json();
      
      setCustomerInfo({ ...user!, addresses: updatedAddresses });
      setIsAddressModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (addr: any) => {
    setEditingAddressId(addr._id);
    setTempName(addr.recipientName || '');
    setTempPhone(addr.phoneNumber || '');
    
    // Attempt to reverse-map the addressString
    // Format: Street, Commune, District, Province
    if (addr.addressString) {
      const parts = addr.addressString.split(',').map((p: string) => p.trim());
      if (parts.length >= 4) {
        setTempStreet(parts.slice(0, parts.length - 3).join(', '));
        const cLabel = parts[parts.length - 3];
        const dLabel = parts[parts.length - 2];
        const pLabel = parts[parts.length - 1];
        
        const pMatch = geoData.find(p => (params.locale === 'km' ? p.name_km : p.name_en) === pLabel);
        if (pMatch) {
          setTempProvince({ value: pMatch.code, label: pLabel });
          const dMatch = pMatch.districts?.find((d: any) => (params.locale === 'km' ? d.name_km : d.name_en) === dLabel);
          if (dMatch) {
            setTempDistrict({ value: dMatch.code, label: dLabel });
            const cMatch = dMatch.communes?.find((c: any) => (params.locale === 'km' ? c.name_km : c.name_en) === cLabel);
            if (cMatch) {
              setTempCommune({ value: cMatch.code, label: cLabel });
            }
          }
        }
      } else {
        setTempStreet(addr.addressString);
      }
    }
    
    setIsAddressModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'SHIPPED': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'PROCESSING': return <Package className="w-5 h-5 text-purple-500" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30';
      case 'SHIPPED': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30';
      case 'PROCESSING': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30';
      case 'CANCELLED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800/30';
      default: return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30';
    }
  };

  const getStatusText = (status: string) => {
    if (params.locale !== 'km') return status;
    switch (status) {
      case 'PENDING': return 'រង់ចាំ';
      case 'PROCESSING': return 'កំពុងរៀបចំ';
      case 'SHIPPED': return 'កំពុងដឹកជញ្ជូន';
      case 'DELIVERED': return 'បានដឹកជញ្ជូន';
      case 'CANCELLED': return 'បានលុបចោល';
      case 'FAILED': return 'បរាជ័យ';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <StoreCustomerAuth
          primaryColor={primaryColor}
          themeStyle={themeStyle}
          isKm={params.locale === 'km'}
        />
      </div>
    );
  }

  const cardClass = themeStyle === 'neo-brutalism'
    ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-5 rounded-none'
    : 'bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 shadow-2xs p-5 rounded-none transition-colors';

  const avatarClass = 'w-20 h-20 bg-stone-100 dark:bg-stone-900 rounded-none flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white shrink-0 overflow-hidden border border-gray-200 dark:border-white/[0.08] relative group cursor-pointer';

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-10 space-y-8 pb-32">
      {/* Profile Header */}
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8 border-b ${themeStyle === 'neo-brutalism' ? 'border-black dark:border-white border-b-[3px]' : 'border-gray-200 dark:border-white/[0.08]'}`}>
        <div className="flex items-center gap-5">
          <label className="relative cursor-pointer group block w-fit">
            <div className={avatarClass}>
              {user.profilePic ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
              ) : (
                user.name?.charAt(0).toUpperCase() || 'U'
              )}

              {/* Loading Overlay */}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <div className="animate-spin rounded-none h-5 w-5 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>

            {/* Persistent Camera Badge */}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-none flex items-center justify-center bg-white dark:bg-black shadow-xs border border-gray-200 dark:border-white/20 z-20 transition-transform group-hover:scale-110">
              <Camera className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
            </div>

            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          </label>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-gray-900 dark:text-white">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 mb-2">{user.email}</p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest w-fit px-3.5 py-1.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-none"
            >
              <Edit2 size={13} />
              {params.locale === 'km' ? 'កែប្រែគណនី' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-xs font-bold uppercase tracking-widest transition-all w-full md:w-auto justify-center rounded-none border border-red-200 dark:border-red-900/30"
        >
          <LogOut size={16} />
          {params.locale === 'km' ? 'ចាកចេញ' : 'Sign Out'}
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-6 border-b border-gray-200 dark:border-white/[0.08] mb-8 text-xs font-bold ${params.locale === 'km' ? 'tracking-normal' : 'uppercase tracking-widest'}`}>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-colors border-b-2 ${activeTab === 'orders'
              ? 'border-black dark:border-white text-black dark:text-white font-extrabold'
              : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
            }`}
        >
          {params.locale === 'km' ? 'ប្រវត្តិការបញ្ជាទិញ' : 'Order History'}
        </button>
        <button
          onClick={() => setActiveTab('address')}
          className={`pb-3 transition-colors border-b-2 ${activeTab === 'address'
              ? 'border-black dark:border-white text-black dark:text-white font-extrabold'
              : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
            }`}
        >
          {params.locale === 'km' ? 'អាសយដ្ឋាន' : 'Address'}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 transition-colors border-b-2 ${activeTab === 'favorites'
              ? 'border-black dark:border-white text-black dark:text-white font-extrabold'
              : 'border-transparent text-gray-400 hover:text-black dark:hover:text-white'
            }`}
        >
          {params.locale === 'km' ? 'សំណព្វ' : 'Favorites'}
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div>

          {orders.length === 0 ? (
            <div className={`text-center py-16 ${themeStyle === 'neo-brutalism'
                ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]'
                : 'bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-900'
              }`}>
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{params.locale === 'km' ? 'មិនមានការបញ្ជាទិញនៅឡើយទេ' : 'No Orders Yet'}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{params.locale === 'km' ? 'អ្នកមិនទាន់បានបញ្ជាទិញអ្វីនៅហាងនេះទេ' : "You haven't placed any orders at this store."}</p>
              <Link
                href={`/${params.locale}`}
                className={`inline-block font-bold px-8 py-3 transition-all ${themeStyle === 'neo-brutalism'
                    ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black bg-white dark:bg-black dark:text-white'
                    : 'text-white rounded-full hover:scale-105 shadow-md'
                  }`}
                style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
              >
                {params.locale === 'km' ? 'ចាប់ផ្តើមទិញទំនិញ' : 'Start Shopping'}
              </Link>
            </div>
          ) : (
            selectedOrder ? (
              <div className={`p-6 md:p-8 ${themeStyle === 'neo-brutalism'
                  ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800'
                }`}>

                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-8">
                  <button
                    onClick={handleBackToOrders}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-white transition-all shrink-0 ${themeStyle === 'neo-brutalism'
                        ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                        : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    style={{ backgroundColor: primaryColor || '#000' }}
                  >
                    ← <span className="hidden min-[380px]:inline">{params.locale === 'km' ? 'ត្រលប់ក្រោយ' : 'Back'}</span>
                  </button>

                  <div className="flex gap-2 sm:gap-4 shrink-0">
                    {selectedOrder.paymentStatus === 'PENDING' ? (
                      selectedOrder.qrString && (
                        <button
                          onClick={() => setShowPayModal(true)}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-white transition-all ${themeStyle === 'neo-brutalism'
                              ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-blue-600'
                              : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] bg-blue-600'
                            }`}
                        >
                          <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                          {params.locale === 'km' ? 'បង់ប្រាក់ឥឡូវនេះ' : 'Pay Now'}
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleReorder(selectedOrder)}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 text-sm font-bold text-white transition-all ${themeStyle === 'neo-brutalism'
                            ? 'border-[2px] border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-green-600'
                            : 'rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] bg-green-600'
                          }`}
                      >
                        <RefreshCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                        {params.locale === 'km' ? 'បញ្ជាទិញម្តងទៀត' : 'Order Again'}
                      </button>
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {params.locale === 'km' ? 'ព័ត៌មានការបញ្ជាទិញ' : 'Order Information'}
                </h2>

                <div className="flex flex-col space-y-4 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Hash size={14} />{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ' : 'Transaction ID'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white font-mono text-right break-all max-w-[60%]">{selectedOrder._id.substring(0, 10).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Link2 size={14} />{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ ABA/Bakong' : 'Bakong Transaction ID'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white font-mono text-right break-all max-w-[60%]">{selectedOrder.bakongMd5 ? selectedOrder.bakongMd5.substring(0, 10).toUpperCase() : 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Activity size={14} />{params.locale === 'km' ? 'ស្ថានភាព' : 'Status'}</p>
                    <p className={`font-bold text-right ${selectedOrder.orderStatus === 'FAILED' ? 'text-red-500' : 'text-green-500'}`}>{getStatusText(selectedOrder.orderStatus)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><CreditCard size={14} />{params.locale === 'km' ? 'វិធីបង់ប្រាក់' : 'Payment Method'}</p>
                    <div className="flex items-center justify-end">
                      {selectedOrder.paymentMethod === 'bakong_app' ? (
                        <span className="font-semibold text-gray-900 dark:text-white">Bakong App</span>
                      ) : selectedOrder.paymentMethod === 'CASH' ? (
                        <span className="font-semibold text-gray-900 dark:text-white">Cash</span>
                      ) : (
                        <span className="flex items-center justify-center bg-[#E1232E] w-8 h-[18px] rounded px-1 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/logo/KHQR Logo.png" alt="KHQR" className="h-[10px] w-auto object-contain brightness-0 invert" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Tag size={14} />{params.locale === 'km' ? 'តម្លៃផលិតផល' : 'Product Price'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-right">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Percent size={14} />{params.locale === 'km' ? 'បញ្ចុះតម្លៃ' : 'Discount'}</p>
                    <p className="font-semibold text-red-500 text-right">-${selectedOrder.discountApplied?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Truck size={14} />{params.locale === 'km' ? 'ថ្លៃដឹកជញ្ជូន' : 'Delivery Fee'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-right">${selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-gray-50 dark:border-gray-800/50">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><CreditCard size={14} />{params.locale === 'km' ? 'តម្លៃសរុបទាំងអស់' : 'Grand Total'}</p>
                    <p className="font-bold text-xl text-gray-900 dark:text-white text-right">${selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><FileText size={14} />{params.locale === 'km' ? 'ចំណាំ' : 'Note'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{selectedOrder.deliveryNote || '-'}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><MapPin size={14} />{params.locale === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Delivery Address'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%] line-clamp-3">{selectedOrder.guestInfo?.address || 'N/A'}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 shrink-0"><Calendar size={14} />{params.locale === 'km' ? 'បានបង្កើតនៅថ្ងៃ' : 'Created At'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-right">
                      {new Date(selectedOrder.createdAt).toLocaleDateString(params.locale === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {params.locale === 'km' ? 'ផលិតផល' : 'Products'}
                </h3>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-800 text-sm text-gray-500">
                        <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'ល.រ' : 'N.O'}</th>
                        <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'រូបភាព' : 'Image'}</th>
                        <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'ផលិតផល' : 'Product'}</th>
                        <th className="py-3 px-4 font-medium">{params.locale === 'km' ? 'តម្លៃឯកតា' : 'Unit Price'}</th>
                        <th className="py-3 px-4 font-medium text-center">{params.locale === 'km' ? 'បរិមាណ' : 'Quantity'}</th>
                        <th className="py-3 px-4 font-medium text-right">{params.locale === 'km' ? 'តម្លៃ' : 'Price'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(selectedOrder.items.reduce((acc: any, item: any) => {
                        const id = item.productId?._id || item.productId;
                        if (!acc[id]) acc[id] = { ...item };
                        else acc[id].quantity += item.quantity;
                        return acc;
                      }, {})).map((item: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{idx + 1}</td>
                          <td className="py-4 px-4">
                            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                              {item.productId?.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.productId.imageUrl} alt="Product" className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {params.locale === 'km' && item.productId?.titleKm ? item.productId.titleKm : item.productId?.title || 'Unknown Product'}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">${item.price?.toFixed(2)}</td>
                          <td className="py-4 px-4 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <td colSpan={3} className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                          {params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}
                        </td>
                        <td className="py-4 px-4 font-bold">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</td>
                        <td className="py-4 px-4 text-center font-bold">
                          {selectedOrder.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-black dark:text-white">
                          ${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {Object.values(selectedOrder.items.reduce((acc: any, item: any) => {
                    const id = item.productId?._id || item.productId;
                    if (!acc[id]) acc[id] = { ...item };
                    else acc[id].quantity += item.quantity;
                    return acc;
                  }, {})).map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 border border-gray-200 dark:border-white/[0.08] rounded-none bg-white dark:bg-[#13161F]">
                      <div className="w-16 h-16 shrink-0 bg-stone-100 dark:bg-stone-900 rounded-none overflow-hidden border border-gray-200 dark:border-white/[0.08]">
                        {item.productId?.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.productId.imageUrl} alt="Product" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                          {params.locale === 'km' && item.productId?.titleKm ? item.productId.titleKm : item.productId?.title || 'Unknown Product'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-gray-500">${item.price?.toFixed(2)} <span className="text-xs">x</span> <span className="font-bold text-gray-900 dark:text-white">{item.quantity}</span></p>
                          <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-[#1A1D27] rounded-none mt-4">
                    <span className="font-bold text-gray-900 dark:text-white">{params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`overflow-x-auto ${themeStyle === 'neo-brutalism'
                  ? 'bg-white dark:bg-[#111111] border-[3px] border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-[#13161F] rounded-none shadow-2xs border border-gray-200 dark:border-white/[0.08]'
                }`}>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'ល.រ' : 'N.O'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'លេខសម្គាល់ប្រតិបត្តិការ' : 'Transaction ID'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'សរុបរង' : 'Subtotal'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'វិធីបង់ប្រាក់' : 'Payment Method'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'អាសយដ្ឋាន' : 'Address'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'បានបង្កើតនៅថ្ងៃ' : 'Created At'}</th>
                        <th className="py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{params.locale === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={`${order._id}-${index}`} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                          <td className="py-4 px-4 text-sm text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline" onClick={() => handleSelectOrder(order)}>
                            {order._id.substring(0, 10).toUpperCase()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">${order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</td>
                          <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                            {order.paymentMethod === 'bakong_app' ? 'Bakong App' : 
                             order.paymentMethod === 'CASH' ? 'Cash' : 
                             <span className="flex items-center">
                               <span className="flex items-center justify-center bg-[#E1232E] w-8 h-[18px] rounded px-1 shadow-sm">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img src="/logo/KHQR Logo.png" alt="KHQR" className="h-[10px] w-auto object-contain brightness-0 invert" />
                               </span>
                             </span>}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${order.orderStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                                order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                              }`}>
                              {getStatusText(order.orderStatus)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-[150px]" title={order.guestInfo?.address}>
                            {order.guestInfo?.address || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString(params.locale === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <button
                              onClick={() => handleSelectOrder(order)}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {orders.map((order, index) => (
                    <div key={`${order._id}-${index}`} className="bg-white dark:bg-[#1a1a1a] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => handleSelectOrder(order)}>
                            {order._id.substring(0, 10).toUpperCase()}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${order.orderStatus === 'FAILED' ? 'bg-red-100 text-red-700' :
                            order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                          }`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{params.locale === 'km' ? 'បានបង្កើតនៅថ្ងៃ' : 'Date'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(order.createdAt).toLocaleDateString(params.locale === 'km' ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{params.locale === 'km' ? 'តម្លៃសរុប' : 'Total'}</p>
                          <p className="font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectOrder(order)}
                        className={`w-full py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors rounded-none ${themeStyle === 'neo-brutalism'
                            ? 'border-[2px] border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] bg-gray-50 dark:bg-black text-black dark:text-white'
                            : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 text-gray-900 dark:text-white'
                          }`}
                      >
                        {params.locale === 'km' ? 'មើលព័ត៌មានលម្អិត' : 'View Details'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      ) : activeTab === 'address' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[44px]">
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white leading-snug">
              {params.locale === 'km' ? 'អាសយដ្ឋាន' : 'SAVED ADDRESSES'}
            </h2>
            <button
              onClick={() => {
                setEditingAddressId(null);
                setTempName(user?.name || '');
                setTempPhone(user?.phone || '');
                setTempProvince(null);
                setTempDistrict(null);
                setTempCommune(null);
                setTempStreet('');
                setIsAddressModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-none bg-black text-white dark:bg-white dark:text-black hover:opacity-85 shadow-xs"
            >
              <Plus size={14} />
              {params.locale === 'km' ? 'បន្ថែមអាសយដ្ឋាន' : 'Add Address'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {user?.addresses && user.addresses.length > 0 ? user.addresses.map((addr: any, idx: number) => (
              <div key={`${addr._id}-${idx}`} className={`p-5 relative rounded-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#13161F] shadow-2xs ${addr.isDefault ? 'ring-1 ring-black dark:ring-white' : ''}`}>
                
                {addr.isDefault && (
                  <div className="absolute top-4 right-4 text-black dark:text-white">
                    <Star size={16} fill="currentColor" />
                  </div>
                )}

                <p className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2 uppercase tracking-wide">
                  {addr.recipientName}
                  {addr.isDefault && <span className="text-[9px] bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 rounded-none uppercase tracking-wider font-bold">Default</span>}
                </p>
                <p className="text-xs text-gray-500 font-mono mt-1">{addr.phoneNumber}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{addr.addressString}</p>

                <div className="flex gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] text-xs font-bold uppercase tracking-wider">
                  <button 
                    onClick={() => handleEditAddress(addr)} 
                    className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {params.locale === 'km' ? 'កែប្រែ' : 'Edit'}
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr._id)} 
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    {params.locale === 'km' ? 'លុប' : 'Delete'}
                  </button>
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefaultAddress(addr._id)} 
                      className="text-black dark:text-white hover:underline transition-all"
                    >
                      {params.locale === 'km' ? 'កំណត់ជាលំនាំដើម' : 'Set as Default'}
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-[#13161F] rounded-none border border-gray-200 dark:border-white/[0.08]">
                <MapPin className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">
                  {params.locale === 'km' ? 'អ្នកមិនទាន់មានអាសយដ្ឋានណាមួយនៅឡើយទេ។' : 'You do not have any saved addresses yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'favorites' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[44px]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
              {params.locale === 'km' ? 'សំណព្វ / Favorites' : 'Favorites'}
            </h2>
          </div>

          {!user?.favorites || user.favorites.length === 0 ? (
            <div className="text-center py-16 border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#13161F] rounded-none">
              <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{params.locale === 'km' ? 'មិនមានសំណព្វនៅឡើយទេ' : 'No Favorites Yet'}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">{params.locale === 'km' ? 'អ្នកមិនទាន់បានរក្សាទុកផលិតផលណាមួយជាសំណព្វទេ' : "You haven't saved any products to your favorites yet."}</p>
              <Link
                href={`/${params.locale}/store/${params.slug}`}
                className={`inline-block font-bold px-6 py-2.5 text-xs uppercase tracking-widest transition-all rounded-none ${themeStyle === 'neo-brutalism'
                    ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-black bg-white dark:bg-black dark:text-white'
                    : 'text-white bg-black dark:bg-white dark:text-black hover:opacity-80 shadow-xs'
                  }`}
              >
                {params.locale === 'km' ? 'ស្វែងរកផលិតផល' : 'Browse Products'}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {user.favorites.map((product: any, idx: number) => {
                // Determine if the product belongs to the current store
                const isCurrentStore = typeof product.storeId === 'object' 
                  ? product.storeId.slug === params.slug 
                  : product.storeId === storeId;

                const storeSlug = typeof product.storeId === 'object' ? product.storeId.slug : params.slug;

                return (
                  <div key={`${product._id}-${idx}`} className="relative group">
                    <Link href={isCurrentStore ? `/${params.locale}/product/${product.slug || product._id}` : `/${params.locale}/store/${storeSlug}/product/${product.slug || product._id}`} className="block bg-white dark:bg-[#13161F] rounded-none overflow-hidden transition-all border border-gray-200 dark:border-white/[0.08] shadow-2xs">
                      <div className="aspect-square bg-stone-100 dark:bg-stone-900 rounded-none relative">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                        {!isCurrentStore && (
                          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-none">
                            {typeof product.storeId === 'object' ? product.storeId.name : 'Other Store'}
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className={`font-bold text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1 mb-1 ${params.locale === 'km' ? 'tracking-normal' : 'uppercase tracking-wider'}`}>
                          {product.title}
                        </h3>
                        <p className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-sm">
                          ${product.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}      <StoreEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        primaryColor={primaryColor}
        themeStyle={themeStyle}
        isKm={params.locale === 'km'}
      />

      {isAddressModalOpen && typeof window !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs ${params.locale === 'km' ? 'font-khmer' : ''}`}>
          <div className="w-full max-w-lg bg-white dark:bg-[#111318] max-h-[90vh] flex flex-col rounded-none border border-gray-200 dark:border-white/[0.1] shadow-2xl relative">

            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {params.locale === 'km' ? 'អាសយដ្ឋានដឹកជញ្ជូន' : 'Shipping Address'}
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'ឈ្មោះពេញ / Full Name' : 'Full Name'}</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border focus:outline-none transition-colors ${themeStyle === 'neo-brutalism'
                      ? 'border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]'
                      : 'rounded-xl border-gray-200 dark:border-gray-800 focus:border-gray-400'
                    }`}
                  placeholder={params.locale === 'km' ? 'បញ្ចូលឈ្មោះរបស់អ្នក' : 'Enter your name'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'លេខទូរស័ព្ទ / Phone Number' : 'Phone Number'}</label>
                <input
                  type="tel"
                  value={tempPhone}
                  onChange={e => setTempPhone(e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border focus:outline-none transition-colors ${themeStyle === 'neo-brutalism'
                      ? 'border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]'
                      : 'rounded-xl border-gray-200 dark:border-gray-800 focus:border-gray-400'
                    }`}
                  placeholder="012 345 678"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'ខេត្ត ក្រុង / Province' : 'Province'}</label>
                <Select
                  options={geoData.map(p => ({ value: p.code, label: params.locale === 'km' ? p.name_km : p.name_en }))}
                  value={tempProvince}
                  onChange={(val) => {
                    setTempProvince(val);
                    setTempDistrict(null);
                    setTempCommune(null);
                  }}
                  placeholder={params.locale === 'km' ? 'ជ្រើសរើសខេត្ត ក្រុង' : 'Select Province'}
                  className="text-sm text-black"
                />
              </div>

              {tempProvince && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'ស្រុក ខណ្ឌ / District' : 'District'}</label>
                  <Select
                    options={geoData.find(p => p.code === tempProvince.value)?.districts.map((d: any) => ({ value: d.code, label: params.locale === 'km' ? d.name_km : d.name_en })) || []}
                    value={tempDistrict}
                    onChange={(val) => {
                      setTempDistrict(val);
                      setTempCommune(null);
                    }}
                    placeholder={params.locale === 'km' ? 'ជ្រើសរើសស្រុក ខណ្ឌ' : 'Select District'}
                    className="text-sm text-black"
                  />
                </div>
              )}

              {tempDistrict && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'ឃុំ សង្កាត់ / Commune' : 'Commune'}</label>
                  <Select
                    options={geoData.find(p => p.code === tempProvince.value)?.districts.find((d: any) => d.code === tempDistrict.value)?.communes.map((c: any) => ({ value: c.code, label: params.locale === 'km' ? c.name_km : c.name_en })) || []}
                    value={tempCommune}
                    onChange={setTempCommune}
                    placeholder={params.locale === 'km' ? 'ជ្រើសរើសឃុំ សង្កាត់' : 'Select Commune'}
                    className="text-sm text-black"
                  />
                </div>
              )}

              {tempCommune && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-300 mb-1.5">{params.locale === 'km' ? 'លេខផ្ទះ ផ្លូវ / House No, Street' : 'House No, Street'}</label>
                  <input
                    type="text"
                    value={tempStreet}
                    onChange={e => setTempStreet(e.target.value)}
                    placeholder={params.locale === 'km' ? 'ឧ. ផ្ទះលេខ 12, ផ្លូវ 123' : 'Ex. House 12, Street 123'}
                    className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border focus:outline-none transition-colors ${themeStyle === 'neo-brutalism'
                        ? 'border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]'
                        : 'rounded-xl border-gray-200 dark:border-gray-800 focus:border-gray-400'
                      }`}
                  />
                </div>
              )}

              <button
                onClick={handleSaveModalAddress}
                disabled={isSavingAddress || !tempName || !tempPhone || !tempProvince || !tempDistrict || !tempCommune || !tempStreet}
                className={`w-full py-3.5 px-4 font-bold text-center transition-all mt-4 ${themeStyle === 'neo-brutalism'
                    ? 'border-[2px] border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black bg-[#f0f0f0]'
                    : 'rounded-xl text-white hover:opacity-90 active:scale-[0.98]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={themeStyle !== 'neo-brutalism' ? { backgroundColor: primaryColor || '#000' } : undefined}
              >
                {isSavingAddress ? (params.locale === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...') : (params.locale === 'km' ? 'បញ្ជាក់អាសយដ្ឋាន' : 'Confirm Address')}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('app-root') || document.body
      )}
    </div>
  );
}
