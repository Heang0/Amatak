'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, X, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

interface Product {
 _id: string;
 title: string;
 titleKm?: string;
 price: number;
 stock: number;
 imageUrl: string;
 images?: string[];
 category?: string | { _id: string };
 isBestSeller?: boolean;
}

export default function ManageProducts() {
 const user = useAuthStore((state) => state.user);
 const t = useTranslations('AdminProducts');
 const locale = useLocale();
 const [products, setProducts] = useState<Product[]>([]);
 const [storeId, setStoreId] = useState<string | null>(null);
 const [predefinedVariants, setPredefinedVariants] = useState<{ name: string, options: string[] }[]>([]);

 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [storeCategory, setStoreCategory] = useState<string>('General Retail');

 // Form State
 const [showForm, setShowForm] = useState(false);
 const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [title, setTitle] = useState('');
 const [titleKm, setTitleKm] = useState('');
 const [description, setDescription] = useState('');
 const [descriptionKm, setDescriptionKm] = useState('');
 const [price, setPrice] = useState('');
 const [stock, setStock] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [categories, setCategories] = useState<any[]>([]);
 const [imageUrl, setImageUrl] = useState('');
 const [images, setImages] = useState<string[]>([]);
 const [variants, setVariants] = useState<{ name: string, options: string }[]>([]);
 const [isBestSeller, setIsBestSeller] = useState(false);
 const [translating, setTranslating] = useState<string | null>(null);

 const [searchQuery, setSearchQuery] = useState('');
 const [filterCategoryId, setFilterCategoryId] = useState('');

 const handleTranslate = async (text: string, from: string, to: string, setter: (val: string) => void, fieldId: string) => {
 if (!text.trim()) return;
 setTranslating(fieldId);
 try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/translate?text=${encodeURIComponent(text)}&from=${from}&to=${to}`, {
  headers: { Authorization: `Bearer ${user?.token}` }
  });
  const data = await res.json();
  if (res.ok && data.translatedText) {
  setter(data.translatedText);
  } else {
  console.error('Translation failed', data.message);
  }
 } catch (err) {
  console.error('Translation error', err);
 } finally {
  setTranslating(null);
 }
 };

 const handleTitleBlur = () => {
 if (title.trim() && !titleKm.trim()) {
  handleTranslate(title, 'en', 'km', setTitleKm, 'prod-title-km');
 }
 };

 const handleTitleKmBlur = () => {
 if (titleKm.trim() && !title.trim()) {
  handleTranslate(titleKm, 'km', 'en', setTitle, 'prod-title-en');
 }
 };

 const handleDescriptionBlur = () => {
 if (description.trim() && !descriptionKm.trim()) {
  handleTranslate(description, 'en', 'km', setDescriptionKm, 'prod-desc-km');
 }
 };

 const handleDescriptionKmBlur = () => {
 if (descriptionKm.trim() && !description.trim()) {
  handleTranslate(descriptionKm, 'km', 'en', setDescription, 'prod-desc-en');
 }
 };

 const getCategoryName = (category: any) =>
 locale === 'km' && category.nameKm ? category.nameKm : category.name;

 const fetchMyStore = async () => {
 try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores`, {
  headers: { Authorization: `Bearer ${user?.token}` }
  });
  const data = await res.json();
  const myStore = data.find((s: any) => s.ownerId._id === user?._id || s.ownerId === user?._id);
  if (myStore) {
  setStoreId(myStore._id);
  const cat = myStore.category || 'General Retail';
  setStoreCategory(cat);
  if (myStore.predefinedVariants && myStore.predefinedVariants.length > 0) {
   setPredefinedVariants(myStore.predefinedVariants);
  } else {
   if (cat === 'Clothing') {
   setPredefinedVariants([
    { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
    { name: 'Color', options: ['Black', 'White', 'Red', 'Blue'] }
   ]);
   } else if (cat === 'Food & Beverage') {
   setPredefinedVariants([
    { name: 'Size', options: ['Small', 'Medium', 'Large'] },
    { name: 'Add-ons', options: ['Extra Cheese', 'No Onion'] }
   ]);
   } else if (cat === 'Electronics') {
   setPredefinedVariants([
    { name: 'Storage', options: ['64GB', '128GB', '256GB'] },
    { name: 'Color', options: ['Black', 'Silver', 'Gold'] }
   ]);
   } else if (cat === 'Supplements') {
   setPredefinedVariants([
    { name: 'Flavor (រសជាតិ)', options: ['Vanilla', 'Chocolate', 'Strawberry', 'Unflavored'] },
    { name: 'Size (ទំហំ/ទម្ងន់)', options: ['30 Servings', '60 Servings', '1KG', '2KG'] }
   ]);
   }
  }
  }
 } catch (err) {
  console.error(err);
 }
 };

 useEffect(() => {
 // 1. Get store ID
 fetchMyStore();

 // 2. Fetch categories
 fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
  headers: { Authorization: `Bearer ${user?.token}` }
 })
  .then(res => res.json())
  .then(data => {
  if (Array.isArray(data)) setCategories(data);
  })
  .catch(console.error);
 }, [user]);

 const fetchProducts = async (sid: string, page: number = 1, search: string = searchQuery, catId: string = filterCategoryId) => {
 try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/store/${sid}?page=${page}&limit=10&search=${encodeURIComponent(search)}&categoryId=${catId}`);
  const data = await res.json();
  if (res.ok) {
  setProducts(data.products || []);
  setTotalPages(data.totalPages || 1);
  }
 } catch (err) {
  console.error(err);
 }
 };

 // 3. Fetch products reactively on pagination or filter changes
 useEffect(() => {
 if (storeId) {
  const delayDebounceFn = setTimeout(() => {
  fetchProducts(storeId, currentPage, searchQuery, filterCategoryId);
  }, 300); // 300ms debounce
  return () => clearTimeout(delayDebounceFn);
 }
 }, [storeId, currentPage, searchQuery, filterCategoryId]);

 const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const formData = new FormData();
 formData.append('image', file);

 try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload?type=product`, {
  method: 'POST',
  body: formData, // No Auth headers for this mock public route
  });
  const data = await res.json();
  if (res.ok) setImageUrl(data.url);
 } catch (err) {
  console.error('Upload error', err);
 }
 };

 const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (!files) return;

 const remainingSlots = 3 - images.length;
 if (remainingSlots <= 0) return alert('Max 3 extra images allowed');

 const filesToUpload = Array.from(files).slice(0, remainingSlots);

 for (const file of filesToUpload) {
  const formData = new FormData();
  formData.append('image', file);
  try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload?type=product`, {
   method: 'POST',
   body: formData,
  });
  const data = await res.json();
  if (res.ok) setImages(prev => [...prev, data.url]);
  } catch (err) {
  console.error('Upload error', err);
  }
 }
 };

 const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!storeId) return alert(t('setup_store_first'));

 try {
  const parsedVariants = variants
  .filter(v => v.name && v.options)
  .map(v => ({
   name: v.name,
   options: v.options.split(',').map(s => s.trim()).filter(Boolean)
  }));

  const payload = {
  storeId,
  categoryId: categoryId || null,
  title,
  titleKm,
  description,
  descriptionKm,
  price: Number(price),
  stock: Number(stock),
  imageUrl,
  images,
  isBestSeller,
  variants: parsedVariants
  };

  const url = editingProduct
  ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${editingProduct._id}`
  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`;

  const method = editingProduct ? 'PUT' : 'POST';

  const res = await fetch(url, {
  method,
  headers: {
   'Content-Type': 'application/json',
   Authorization: `Bearer ${user?.token}`
  },
  body: JSON.stringify(payload),
  });

  if (res.ok) {
  setShowForm(false);
  setEditingProduct(null);
  setTitle(''); setTitleKm(''); setDescription(''); setDescriptionKm(''); setPrice(''); setStock(''); setImageUrl(''); setImages([]); setCategoryId(''); setVariants([]); setIsBestSeller(false);
  fetchProducts(storeId, currentPage);
  fetchMyStore(); // Refresh predefined variants
  } else {
  const data = await res.json();
  alert(data.message);
  }
 } catch (err) {
  console.error(err);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm(t('confirm_delete'))) return;
 try {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${user?.token}` }
  });
  if (storeId) fetchProducts(storeId, currentPage);
 } catch (err) {
  console.error(err);
 }
 };

 const handleToggleFlag = async (productId: string, flag: 'isBestSeller', currentValue: boolean) => {
 try {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${productId}`, {
  method: 'PUT',
  headers: {
   'Content-Type': 'application/json',
   Authorization: `Bearer ${user?.token}`
  },
  body: JSON.stringify({
   [flag]: !currentValue
  }),
  });

  if (res.ok && storeId) {
  fetchProducts(storeId, currentPage);
  }
 } catch (err) {
  console.error(err);
 }
 };

 const handleEdit = async (product: any) => {
 // We need to fetch the full product details to get variants and description
 try {
  // Actually, since products in the list might not have all fields populated in some setups,
  // let's use what we have, but ensure we have all fields.
  setEditingProduct(product);
  setTitle(product.title || '');
  setTitleKm(product.titleKm || '');
  setDescription(product.description || '');
  setDescriptionKm(product.descriptionKm || '');
  setPrice((product.price || 0).toString());
  setStock((product.stock || 0).toString());
  setImageUrl(product.imageUrl || '');
  setImages(product.images || []);
  setIsBestSeller(product.isBestSeller || false);
  const productCategory = typeof product.category === 'object' ? product.category?._id : product.category;
  setCategoryId(productCategory ? String(productCategory) : '');

  if (product.variants && product.variants.length > 0) {
  setVariants(product.variants.map((v: any) => ({
   name: v.name,
   options: Array.isArray(v.options) ? v.options.join(', ') : v.options
  })));
  } else {
  setVariants([]);
  }

  setShowForm(true);
  document.getElementById('dashboard-main')?.scrollTo({ top: 0, behavior: 'smooth' });
 } catch (err) {
  console.error(err);
 }
 };

 const handleToggleForm = () => {
 if (!showForm) {
  // Clear form when opening for a new product
  setEditingProduct(null);
  setTitle(''); setTitleKm(''); setDescription(''); setDescriptionKm(''); setPrice(''); setStock(''); setImageUrl(''); setImages([]); setCategoryId(''); setIsBestSeller(false);

  setVariants([]);
 } else {
  setEditingProduct(null);
 }
 setShowForm(!showForm);
 };

 return (
 <div className="space-y-6">
  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
  <div>
   <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
   <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Manage your store products</p>
  </div>
   <button
    onClick={handleToggleForm}
    className="h-10 px-5 bg-[#E84C3D] hover:bg-red-600 text-white text-sm font-bold rounded-none flex items-center justify-center gap-2 transition-all shadow-sm shadow-red-500/20 whitespace-nowrap shrink-0"
   >
    {showForm ? <X size={18} /> : <Plus size={18} />}
    {showForm ? t('cancel') : t('add_product')}
   </button>
   </div>

  {showForm && (
  <form onSubmit={handleCreateOrUpdateProduct} className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 p-8 rounded-none shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none space-y-6">
   <div className="flex items-center gap-3 mb-2">
   <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingProduct ? t('edit_product') : t('create_product')}</h3>
   </div>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
   <div>
    <div className="flex justify-between items-center mb-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_title')} (EN)</label>
    {titleKm && (
     <button
     type="button"
     onClick={() => handleTranslate(titleKm, 'km', 'en', setTitle, 'prod-title-en')}
     className="text-xs text-[#E84C3D] hover:underline font-semibold"
     disabled={translating === 'prod-title-en'}
     >
     {translating === 'prod-title-en' ? '...' : '✨ Translate from KM'}
     </button>
    )}
    </div>
    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} onBlur={handleTitleBlur} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors" />
   </div>
   <div>
    <div className="flex justify-between items-center mb-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('product_title')} (KM)</label>
    {title && (
     <button
     type="button"
     onClick={() => handleTranslate(title, 'en', 'km', setTitleKm, 'prod-title-km')}
     className="text-xs text-[#E84C3D] hover:underline font-semibold"
     disabled={translating === 'prod-title-km'}
     >
     {translating === 'prod-title-km' ? '...' : '✨ បកប្រែពី EN'}
     </button>
    )}
    </div>
    <input type="text" value={titleKm} onChange={e => setTitleKm(e.target.value)} onBlur={handleTitleKmBlur} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors" />
   </div>
   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('price')}</label>
    <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors" />
   </div>
   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('stock')}</label>
    <input type="number" required value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors" />
   </div>
   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('custom_category')}</label>
    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors">
    <option value="">{t('no_category')}</option>
    {categories.map(cat => (
     <option key={cat._id} value={cat._id}>{getCategoryName(cat)}</option>
    ))}
    </select>
   </div>
   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('image_upload')} (Main)</label>
    <div className="flex gap-4 items-center">
    <input type="file" accept="image/*" onChange={handleUpload} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900/20 dark:file:text-red-400" />
    {imageUrl && (
     <div className="w-12 h-12 shrink-0 rounded-none overflow-hidden border-none relative group">
     <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
     <button type="button" onClick={() => setImageUrl('')} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
     </div>
    )}
    </div>
   </div>
   <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('gallery_images')}</label>
    <div className="flex flex-col gap-2">
    <input type="file" multiple accept="image/*" onChange={handleExtraUpload} disabled={images.length >= 3} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400 disabled:opacity-50" />
    {images.length > 0 && (
     <div className="flex gap-2">
     {images.map((img, i) => (
      <div key={i} className="w-12 h-12 shrink-0 rounded-none overflow-hidden border-none relative group">
      <img src={img} alt="Gallery" className="w-full h-full object-cover" />
      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
      </div>
     ))}
     </div>
    )}
    </div>
   </div>
   <div className="col-span-1 md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('flags')}</label>
    <div className="flex flex-wrap gap-6">
    <label className="flex items-center gap-3 cursor-pointer">
     <input type="checkbox" checked={isBestSeller} onChange={(e) => setIsBestSeller(e.target.checked)} className="w-4 h-4 rounded-none border-gray-300 text-[#E84C3D] focus:ring-[#E84C3D]" />
     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('best_seller')}</span>
    </label>
    </div>
   </div>

   <div className="col-span-1 md:col-span-2">
    <div className="flex justify-between items-center mb-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')} (EN)</label>
    {descriptionKm && (
     <button
     type="button"
     onClick={() => handleTranslate(descriptionKm, 'km', 'en', setDescription, 'prod-desc-en')}
     className="text-xs text-[#E84C3D] hover:underline font-semibold"
     disabled={translating === 'prod-desc-en'}
     >
     {translating === 'prod-desc-en' ? '...' : '✨ Translate from KM'}
     </button>
    )}
    </div>
    <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} onBlur={handleDescriptionBlur} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors"></textarea>
   </div>
   <div className="col-span-1 md:col-span-2">
    <div className="flex justify-between items-center mb-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')} (KM)</label>
    {description && (
     <button
     type="button"
     onClick={() => handleTranslate(description, 'en', 'km', setDescriptionKm, 'prod-desc-km')}
     className="text-xs text-[#E84C3D] hover:underline font-semibold"
     disabled={translating === 'prod-desc-km'}
     >
     {translating === 'prod-desc-km' ? '...' : '✨ បកប្រែពី EN'}
     </button>
    )}
    </div>
    <textarea rows={3} value={descriptionKm} onChange={e => setDescriptionKm(e.target.value)} onBlur={handleDescriptionKmBlur} className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-none focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] transition-colors"></textarea>
   </div>

   <div className="col-span-1 md:col-span-2 border-t border-none border-none pt-6 mt-2">
    <div className="flex justify-between items-center mb-4">
    <label className="block text-sm font-semibold text-gray-900 dark:text-white">{t('variants_optional')}</label>
    <button type="button" onClick={() => setVariants([...variants, { name: '', options: '' }])} className="text-sm text-[#E84C3D] font-medium hover:text-red-600">
     {t('add_variant')}
    </button>
    </div>
    
    {predefinedVariants.length > 0 && (
    <div className="flex flex-wrap items-center gap-5 mb-5">
     {predefinedVariants.map((pv, idx) => {
     const isChecked = variants.some(v => v.name.toLowerCase() === pv.name.toLowerCase());
     return (
      <label key={idx} className="flex items-center gap-2 cursor-pointer">
      <input
       type="checkbox"
       checked={isChecked}
       onChange={(e) => {
       if (e.target.checked) {
        setVariants([...variants, { name: pv.name, options: pv.options.join(', ') }]);
       } else {
        setVariants(variants.filter(v => v.name.toLowerCase() !== pv.name.toLowerCase()));
       }
       }}
       className="w-4 h-4 rounded-none border-gray-300 text-[#E84C3D] focus:ring-[#E84C3D]"
      />
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{pv.name}</span>
      </label>
     );
     })}
    </div>
    )}

    <div className="space-y-4">
    {variants.map((variant, index) => {
     const predefinedMatch = predefinedVariants.find(pv => pv.name.toLowerCase() === variant.name.toLowerCase());
     const currentOptionsList = variant.options.split(',').map(s => s.trim()).filter(Boolean);

     return (
     <div key={index} className="flex flex-col gap-3 bg-[#F4F7FE] dark:bg-gray-800/50 p-4 rounded-none border border-none dark:border-gray-700">
      <div className="flex gap-4 items-start">
      <div className="flex-1">
       <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('variant_name')}</label>
       <input type="text" value={variant.name} onChange={e => { const newV = [...variants]; newV[index].name = e.target.value; setVariants(newV); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:ring-2 focus:ring-[#E84C3D] text-sm" />
      </div>
      <div className="flex-[2]">
       <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('variant_options')}</label>
       <input type="text" value={variant.options} onChange={e => { const newV = [...variants]; newV[index].options = e.target.value; setVariants(newV); }} placeholder="e.g. S, M, L or custom" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:ring-2 focus:ring-[#E84C3D] text-sm" />
      </div>
      <button type="button" onClick={() => { const newV = variants.filter((_, i) => i !== index); setVariants(newV); }} className="mt-6 text-gray-600 dark:text-gray-400 hover:text-red-500 p-2">
       ✕
      </button>
      </div>

      {(predefinedMatch || currentOptionsList.length > 0) && (
      <div className="flex flex-wrap gap-3 pl-1 pt-1 border-t border-none dark:border-gray-700">
       <span className="text-[11px] uppercase font-bold text-gray-600 dark:text-gray-400 mt-0.5">Quick Tick:</span>
       {Array.from(new Set([
       ...(predefinedMatch ? predefinedMatch.options.map(o => o.trim()) : []),
       ...currentOptionsList
       ])).map((opt, optIdx) => {
       if (!opt) return null;
       const isOptChecked = currentOptionsList.some(o => o.toLowerCase() === opt.toLowerCase());
       return (
        <label key={optIdx} className="flex items-center gap-1.5 cursor-pointer">
        <input
         type="checkbox"
         checked={isOptChecked}
         onChange={(e) => {
         let newOptionsList = [...currentOptionsList];
         if (e.target.checked) {
          if (!isOptChecked) newOptionsList.push(opt);
         } else {
          newOptionsList = newOptionsList.filter(o => o.toLowerCase() !== opt.toLowerCase());
         }
         const newV = [...variants];
         newV[index].options = newOptionsList.join(', ');
         setVariants(newV);
         }}
         className="w-3.5 h-3.5 rounded-none border-gray-300 text-[#E84C3D] focus:ring-[#E84C3D]"
        />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{opt}</span>
        </label>
       );
       })}
      </div>
      )}
     </div>
     );
    })}
    {variants.length === 0 && (
     <p className="text-sm text-gray-600 dark:text-gray-400 italic">{t('no_variants')}</p>
    )}
    </div>
   </div>
   </div>
   <button type="submit" className="bg-[#E84C3D] hover:bg-red-600 text-white px-6 py-2.5 rounded-none font-bold transition-all shadow-md shadow-red-500/20">
   {t('save_product')}
   </button>
  </form>
  )}

  {/* Search and Category Filter Bar */}
  <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 p-4 rounded-none shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none flex flex-col md:flex-row gap-4 items-center justify-between">
  <div className="relative w-full md:max-w-md">
   <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-600 dark:text-gray-400">
   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
   </span>
   <input
   type="text"
   placeholder={locale === 'km' ? 'ស្វែងរកផលិតផល...' : 'Search products by name...'}
   value={searchQuery}
   onChange={(e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // reset page on search
   }}
   className="w-full pl-10 pr-10 py-2.5 bg-[#F4F7FE] dark:bg-gray-900 border border-none border-none rounded-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] outline-none transition-colors"
   />
   {searchQuery && (
   <button
    type="button"
    onClick={() => {
    setSearchQuery('');
    setCurrentPage(1);
    }}
    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
    title={locale === 'km' ? 'សម្អាត' : 'Clear search'}
   >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
   </button>
   )}
  </div>

  <div className="w-full md:w-auto flex items-center gap-2">
   <label className="text-sm font-medium text-gray-600 dark:text-gray-400 shrink-0">
   {locale === 'km' ? 'តម្រងតាមប្រភេទ៖' : 'Filter by Category:'}
   </label>
   <select
   value={filterCategoryId}
   onChange={(e) => {
    setFilterCategoryId(e.target.value);
    setCurrentPage(1); // reset page on filter
   }}
   className="w-full md:w-48 px-3 py-2.5 bg-[#F4F7FE] dark:bg-gray-900 border border-none border-none rounded-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] focus:border-[#E84C3D] outline-none transition-colors"
   >
   <option value="">{locale === 'km' ? 'ទាំងអស់' : 'All Categories'}</option>
   {categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
    {getCategoryName(cat)}
    </option>
   ))}
   </select>
  </div>
  </div>

  <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-none shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none overflow-hidden">
  <div className="overflow-x-auto">
  <table className="min-w-full">
   <thead>
   <tr className="border-b border-none border-none bg-[#F4F7FE]/50 dark:bg-[#080808]">
    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('product')}</th>
    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('custom_category')}</th>
    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('price')}</th>
    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('stock')}</th>
    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{locale === 'km' ? 'លក់ដាច់បំផុត' : 'Best Seller'}</th>
    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{t('actions')}</th>
   </tr>
   </thead>
   <tbody className="divide-y divide-gray-50 dark:divide-white/10/50">
   {products.map((product) => {
    const productCategoryObj = categories.find(c => c._id === (typeof product.category === 'object' ? product.category?._id : product.category));
    return (
    <tr key={product._id} className="hover:bg-[#F4F7FE]/70 dark:hover:bg-gray-800/30 transition-colors duration-150 group">
    <td className="px-6 py-4 whitespace-nowrap">
     <div className="flex items-center gap-3">
     <div className="flex-shrink-0 h-11 w-11 rounded-none overflow-hidden border border-none dark:border-gray-700 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h-full w-full object-cover" src={product.imageUrl} alt="" />
     </div>
     <div className="font-semibold text-sm text-gray-900 dark:text-white">
      {locale === 'km' && product.titleKm ? product.titleKm : product.title}
     </div>
     </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
     {productCategoryObj ? (
     <span className="inline-flex items-center px-2.5 py-1 rounded-none text-[11px] font-bold bg-gray-100 text-gray-600 dark:text-gray-400 dark:bg-gray-800">
      {getCategoryName(productCategoryObj)}
     </span>
     ) : (
     <span className="text-gray-300 text-xs">—</span>
     )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
     <span className="text-sm font-black text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
     <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[11px] font-bold ${ product.stock > 10 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : product.stock > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' }`}>
     <span className={`w-1.5 h-1.5 rounded-none inline-block ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-400' : 'bg-red-500'}`} />
     {product.stock}
     </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
     <button
     onClick={() => handleToggleFlag(product._id, 'isBestSeller', product.isBestSeller || false)}
     className={`px-3 py-1.5 rounded-none text-xs font-medium transition-colors ${ product.isBestSeller ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-none' }`}
     >
     {product.isBestSeller ? (locale === 'km' ? 'បាទ/ចាស' : 'Yes') : (locale === 'km' ? 'ទេ' : 'No')}
     </button>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
     <div className="flex items-center justify-end gap-2">
     <button onClick={() => handleEdit(product)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">{t('edit')}</button>
     <button onClick={() => handleDelete(product._id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">{t('delete')}</button>
     </div>
    </td>
    </tr>
   );
   })}
   {products.length === 0 && (
    <tr>
    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
     {t('no_products')}
    </td>
    </tr>
   )}
   </tbody>
  </table>
  </div>
  {totalPages > 1 && (
   <div className="px-6 py-4 border-t border-none border-none flex items-center justify-between bg-[#F4F7FE] dark:bg-[#121212] dark:border dark:border-white/10">
   <button
    onClick={() => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    if (storeId) fetchProducts(storeId, newPage);
    }}
    disabled={currentPage === 1}
    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-none text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-[#F4F7FE] dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
   >
    {t('previous')}
   </button>
   <span className="text-sm text-gray-600 dark:text-gray-400">
    {t('page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> {t('of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
   </span>
   <button
    onClick={() => {
    const newPage = Math.min(totalPages, currentPage + 1);
    setCurrentPage(newPage);
    if (storeId) fetchProducts(storeId, newPage);
    }}
    disabled={currentPage === totalPages}
    className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-none text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-[#F4F7FE] dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
   >
    {t('next')}
   </button>
   </div>
  )}
  </div>
 </div>
 );
}
