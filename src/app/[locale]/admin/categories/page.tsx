'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Plus, Trash2, Tag, Edit2, X, AlertTriangle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface Category {
 _id: string;
 name: string;
 nameKm?: string;
 slug: string;
 parentCategory?: string | null;
 createdAt: string;
}

export default function AdminCategories() {
 const user = useAuthStore((state) => state.user);
 const t = useTranslations('AdminCategories');
 const locale = useLocale();
 const [categories, setCategories] = useState<Category[]>([]);
 const [loading, setLoading] = useState(true);
 
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [newCategoryName, setNewCategoryName] = useState('');
 const [newCategoryNameKm, setNewCategoryNameKm] = useState('');
 const [newCategoryParent, setNewCategoryParent] = useState('');
 const [categoryType, setCategoryType] = useState<'main' | 'sub'>('main');
 const [submitting, setSubmitting] = useState(false);
 const [errorMsg, setErrorMsg] = useState('');

 const [editingCategory, setEditingCategory] = useState<Category | null>(null);
 const [editCategoryName, setEditCategoryName] = useState('');
 const [editCategoryNameKm, setEditCategoryNameKm] = useState('');
 const [editCategoryParent, setEditCategoryParent] = useState('');
 const [translating, setTranslating] = useState<string | null>(null);

 const [deleteModal, setDeleteModal] = useState<{
  isOpen: boolean;
  categoryId: string | null;
  categoryName: string;
  hasProductsError: string | null;
  loading: boolean;
 }>({
  isOpen: false,
  categoryId: null,
  categoryName: '',
  hasProductsError: null,
  loading: false
 });

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

 const handleNewCategoryNameBlur = () => {
  if (newCategoryName.trim() && !newCategoryNameKm.trim()) {
   handleTranslate(newCategoryName, 'en', 'km', setNewCategoryNameKm, 'create-km');
  }
 };

 const handleNewCategoryNameKmBlur = () => {
  if (newCategoryNameKm.trim() && !newCategoryName.trim()) {
   handleTranslate(newCategoryNameKm, 'km', 'en', setNewCategoryName, 'create-en');
  }
 };

 const handleEditCategoryNameBlur = (catId: string) => {
  if (editCategoryName.trim() && !editCategoryNameKm.trim()) {
   handleTranslate(editCategoryName, 'en', 'km', setEditCategoryNameKm, `edit-km-${catId}`);
  }
 };

 const handleEditCategoryNameKmBlur = (catId: string) => {
  if (editCategoryNameKm.trim() && !editCategoryName.trim()) {
   handleTranslate(editCategoryNameKm, 'km', 'en', setEditCategoryName, `edit-en-${catId}`);
  }
 };

 const getCategoryName = (category: Category) =>
  locale === 'km' && category.nameKm ? category.nameKm : category.name;
 const getSecondaryCategoryName = (category: Category) =>
  locale === 'km' ? category.name : category.nameKm;

 const fetchCategories = async () => {
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
    headers: { Authorization: `Bearer ${user?.token}` }
   });
   const data = await res.json();
   setCategories(Array.isArray(data) ? data : []);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  if (user?.token) fetchCategories();
 }, [user]);

 const handleCreateCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!newCategoryName.trim()) return;

  setSubmitting(true);
  setErrorMsg('');
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${user?.token}`
    },
    body: JSON.stringify({ name: newCategoryName, nameKm: newCategoryNameKm, parentCategory: newCategoryParent || null })
   });
   
   if (res.ok) {
    setNewCategoryName('');
    setNewCategoryNameKm('');
    setNewCategoryParent('');
    setIsAddModalOpen(false);
    fetchCategories();
   } else {
    const data = await res.json();
    setErrorMsg(data.message || t('failed_create'));
   }
  } catch (err: any) {
   setErrorMsg(err.message || t('failed_create'));
  } finally {
   setSubmitting(false);
  }
 };

 const handleUpdateCategory = async (id: string) => {
  if (!editCategoryName.trim()) return;

  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${id}`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${user?.token}`
    },
    body: JSON.stringify({ name: editCategoryName, nameKm: editCategoryNameKm, parentCategory: editCategoryParent || null })
   });
   
   if (res.ok) {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryNameKm('');
    setEditCategoryParent('');
    fetchCategories();
   } else {
    const data = await res.json();
    alert(data.message || t('failed_update'));
   }
  } catch (err) {
   console.error(err);
  }
 };

 const openDeleteModal = (category: Category) => {
  setDeleteModal({
   isOpen: true,
   categoryId: category._id,
   categoryName: getCategoryName(category),
   hasProductsError: null,
   loading: false
  });
 };

 const confirmDeleteCategory = async () => {
  if (!deleteModal.categoryId) return;

  setDeleteModal(prev => ({ ...prev, loading: true }));
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories/${deleteModal.categoryId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user?.token}` }
   });
   
   if (res.ok) {
    setCategories(categories.filter(c => c._id !== deleteModal.categoryId));
    setDeleteModal({
     isOpen: false,
     categoryId: null,
     categoryName: '',
     hasProductsError: null,
     loading: false
    });
   } else {
    const data = await res.json();
    setDeleteModal(prev => ({
     ...prev,
     loading: false,
     hasProductsError: data.message || t('failed_delete')
    }));
   }
  } catch (err) {
   console.error(err);
   setDeleteModal(prev => ({
    ...prev,
    loading: false,
    hasProductsError: t('failed_delete')
   }));
  }
 };

 const renderCategoryRow = (category: Category, isSub: boolean = false) => {
  const isEditing = editingCategory?._id === category._id;
  return (
   <tr key={category._id} className={`border-b border-gray-100 dark:border-gray-800 transition-colors ${isSub ? 'bg-gray-50/50 dark:bg-[#121212] dark:border dark:border-white/10/20' : 'hover:bg-gray-50 dark:hover:bg-[#111C44]/50'}`}>
    <td className="px-6 py-4">
     <div className={`flex items-center ${isSub ? 'ml-8' : ''}`}>
      {isSub && (
       <div className="w-4 h-4 border-l-2 border-b-2 border-gray-300 dark:border-gray-700 rounded-bl mr-3 -mt-3" />
      )}
      
      {isEditing ? (
       <div className="flex flex-col gap-2 w-full max-w-sm">
        <div className="flex gap-2">
         <input
          type="text"
          value={editCategoryName}
          onChange={(e) => setEditCategoryName(e.target.value)}
          onBlur={() => handleEditCategoryNameBlur(category._id)}
          className="w-full px-3 py-1.5 text-sm border-none rounded bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa]"
          autoFocus
         />
         <input
          type="text"
          value={editCategoryNameKm}
          onChange={(e) => setEditCategoryNameKm(e.target.value)}
          onBlur={() => handleEditCategoryNameKmBlur(category._id)}
          className="w-full px-3 py-1.5 text-sm border-none rounded bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa]"
         />
        </div>
        {isSub && (
         <select
          value={editCategoryParent}
          onChange={(e) => setEditCategoryParent(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border-none rounded bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa]"
         >
          <option value="">{locale === 'km' ? 'គ្មានប្រភេទមេ' : 'No Parent'}</option>
          {categories.filter(c => !c.parentCategory && c._id !== category._id).map(c => (
           <option key={c._id} value={c._id}>{getCategoryName(c)}</option>
          ))}
         </select>
        )}
        <div className="flex gap-2">
         <button onClick={() => handleUpdateCategory(category._id)} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-none font-bold">{t('save')}</button>
         <button onClick={() => setEditingCategory(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-none font-bold">{t('cancel')}</button>
        </div>
       </div>
      ) : (
       <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSub ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa] dark:text-gray-600 dark:text-[#a1a1aa]'}`}>
         <Tag size={14} />
        </div>
        <div>
         <p className="font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] text-sm">
          {getCategoryName(category)}
          {getSecondaryCategoryName(category) && (
           <span className="text-gray-600 dark:text-[#a1a1aa] font-normal ml-2 text-xs">{getSecondaryCategoryName(category)}</span>
          )}
         </p>
         <p className="text-[11px] text-gray-600 dark:text-[#a1a1aa] font-mono mt-0.5">/{category.slug}</p>
        </div>
       </div>
      )}
     </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right">
     <div className="flex items-center justify-end gap-2">
      {editingCategory?._id !== category._id && (
       <button
        onClick={() => {
         setEditingCategory(category);
         setEditCategoryName(category.name);
         setEditCategoryNameKm(category.nameKm || '');
         setEditCategoryParent(category.parentCategory || '');
        }}
        className="p-2 text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:text-[#fafafa] dark:hover:text-white transition-colors rounded-none"
        title={t('edit')}
       >
        <Edit2 size={16} />
       </button>
      )}
      <button
        onClick={() => openDeleteModal(category)}
        className="p-2 text-gray-600 dark:text-[#a1a1aa] hover:text-red-600 transition-colors rounded-none"
        title={t('delete')}
       >
        <Trash2 size={16} />
       </button>
     </div>
    </td>
   </tr>
  );
 };

 return (
  <div className="space-y-6">
   <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
    <div>
     <h2 className="text-xl font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{t('title')}</h2>
     <p className="text-sm text-gray-600 dark:text-[#a1a1aa] mt-1">{locale === 'km' ? 'គ្រប់គ្រងប្រភេទផលិតផលរបស់អ្នក' : 'Manage your product categories'}</p>
    </div>
    <button
     onClick={() => setIsAddModalOpen(true)}
     className="bg-[#2B3674] dark:bg-white text-white dark:text-[#0B1437] px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity rounded-none"
    >
     <Plus size={18} />
     {t('create_new')}
    </button>
   </div>

   {loading ? (
    <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-2xl border-none p-12 flex flex-col items-center gap-3 shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none">
     <div className="w-8 h-8 border-2 border-[#2B3674] dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
   ) : categories.length === 0 ? (
    <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-2xl border-none p-16 text-center shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none">
     <div className="w-16 h-16 bg-[#F4F7FE] dark:bg-[#000000] rounded-full flex items-center justify-center mx-auto mb-4">
      <Tag className="w-8 h-8 text-gray-900 dark:text-[#fafafa] dark:text-gray-600 dark:text-[#a1a1aa]" />
     </div>
     <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] mb-2">{t('no_categories')}</h3>
     <p className="text-gray-600 dark:text-[#a1a1aa] text-sm mb-6 max-w-sm mx-auto">{t('no_categories_desc')}</p>
     <button
      onClick={() => setIsAddModalOpen(true)}
      className="bg-[#2B3674] dark:bg-white text-white dark:text-[#0B1437] px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mx-auto rounded-none"
     >
      <Plus size={18} />
      {t('create_new')}
     </button>
    </div>
   ) : (
    <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-2xl shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none dark:shadow-none border-none overflow-hidden">
     <div className="overflow-x-auto">
      <table className="min-w-full">
       <thead>
        <tr className="border-b border-gray-100 dark:border-gray-800 bg-[#F4F7FE]/50 dark:bg-[#000000]/30">
         <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 dark:text-[#a1a1aa] uppercase tracking-widest">{t('title')}</th>
         <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-600 dark:text-[#a1a1aa] uppercase tracking-widest">{locale === 'km' ? 'សកម្មភាព' : 'Action'}</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {categories.filter(c => !c.parentCategory).map((mainCategory) => (
         <React.Fragment key={mainCategory._id}>
          {renderCategoryRow(mainCategory)}
          {categories.filter(c => c.parentCategory === mainCategory._id).map((subCategory) => (
           renderCategoryRow(subCategory, true)
          ))}
         </React.Fragment>
        ))}
       </tbody>
      </table>
     </div>
    </div>
   )}

   {/* Add Modal */}
   {isAddModalOpen && typeof window !== 'undefined' && createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${locale === 'km' ? 'font-khmer' : ''}`}>
     <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 border-none rounded-2xl max-w-md w-full shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
       <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{t('create_new')}</h3>
       <button onClick={() => setIsAddModalOpen(false)} className="text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:text-[#fafafa] dark:hover:text-white transition-colors rounded-none">
        <X size={20} />
       </button>
      </div>
      
      <form onSubmit={handleCreateCategory} className="p-6">
       {errorMsg && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">{errorMsg}</div>
       )}
       
       <div className="flex gap-2 mb-6 bg-[#F4F7FE] dark:bg-[#000000] p-1 rounded-lg w-full">
        <button
         type="button"
         onClick={() => {
          setCategoryType('main');
          setNewCategoryParent('');
         }}
         className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${categoryType === 'main' ? 'bg-white dark:bg-[#121212] dark:border dark:border-white/10 text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] shadow-sm' : 'text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:text-[#fafafa] dark:hover:text-white'}`}
        >
         {locale === 'km' ? 'ប្រភេទចម្បង' : 'Main Category'}
        </button>
        <button
         type="button"
         onClick={() => setCategoryType('sub')}
         className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-colors ${categoryType === 'sub' ? 'bg-white dark:bg-[#121212] dark:border dark:border-white/10 text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] shadow-sm' : 'text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:text-[#fafafa] dark:hover:text-white'}`}
        >
         {locale === 'km' ? 'ប្រភេទរង' : 'Subcategory'}
        </button>
       </div>

       <div className="space-y-4">
        <div>
         <div className="flex justify-between mb-1">
          <label className="text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Name (EN)</label>
         </div>
         <input
          type="text"
          required
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onBlur={handleNewCategoryNameBlur}
          className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] focus:ring-2 focus:ring-[#2B3674] dark:focus:ring-white outline-none"
         />
        </div>
        
        <div>
         <div className="flex justify-between mb-1">
          <label className="text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">ឈ្មោះ (KM)</label>
         </div>
         <input
          type="text"
          value={newCategoryNameKm}
          onChange={(e) => setNewCategoryNameKm(e.target.value)}
          onBlur={handleNewCategoryNameKmBlur}
          className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] focus:ring-2 focus:ring-[#2B3674] dark:focus:ring-white outline-none"
         />
        </div>

        {categoryType === 'sub' && (
         <div>
          <label className="block text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] mb-1">Parent Category</label>
          <select
           required
           value={newCategoryParent}
           onChange={(e) => setNewCategoryParent(e.target.value)}
           className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] focus:ring-2 focus:ring-[#2B3674] dark:focus:ring-white outline-none"
          >
           <option value="" disabled>{locale === 'km' ? 'ជ្រើសរើសប្រភេទមេ...' : 'Select Parent Category...'}</option>
           {categories.filter(c => !c.parentCategory).map(c => (
            <option key={c._id} value={c._id}>{getCategoryName(c)}</option>
           ))}
          </select>
         </div>
        )}
       </div>

       <div className="mt-8 flex gap-3">
        <button
         type="button"
         onClick={() => setIsAddModalOpen(false)}
         className="flex-1 py-3 text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] bg-[#F4F7FE] dark:bg-[#000000] rounded-none transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
        >
         {t('cancel')}
        </button>
        <button
         type="submit"
         disabled={submitting || !newCategoryName.trim() || (categoryType === 'sub' && !newCategoryParent)}
         className="flex-1 py-3 text-sm font-bold text-white bg-[#2B3674] dark:bg-white dark:text-[#0B1437] hover:opacity-90 rounded-none transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
         {submitting ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
         ) : (
          t('add')
         )}
        </button>
       </div>
      </form>
     </div>
    </div>,
    document.getElementById('app-root') || document.body
   )}

   {/* Delete Modal */}
   {deleteModal.isOpen && typeof window !== 'undefined' && createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 ${locale === 'km' ? 'font-khmer' : ''}`}>
     <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 border-none rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden">
      {deleteModal.hasProductsError ? (
       <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
         <AlertTriangle size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] mb-2">Cannot Delete Category</h3>
        <p className="text-sm text-gray-500 mb-6">{deleteModal.hasProductsError}</p>
        <button onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-none font-bold text-sm">Okay</button>
       </div>
      ) : (
       <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-4">
         <Trash2 size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#fafafa] mb-2">Delete Category</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete "{deleteModal.categoryName}"?</p>
        <div className="flex gap-3">
         <button onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-2.5 bg-gray-100 dark:bg-[#000000] text-gray-700 dark:text-[#fafafa] rounded-none font-bold text-sm">Cancel</button>
         <button onClick={confirmDeleteCategory} className="flex-1 py-2.5 bg-red-600 text-white rounded-none font-bold text-sm flex justify-center">
          {deleteModal.loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : 'Delete'}
         </button>
        </div>
       </div>
      )}
     </div>
    </div>,
    document.getElementById('app-root') || document.body
   )}
  </div>
 );
}
