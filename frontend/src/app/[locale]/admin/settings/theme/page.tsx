'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Check, Palette, Save, Lock, Sparkles, Shirt, Sparkle, Laptop, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBaseDomain } from '@/lib/hooks/useBaseDomain';
import { useTranslations, useLocale } from 'next-intl';

function AdminToast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-sm z-[200] flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-none shadow-2xl text-sm font-semibold transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
      }`}
    >
      <Check size={16} strokeWidth={2.5} className="shrink-0 text-emerald-400 dark:text-emerald-600" />
      <span className="truncate">{message}</span>
    </div>
  );
}

export default function ThemeCustomizer() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const baseDomain = useBaseDomain();
  const t = useTranslations('AdminTheme');
  const locale = useLocale();
  const isKm = locale === 'km';

  const [storeId, setStoreId] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [themeStyle, setThemeStyle] = useState('fashion-editorial');
  const [primaryColor, setPrimaryColor] = useState('#111111');
  
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const stores = await res.json();
        const myStore = Array.isArray(stores) && stores.length > 0
          ? (stores.find((s: any) => String(s.ownerId?._id || s.ownerId) === String(user?._id)) || stores[0])
          : null;
        if (myStore) {
          setStoreId(myStore._id);
          setStoreSlug(myStore.slug);
          setThemeStyle(myStore.branding?.themeStyle || 'fashion-editorial');
          setPrimaryColor(myStore.branding?.primaryColor || '#111111');
        }
      } catch (err) {
        console.error('Error fetching store', err);
      }
    };
    if (user?.token) fetchStore();
  }, [user]);

  const handleSave = async () => {
    let targetStoreId = storeId;
    setSaving(true);
    try {
      if (!targetStoreId && user?.token) {
        const fetchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        const stores = await fetchRes.json();
        const myStore = Array.isArray(stores) && stores.length > 0
          ? (stores.find((s: any) => String(s.ownerId?._id || s.ownerId) === String(user?._id)) || stores[0])
          : null;
        if (myStore) {
          targetStoreId = myStore._id;
          setStoreId(myStore._id);
          setStoreSlug(myStore.slug);
        }
      }

      if (!targetStoreId) {
        alert(isKm ? 'រកមិនឃើញហាងរបស់អ្នកទេ' : 'Store not found');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${targetStoreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          branding: {
            themeStyle,
            primaryColor
          }
        })
      });

      if (res.ok) {
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3500);
      } else {
        const data = await res.json();
        alert(data.message || (isKm ? 'មានបញ្ហាក្នុងការរក្សាទុក' : 'Failed to save theme'));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error saving theme');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewDisplayUrl = () => {
    if (!storeSlug) return '';
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const protocol = window.location.protocol;
      if (host.includes('vercel.app')) {
        return `${protocol}//${host}/store/${storeSlug}`;
      }
      if (host.includes('localhost')) {
        const port = host.split(':')[1] || '3000';
        return `http://${storeSlug}.localhost:${port}`;
      }
      return `${protocol}//${storeSlug}${baseDomain}`;
    }
    return `https://${storeSlug}.amatak.com`;
  };

  const getPreviewIframeUrl = () => {
    if (!storeSlug) return '';
    const params = `theme=${themeStyle}&color=${encodeURIComponent(primaryColor)}`;
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      const protocol = window.location.protocol;
      if (host.includes('vercel.app')) {
        return `${protocol}//${host}/store/${storeSlug}?${params}`;
      }
      if (host.includes('localhost')) {
        const port = host.split(':')[1] || '3000';
        return `http://${storeSlug}.localhost:${port}/?${params}`;
      }
      return `${protocol}//${storeSlug}${baseDomain}/?${params}`;
    }
    return `https://${storeSlug}.amatak.com/?${params}`;
  };

  const themeOptions = [
    {
      id: 'fashion-editorial',
      name: isKm ? 'ម៉ូតសម្លៀកបំពាក់ (Editorial Fashion)' : 'Editorial Fashion & Boutique',
      desc: isKm ? 'រចនាប័ទ្មប្រណិតសម្រាប់ហាងសម្លៀកបំពាក់ រ៉ូប និងគ្រឿងតុបតែង (Zara / COS Style)' : 'High-fashion aesthetic with clean uppercase typography, size selector, and sleek bag drawer.',
      tag: isKm ? 'ពេញនិយមសម្រាប់សម្លៀកបំពាក់' : 'Recommended for Clothing',
      icon: <Shirt size={18} className="text-[#111111] dark:text-white" />,
      badgeColor: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200'
    },
    {
      id: 'skincare-clean',
      name: isKm ? 'គ្រឿងសម្អាង & ថែស្បែក (Skincare & Beauty)' : 'Clean Skincare & Cosmetics',
      desc: isKm ? 'រចនាប័ទ្មស្រទន់ សុខភាព និងសម្រស់ ជាមួយកាតមូលបែបសរីរាង្គ' : 'Soft organic pastel aesthetic tailored for beauty, serums, lotions, and wellness products.',
      tag: isKm ? 'សម្រាប់គ្រឿងសម្អាង' : 'Best for Skincare',
      icon: <Sparkle size={18} className="text-pink-500" />,
      badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
    },

    {
      id: 'neo-brutalism',
      name: isKm ? 'ស្ទាយយុវវ័យ Streetwear (Neo-Brutalism)' : 'Neo-Brutalism & Streetwear',
      desc: isKm ? 'រចនាប័ទ្មបន្ទាត់ក្រាស់ និងស្រមោលដិត បែបសិល្បៈយុវវ័យ' : 'Bold high-contrast borders and sharp typography for modern urban streetwear.',
      tag: isKm ? 'ស្ទាយដិត' : 'Streetwear Style',
      icon: <Layers size={18} className="text-amber-500" />,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
    },
    {
      id: 'default',
      name: isKm ? 'លក់រាយទូទៅ (Modern Retail)' : 'Modern Retail (Classic)',
      desc: isKm ? 'រចនាប័ទ្មស្តង់ដារសម្រាប់ហាងទំនិញគ្រប់ប្រភេទ' : 'Universal high-converting retail layout for general products and groceries.',
      tag: isKm ? 'ទូទៅ' : 'Universal',
      icon: <Sparkles size={18} className="text-emerald-500" />,
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
    }
  ];

  return (
    <>
      <AdminToast message={t('toast_success')} visible={toastVisible} />
      <div className="space-y-6 pb-10 max-w-7xl mx-auto">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/settings" 
              className="w-10 h-10 rounded-none bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                {isKm ? 'កែច្នៃការរចនា Theme' : 'Storefront Theme & Styles'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isKm ? 'ជ្រើសរើសស្ទីលហាងដែលស័ក្តិសមនឹងផលិតផលរបស់អ្នក' : 'Choose industry-tailored themes for fashion, skincare, tech, or retail.'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-[#E84C3D] hover:bg-red-600 text-white text-sm font-bold rounded-none transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/20 active:scale-95"
          >
            <Save size={16} />
            <span>{saving ? (isKm ? 'កំពុងរក្សាទុក...' : 'Saving...') : (isKm ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Theme')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Theme Selector Cards */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isKm ? 'រចនាប័ទ្មហាង (Store Themes)' : 'Store Theme Templates'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isKm ? 'ចុចលើ Template ណាមួយដើម្បី Preview ផ្ទាល់' : 'Select a theme to preview how your storefront looks.'}
                </p>
              </div>

              <div className="space-y-3">
                {themeOptions.map((style) => {
                  const isSelected = themeStyle === style.id;

                  return (
                    <div 
                      key={style.id}
                      onClick={() => setThemeStyle(style.id)}
                      className={`p-4 rounded-none border-2 cursor-pointer transition-all flex flex-col gap-2 ${
                        isSelected 
                          ? 'border-[#E84C3D] bg-red-50/40 dark:bg-red-950/20 shadow-xs' 
                          : 'border-gray-100 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/20 bg-gray-50/50 dark:bg-[#171B26]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-none bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-white/10 flex items-center justify-center shadow-2xs">
                            {style.icon}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                              {style.name}
                            </h4>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-[#E84C3D]' : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-none bg-[#E84C3D]" />}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed pl-10">
                        {style.desc}
                      </p>

                      <div className="pl-10 pt-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-none ${style.badgeColor}`}>
                          {style.tag}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Brand Color Selector */}
            <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  {isKm ? 'ពណ៌ចម្បង (Brand Accent Color)' : 'Brand Accent Color'}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {isKm ? 'ពណ៌សម្រាប់ប៊ូតុង និងចំណុចសំខាន់ៗ' : 'Applies to buttons, badges, and primary accents.'}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2.5">
                  {['#111111', '#000000', '#E84C3D', '#E67E22', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                    <button
                      key={color}
                      onClick={() => setPrimaryColor(color)}
                      className={`w-8 h-8 rounded-none border-2 transition-all ${
                        primaryColor.toUpperCase() === color.toUpperCase() 
                          ? 'border-gray-900 dark:border-white scale-110 shadow-md ring-2 ring-red-500/20' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-none cursor-pointer border border-gray-200 dark:border-white/10 p-0.5 bg-transparent overflow-hidden"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/[0.08] rounded-none bg-gray-50 dark:bg-[#171B26] text-gray-900 dark:text-white font-mono uppercase text-xs font-bold focus:outline-none focus:border-[#E84C3D]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Live Mobile Preview Column (Right) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-none p-5 sm:p-6 shadow-sm flex flex-col items-center">
            
            {/* Device Mockup Header */}
            <div className="w-full mb-4 bg-gray-100 dark:bg-[#171B26] border border-gray-200 dark:border-white/[0.06] rounded-none flex items-center px-4 py-3 gap-3">
              <div className="flex gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-none bg-red-400"></div>
                <div className="w-3 h-3 rounded-none bg-amber-400"></div>
                <div className="w-3 h-3 rounded-none bg-emerald-400"></div>
              </div>
              <div className="flex-1 bg-white dark:bg-[#111622] rounded-none flex items-center px-3 py-1.5 gap-2 border border-gray-200/50 dark:border-white/[0.04] min-w-0">
                <Lock size={12} className="text-gray-400 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-300 font-mono font-medium truncate">
                  {getPreviewDisplayUrl()}
                </span>
              </div>
            </div>
            
            {/* Iframe Viewport Container */}
            {storeSlug ? (
              <div className="w-full max-w-[420px] h-[680px] rounded-none border-4 border-gray-800 dark:border-gray-700 overflow-hidden shadow-2xl bg-white relative">
                <iframe 
                  key={`${themeStyle}-${primaryColor}`}
                  src={getPreviewIframeUrl()}
                  className="w-full h-full border-0"
                  title="Store Preview"
                />
              </div>
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center text-gray-400 text-sm">
                {t('loading_preview')}
              </div>
            )}
            
          </div>

        </div>
      </div>
    </>
  );
}
