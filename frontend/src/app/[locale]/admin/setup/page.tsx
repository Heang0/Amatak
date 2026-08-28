'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { 
  Store, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Info, 
  ChevronDown, 
  Check,
  ShoppingBag,
  UtensilsCrossed,
  Smartphone,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'Clothing', labelEn: 'Clothing & Fashion', labelKm: 'សម្លៀកបំពាក់ & ម៉ូដ', icon: ShoppingBag },
  { value: 'Food & Beverage', labelEn: 'Food & Beverage', labelKm: 'ម្ហូប & ភេសជ្ជៈ', icon: UtensilsCrossed },
  { value: 'Electronics', labelEn: 'Electronics & Gadgets', labelKm: 'គ្រឿងអេឡិចត្រូនិច', icon: Smartphone },
  { value: 'Supplements', labelEn: 'Beauty & Health', labelKm: 'សុខភាព & សម្រស់', icon: Sparkles },
  { value: 'General Retail', labelEn: 'General Retail', labelKm: 'លក់រាយទូទៅ', icon: Store },
  { value: 'Other', labelEn: 'Other', labelKm: 'ផ្សេងៗ', icon: LayoutGrid },
];

export default function StoreSetup() {
  const user = useAuthStore((state) => state.user);
  const baseDomain = useBaseDomain();
  const t = useTranslations('AdminSetup');
  const locale = useLocale();
  const isKm = locale === 'km';
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [bakongId, setBakongId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('General Retail');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const myStore = data.find((s: any) => s.ownerId?._id === user._id || s.ownerId === user._id);
            if (myStore) {
              router.push('/admin');
            }
          }
        })
        .catch(console.error);
    }
  }, [user, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
  };

  const selectedCategoryObj = CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[4];
  const SelectedIcon = selectedCategoryObj.icon;

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !slug.trim()) {
        setMessage(isKm ? 'សូមបំពេញព័ត៌មានដែលត្រូវការ' : 'Please fill in all required fields');
        return;
      }
      setMessage('');
      setStep(2);
      return;
    }

    setMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({ name, slug, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || (isKm ? 'ការបង្កើតហាងមិនបានជោគជ័យ' : 'Failed to create store'));
      const storeId = data._id;

      if (bakongId && storeId) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${storeId}/payment-settings`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`
          },
          body: JSON.stringify({ bakongId, currency }),
        });
      }

      setStep(3);
      setTimeout(() => {
        router.push('/admin');
      }, 2000);

    } catch (err: any) {
      setMessage(err.message || (isKm ? 'មានបញ្ហាកើតឡើង សូមព្យាយាមម្តងទៀត' : 'An error occurred. Please try again.'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#050505] transition-colors duration-300">
      
      {/* Brand & Top Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {step === 1 
            ? (isKm ? 'បង្កើតហាងអនឡាញរបស់អ្នក' : 'Setup Your Online Store') 
            : step === 2 
            ? (isKm ? 'ការទូទាត់ និងគម្រោង' : 'Payments & Subscription') 
            : (isKm ? 'ហាងត្រូវបានបង្កើតដោយជោគជ័យ!' : 'Store Ready & Launched!')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {step === 1 
            ? (isKm ? 'បំពេញព័ត៌មានមូលដ្ឋានដើម្បីចាប់ផ្តើមលក់នៅលើ Amatak' : 'Fill in your basic store details to start selling on Amatak') 
            : step === 2 
            ? (isKm ? 'ជ្រើសរើសរូបិយប័ណ្ណ និងវិធីទូទាត់ប្រាក់សម្រាប់ហាង' : 'Configure currency and payment methods for your storefront') 
            : (isKm ? 'កំពុងរៀបចំផ្ទាំងគ្រប់គ្រងសម្រាប់អ្នក...' : 'Preparing your dashboard...')}
        </p>
      </div>

      {/* Modern Stepper */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex items-center justify-between relative px-6">
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-gray-200 dark:bg-gray-800 rounded-none -z-0"></div>
          <div 
            className="absolute left-10 top-1/2 -translate-y-1/2 h-1 bg-[#E84C3D] rounded-none -z-0 transition-all duration-500 ease-out" 
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 5rem)' }}
          ></div>
          
          {/* Step 1 Circle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 1 ? 'bg-[#E84C3D] text-white shadow-lg shadow-red-500/20 ring-4 ring-white dark:ring-[#050505]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              <Store size={18} />
            </div>
            <span className={`text-xs font-bold mt-2 ${step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {isKm ? 'ព័ត៌មានហាង' : 'Store Info'}
            </span>
          </div>

          {/* Step 2 Circle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 2 ? 'bg-[#E84C3D] text-white shadow-lg shadow-red-500/20 ring-4 ring-white dark:ring-[#050505]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              <CreditCard size={18} />
            </div>
            <span className={`text-xs font-bold mt-2 ${step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              {isKm ? 'ការទូទាត់' : 'Payment'}
            </span>
          </div>

          {/* Step 3 Circle */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= 3 ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 ring-4 ring-white dark:ring-[#050505]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              <CheckCircle2 size={18} />
            </div>
            <span className={`text-xs font-bold mt-2 ${step >= 3 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
              {isKm ? 'ជោគជ័យ' : 'Launch'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white dark:bg-[#111111] rounded-none shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-visible transition-colors">
        
        {message && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-none bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40 flex items-center gap-3 text-sm">
            <span>⚠️</span>
            <p className="font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={handleSaveStore} className="p-6 sm:p-8">
          
          {/* STEP 1: STORE DETAILS */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {isKm ? 'ឈ្មោះហាង' : 'Store Name'} <span className="text-[#E84C3D]">*</span>
                </label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={handleNameChange} 
                  className="w-full h-[52px] px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] outline-none transition-all text-sm font-medium" 
                  placeholder={isKm ? 'ឧ. ហាងសម្លៀកបំពាក់ សុខា' : 'e.g. My Awesome Shop'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {isKm ? 'តំណភ្ជាប់ហាងរបស់អ្នក (Store URL)' : 'Your Store URL'}
                </label>
                <div className="flex h-[52px] rounded-none overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] focus-within:ring-2 focus-within:ring-[#E84C3D]">
                  <input 
                    type="text" 
                    readOnly
                    value={slug || 'your-store-name'} 
                    className="flex-1 min-w-0 h-full px-4 bg-transparent text-gray-900 dark:text-white outline-none font-medium text-sm" 
                  />
                  <span className="inline-flex items-center h-full px-4 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-semibold border-l border-gray-200 dark:border-gray-800 select-none">
                    .{baseDomain}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {isKm ? 'អតិថិជននឹងចូលមើលហាងរបស់អ្នកតាមរយៈតំណភ្ជាប់នេះ' : 'Customers will access your storefront using this unique link'}
                </p>
              </div>

              {/* CUSTOM STORE CATEGORY DROPDOWN */}
              <div ref={categoryRef} className="relative">
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {isKm ? 'ប្រភេទអាជីវកម្ម' : 'Store Category'}
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full h-[52px] px-4 bg-gray-50 dark:bg-[#050505] border rounded-none flex items-center justify-between text-gray-900 dark:text-white transition-all text-left ${isCategoryOpen ? 'border-[#E84C3D] ring-2 ring-[#E84C3D]/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-none bg-red-50 dark:bg-red-950/40 text-[#E84C3D] flex items-center justify-center shrink-0">
                      <SelectedIcon size={15} />
                    </div>
                    <span className="font-bold text-sm truncate">
                      {isKm ? selectedCategoryObj.labelKm : selectedCategoryObj.labelEn}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180 text-[#E84C3D]' : ''}`} />
                </button>

                {/* Custom Floating Popup Menu */}
                {isCategoryOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#141414] border border-gray-100 dark:border-gray-800 rounded-none shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {CATEGORY_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = opt.value === category;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setCategory(opt.value);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-none flex items-center justify-between text-sm font-medium transition-all ${isSelected ? 'bg-red-50 dark:bg-red-950/40 text-[#E84C3D]' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#E84C3D] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                <Icon size={14} />
                              </div>
                              <span className="font-semibold">{isKm ? opt.labelKm : opt.labelEn}</span>
                            </div>
                            {isSelected && <Check size={16} className="text-[#E84C3D] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENTS & PLAN */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 rounded-none border border-amber-200 dark:border-amber-900/40 flex items-start gap-3 text-sm">
                <Info size={20} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold">{isKm ? 'គម្រោងឥតគិតថ្លៃ (Free Starter)' : 'Free Starter Plan Activated'}</p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400/90 leading-relaxed">
                    {isKm 
                      ? 'អ្នកអាចចាប់ផ្តើមបន្ថែមទំនិញ និងទទួលការបញ្ជាទិញបានភ្លាមៗ។ អ្នកអាចដំឡើងគម្រោងបានគ្រប់ពេល។' 
                      : 'You can immediately add products and receive orders. You can upgrade your plan anytime.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {isKm ? 'រូបិយប័ណ្ណលំនាំដើម' : 'Default Currency'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`h-[52px] px-4 rounded-none border text-sm font-bold flex items-center justify-center gap-2 transition-all ${currency === 'USD' ? 'border-[#E84C3D] bg-red-50 dark:bg-red-950/30 text-[#E84C3D]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#050505]'}`}
                  >
                    <span>USD ($)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('KHR')}
                    className={`h-[52px] px-4 rounded-none border text-sm font-bold flex items-center justify-center gap-2 transition-all ${currency === 'KHR' ? 'border-[#E84C3D] bg-red-50 dark:bg-red-950/30 text-[#E84C3D]' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#050505]'}`}
                  >
                    <span>KHR (៛)</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Bakong KHQR Account
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-none bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {isKm ? 'មិនបង្ខំ (អាចរំលងបាន)' : 'Optional (Can skip)'}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={bakongId} 
                  onChange={e => setBakongId(e.target.value)}
                  className="w-full h-[52px] px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-none text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#E84C3D] outline-none transition-all text-sm font-medium" 
                  placeholder="yourname@bkrt" 
                />
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  {isKm ? 'អ្នកអាចរំលង ហើយកំណត់ Bakong KHQR នៅពេលក្រោយនៅក្នុង Store Settings' : 'You can leave this blank and configure Bakong KHQR later in Store Settings'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 text-green-500 rounded-none flex items-center justify-center mb-5 ring-8 ring-green-50/50 dark:ring-green-950/20">
                <Rocket className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                {isKm ? 'ហាងរបស់អ្នកត្រូវបានបង្កើតជោគជ័យ!' : 'Your Store is Live!'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isKm ? 'កំពុងនាំអ្នកទៅកាន់ផ្ទាំងគ្រប់គ្រង...' : 'Redirecting to your merchant dashboard...'}
              </p>
            </div>
          )}

          {/* Navigation Action Buttons */}
          {step < 3 && (
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
              {step === 2 ? (
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 text-sm text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={16} /> {isKm ? 'ថយក្រោយ' : 'Back'}
                </button>
              ) : (
                <div></div>
              )}
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#E84C3D] hover:bg-red-600 text-white px-7 py-3 rounded-none font-bold text-sm shadow-md shadow-red-500/20 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {step === 1 ? (
                  <>{isKm ? 'បន្តទៅមុខ' : 'Continue'} <ChevronRight size={16} /></>
                ) : (
                  isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin"></span>
                      <span>{isKm ? 'កំពុងបង្កើតហាង...' : 'Launching Store...'}</span>
                    </span>
                  ) : (
                    <>{isKm ? 'បង្កើតហាងឥឡូវនេះ' : 'Launch My Store'} <Rocket size={16} /></>
                  )
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
