'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useTranslations, useLocale } from 'next-intl';
import BakongKHQRModal from '@/components/payment/BakongKHQRModal';

interface Plan {
  _id: string;
  name: string;
  nameKm?: string;
  price: number;
}

export default function UpgradePlan() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations('AdminUpgrade');
  const locale = useLocale();
  const isKm = locale === 'km';
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [storeId, setStoreId] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [currentStorePlan, setCurrentStorePlan] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{ qrString: string; md5: string; paymentId: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'FAILED'>('PENDING');

  useEffect(() => {
    // Restore pending QR session
    const savedQR = sessionStorage.getItem('pendingUpgradeQR');
    const savedPlanId = sessionStorage.getItem('pendingUpgradePlanId');
    if (savedQR && savedPlanId) {
      try {
        const data = JSON.parse(savedQR);
        if (Date.now() - data.timestamp < 300000) { // 5 mins validity
          setQrData(data);
          setSelectedPlanId(savedPlanId);
          setPaymentStatus('PENDING');
          pollPaymentStatus(data.paymentId, data.md5);
        } else {
          sessionStorage.removeItem('pendingUpgradeQR');
          sessionStorage.removeItem('pendingUpgradePlanId');
        }
      } catch (e) {}
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/plans`);
      const plansData = await plansRes.json();
      setPlans(plansData);

      // Fetch user's store
      const storesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const storesData = await storesRes.json();
      // find store belonging to this user
      const myStore = storesData.find((s: any) => s.ownerId._id === user?._id || s.ownerId === user?._id);
      if (myStore) {
        setStoreId(myStore._id);
        setStoreData(myStore);
        setCurrentStorePlan(myStore.plan);
        let foundPlanId = null;
        if (myStore.plan && myStore.plan.planId) {
          foundPlanId = myStore.plan.planId._id || myStore.plan.planId;
        } else {
          const freePlan = plansData.find((p: any) => p.name === 'Free');
          if (freePlan) foundPlanId = freePlan._id;
        }
        setCurrentPlanId(foundPlanId);
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!storeId) {
      alert(t('setup_store_first'));
      return;
    }

    const selected = plans.find(p => p._id === planId);
    if (selected && selected.price === 0) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/subscription/free-plan`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ planId }),
        });
        if (res.ok) {
          alert('Successfully activated Free Plan!');
          window.location.reload();
        } else {
          alert('Failed to activate Free Plan');
        }
      } catch (err) {
        console.error(err);
        alert('Network error');
      }
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/subscription/generate-qr`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ planId, storeId, billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQrData(data);
      setSelectedPlanId(planId);
      setPaymentStatus('PENDING');
      sessionStorage.setItem('pendingUpgradeQR', JSON.stringify({ ...data, timestamp: Date.now() }));
      sessionStorage.setItem('pendingUpgradePlanId', planId);
      
      // Start polling
      pollPaymentStatus(data.paymentId, data.md5);
    } catch (err) {
      console.error(err);
      alert('Error generating QR code');
    }
  };

  const pollIntervalRef = useRef<any>(null);

  const clearPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollPaymentStatus = (paymentId: string, md5: string) => {
    clearPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/subscription/verify`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ paymentId, md5 }),
        });

        const data = await res.json();
        
        if (data.status === 'PAID') {
          setPaymentStatus('PAID');
          sessionStorage.removeItem('pendingUpgradeQR');
          sessionStorage.removeItem('pendingUpgradePlanId');
          if (data.store) {
            setCurrentPlanId(data.store.plan?.planId);
          }
          clearPolling();
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 3000); // poll every 3 seconds

    // Clear after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearPolling();
      if (paymentStatus === 'PENDING') {
        setPaymentStatus('FAILED'); // Or timeout
        sessionStorage.removeItem('pendingUpgradeQR');
        sessionStorage.removeItem('pendingUpgradePlanId');
      }
    }, 300000); 
  };

  const handleSimulatePay = async () => {
    if (!qrData?.paymentId) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/subscription/simulate-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: qrData.paymentId }),
      });
      // The polling loop will automatically pick up the PAID status on its next tick!
    } catch (err) {
      console.error(err);
    }
  };

  const getDisplayPrice = (plan: any) => {
    if (!plan || typeof plan.price !== 'number') return 0;
    if (plan.price === 0) return 0;
    if (billingCycle === 'annually') {
      const discount = plan.name === 'Premium' ? 0.7 : (plan.name === 'Pro' ? 0.8 : 1);
      return Number((plan.price * 12 * discount).toFixed(2));
    }
    return plan.price;
  };

  const getOriginalPrice = (plan: any) => {
    if (!plan || typeof plan.price !== 'number' || plan.price === 0 || billingCycle === 'monthly') return null;
    return Number((plan.price * 12).toFixed(2));
  };

  const isExpired = () => {
    if (!currentStorePlan || !currentStorePlan.expiresAt) return false;
    return new Date(currentStorePlan.expiresAt) < new Date();
  };

  const getPresetBenefits = (plan: any) => {
    const benefits = [isKm ? 'ចូលប្រើមុខងារមូលដ្ឋានទាំងអស់' : 'Access to all basic features'];
    if (!plan) return benefits;
    
    if (plan.maxProducts) {
      benefits.push(isKm ? `ទំនិញរហូតដល់ ${plan.maxProducts}` : `Up to ${plan.maxProducts} Products`);
    }
    if (plan.maxOrders) {
      benefits.push(isKm ? `ការបញ្ជាទិញរហូតដល់ ${plan.maxOrders}/ខែ` : `Up to ${plan.maxOrders} Orders/month`);
    }
    if (plan.hasAnalytics) {
      benefits.push(isKm ? 'របាយការណ៍វិភាគកម្រិតខ្ពស់' : 'Advanced Analytics');
    }
    if (plan.hasPrioritySupport) {
      benefits.push(isKm ? 'ការគាំទ្រអាទិភាព ២៤/៧' : '24/7 Priority Support');
    }
    if (plan.price > 0) {
      benefits.push(isKm ? 'អតិថិជនអាចទូទាត់តាម KHQR' : 'Accept Customer KHQR Payments');
    }
    return benefits;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your subscription plan</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-gray-100 dark:bg-[#1E1E1E] p-1 rounded-xl shrink-0 border border-gray-200/50 dark:border-white/10">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              billingCycle === 'monthly' 
                ? 'bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {isKm ? 'ប្រចាំខែ' : 'Monthly'}
          </button>
          <button 
            onClick={() => setBillingCycle('annually')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'annually' 
                ? 'bg-white dark:bg-[#2C2C2C] text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {isKm ? 'ប្រចាំឆ្នាំ' : 'Annually'}
            <span className="bg-[#E84C3D]/10 dark:bg-[#E84C3D]/25 text-[#E84C3D] dark:text-[#ff6b5d] text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider">
              Save 30%
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
      ) : (
        <>
          {/* Current Subscription Overview */}
          {storeData && currentStorePlan && (
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl p-6 sm:p-7 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  {isKm ? 'គម្រោងបច្ចុប្បន្នរបស់អ្នក' : 'Your Current Plan'}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                    {currentStorePlan?.planId?.name || 'Free'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ isExpired() ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' }`}>
                    {isExpired() ? (isKm ? 'ហួសកំណត់' : 'Expired') : (isKm ? 'សកម្ម' : 'Active')}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2">
                  {currentStorePlan?.expiresAt 
                    ? `${isKm ? 'ផុតកំណត់: ' : 'Expires on: '} ${new Date(currentStorePlan.expiresAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                    : (isKm ? 'គម្រោងឥតគិតថ្លៃ (មិនមានថ្ងៃផុតកំណត់)' : 'Free Plan (Never expires)')}
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#171B26] p-3.5 sm:p-4 rounded-2xl border border-gray-100 dark:border-white/[0.04] shadow-xs">
                {storeData.branding?.logoUrl ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 ring-2 ring-gray-200 dark:ring-white/10 shadow-xs">
                    <img src={storeData.branding.logoUrl} alt="Store Logo" className="w-full h-full object-cover rounded-full aspect-square" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-tr from-[#E84C3D] to-red-400 text-white rounded-full flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md shadow-red-500/20 ring-2 ring-white/20">
                    {storeData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate max-w-[160px] text-sm">{storeData.name}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[160px]">{storeData.slug}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan._id} 
                className={`bg-white dark:bg-[#121212] p-8 rounded-[20px] shadow-sm border flex flex-col transition-all relative ${ 
                  currentPlanId === plan._id 
                    ? (isExpired() ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-[#E84C3D] ring-2 ring-[#E84C3D]/20 shadow-md scale-[1.02]') 
                    : 'border-gray-100 dark:border-white/10 hover:border-red-200 dark:hover:border-red-900/50 hover:scale-[1.01]' 
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
                  {isKm && plan.nameKm ? plan.nameKm : plan.name}
                  {currentPlanId === plan._id && (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isExpired() ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400' : 'bg-[#E84C3D]/10 text-[#E84C3D] dark:bg-red-950/30 dark:text-red-400'}`}>
                      {isKm ? (isExpired() ? 'ហួសកំណត់' : 'គម្រោងបច្ចុប្បន្ន') : (isExpired() ? 'Expired' : 'Current Plan')}
                    </span>
                  )}
                </h3>
                <div className="mt-4 flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                      ${getDisplayPrice(plan)}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      /{billingCycle === 'annually' ? (isKm ? 'ឆ្នាំ' : 'yr') : (isKm ? 'ខែ' : 'mo')}
                    </span>
                  </div>
                  {getOriginalPrice(plan) && (
                    <div className="text-sm font-medium text-gray-400 dark:text-gray-500 line-through mt-1">
                      ${getOriginalPrice(plan)}/{isKm ? 'ឆ្នាំ' : 'yr'}
                    </div>
                  )}
                </div>
                <ul className="mt-6 space-y-4 flex-1 text-gray-600 dark:text-gray-300">
                  {getPresetBenefits(plan).map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm font-medium">
                      <span className="text-green-500 dark:text-green-400 mr-3 font-bold">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                {(() => {
                  const isFreePlanButHasPaid = plan.price === 0 && currentStorePlan?.planId?.price > 0 && !isExpired();
                  const isDisabled = (currentPlanId === plan._id && !isExpired()) || isFreePlanButHasPaid;

                  return (
                    <button
                      onClick={() => handleUpgrade(plan._id)}
                      disabled={isDisabled}
                      className={`mt-8 block w-full font-bold py-3.5 px-4 rounded-xl text-center text-sm transition-all shadow-sm ${
                        isDisabled 
                          ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                          : 'bg-[#E84C3D] hover:bg-red-600 text-white shadow-md shadow-red-500/20 active:scale-[0.98]' 
                      }`}
                    >
                      {currentPlanId === plan._id 
                        ? (isExpired() ? (isKm ? 'បន្តគម្រោង' : 'Renew Plan') : (isKm ? 'បានដំណើរការ' : 'Active')) 
                        : (isFreePlanButHasPaid 
                          ? (isKm ? 'បានរួមបញ្ចូល' : 'Included') 
                          : (plan.price === 0 ? (isKm ? 'ដំណើរការគម្រោងមិនគិតថ្លៃ' : 'Activate Free Plan') : t('upgrade_button')))}
                    </button>
                  );
                })()}
                
                {/* Expiration Notice */}
                {currentPlanId === plan._id && currentStorePlan?.expiresAt && (
                  <div className={`mt-3 text-xs text-center font-medium ${isExpired() ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isKm ? 'ផុតកំណត់: ' : 'Expires: '} 
                    {new Date(currentStorePlan.expiresAt).toLocaleDateString(isKm ? 'km-KH' : 'en-US')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Payment Method Section */}
      {!loading && (
        <div className="mt-12 max-w-2xl mx-auto border-t border-gray-100 dark:border-white/10 pt-10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{isKm ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Method'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isKm ? 'វិធីសាស្ត្រដែលត្រូវបានទទួលយក' : 'Accepted payment methods'}</p>
          </div>

          <div className="bg-white dark:bg-[#121212] border border-gray-100 dark:border-white/10 rounded-[20px] p-4 md:p-5 shadow-sm transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group hover:border-[#E84C3D]/30 hover:shadow-md">
            
            <div className="flex items-center gap-5">
              {/* Logo Box */}
              <div className="w-12 h-12 rounded-[20px] bg-[#E1232E] flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img 
                  src="/logo/KHQR Logo.png" 
                  alt="KHQR" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-xs">KHQR</span>';
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#E1232E] uppercase tracking-wider bg-[#E1232E]/10 dark:bg-[#E1232E]/20 px-2 py-0.5 rounded">KHQR</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium hidden sm:inline-block">• {isKm ? 'អនុញ្ញាតភ្លាមៗ' : 'Instant Approval'}</span>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white uppercase">Bakong KHQR</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{isKm ? 'ការទូទាត់តាម Bakong' : 'Payment via Bakong KHQR'}</p>
              </div>
            </div>

            {/* Selected Indicator */}
            <div className="w-6 h-6 rounded-full bg-[#E1232E] flex items-center justify-center shrink-0 shadow-sm mr-2">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Subtle border effect on selected */}
            <div className="absolute inset-0 border-2 border-[#E1232E] rounded-[20px] pointer-events-none opacity-100"></div>
          </div>
        </div>
      )}

      {/* QR Modal Overlay via BakongKHQRModal component */}
      {qrData && selectedPlanId && (
        <BakongKHQRModal
          qrString={qrData.qrString}
          amount={getDisplayPrice(plans.find(p => p._id === selectedPlanId))}
          currency="USD"
          merchantName="Amatak Subscriptions"
          isPaid={paymentStatus === 'PAID'}
          locale={locale}
          mode="subscription"
          onClose={() => { clearPolling(); setQrData(null); setSelectedPlanId(null); sessionStorage.removeItem('pendingUpgradeQR'); sessionStorage.removeItem('pendingUpgradePlanId'); }}
          onSuccessClose={() => { clearPolling(); setQrData(null); setSelectedPlanId(null); sessionStorage.removeItem('pendingUpgradeQR'); sessionStorage.removeItem('pendingUpgradePlanId'); window.location.reload(); }}
          onSimulatePay={handleSimulatePay}
        />
      )}
    </div>
  );
}
