'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Plus, Trash2, Tag, Edit2, X, Check, AlertTriangle } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{locale === 'km' ? 'គ្រប់គ្រងប្រភេទផលិតផលរបស់អ្នក' : 'Manage your product categories'}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none p-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg font-medium border border-red-200 dark:border-red-800/50">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleCreateCategory} className="mb-8 max-w-4xl">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-gray-900 dark:text-white">{t('create_new')}</label>
            <div className="flex gap-4">
              {newCategoryName && !newCategoryNameKm && (
                <button
                  type="button"
                  onClick={() => handleTranslate(newCategoryName, 'en', 'km', setNewCategoryNameKm, 'create-km')}
                  className="text-xs text-[#E84C3D] hover:underline flex items-center gap-1 font-semibold"
                  disabled={translating === 'create-km'}
                >
                  {translating === 'create-km' ? '...' : (locale === 'km' ? '✨ បកប្រែទៅជាខ្មែរ' : '✨ Translate to KM')}
                </button>
              )}
              {newCategoryNameKm && !newCategoryName && (
                <button
                  type="button"
                  onClick={() => handleTranslate(newCategoryNameKm, 'km', 'en', setNewCategoryName, 'create-en')}
                  className="text-xs text-[#E84C3D] hover:underline flex items-center gap-1 font-semibold"
                  disabled={translating === 'create-en'}
                >
                  {translating === 'create-en' ? '...' : (locale === 'km' ? '✨ បកប្រែទៅជាអង់គ្លេស' : '✨ Translate to EN')}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => {
                  setCategoryType('main');
                  setNewCategoryParent('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${categoryType === 'main' ? 'bg-[#F4F7FE] dark:bg-[#080808] text-gray-900 dark:text-white ' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white'}`}
              >
                {locale === 'km' ? 'ប្រភេទចម្បង' : 'Main Category'}
              </button>
              <button
                type="button"
                onClick={() => setCategoryType('sub')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${categoryType === 'sub' ? 'bg-[#F4F7FE] dark:bg-[#080808] text-gray-900 dark:text-white ' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white'}`}
              >
                {locale === 'km' ? 'ប្រភេទរង' : 'Subcategory'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <input
                type="text"
                required
                placeholder="Name (EN)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onBlur={handleNewCategoryNameBlur}
                className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#080808] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
              />
              <input
                type="text"
                placeholder="ឈ្មោះ (KM)"
                value={newCategoryNameKm}
                onChange={(e) => setNewCategoryNameKm(e.target.value)}
                onBlur={handleNewCategoryNameKmBlur}
                className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#080808] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
              />
              
              {categoryType === 'sub' && (
                <select
                  required
                  value={newCategoryParent}
                  onChange={(e) => setNewCategoryParent(e.target.value)}
                  className="w-full px-4 py-3 border-none rounded-xl bg-[#F4F7FE] dark:bg-[#080808] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                >
                  <option value="" disabled>{locale === 'km' ? 'ជ្រើសរើសប្រភេទមេ...' : 'Select Parent Category...'}</option>
                  {categories.filter(c => !c.parentCategory).map(c => (
                    <option key={c._id} value={c._id}>{getCategoryName(c)}</option>
                  ))}
                </select>
              )}
              
              <div className={`flex ${categoryType === 'main' ? 'sm:col-span-2' : ''}`}>
                <button
                  type="submit"
                  disabled={submitting || !newCategoryName.trim() || (categoryType === 'sub' && !newCategoryParent)}
                  className="w-full sm:w-auto bg-[#E84C3D] hover:bg-[#d63d2e] text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  {submitting ? t('adding') : t('add')}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/[0.05]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('existing')}</h3>
          
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-sm">
              <Tag className="w-12 h-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('no_categories')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('no_categories_desc')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.filter(c => !c.parentCategory).map((mainCategory) => {
                const subcategories = categories.filter(c => c.parentCategory === mainCategory._id);
                return (
                  <div key={mainCategory._id} className="space-y-3">
                    {/* Main Category */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F4F7FE] dark:bg-[#080808] transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111111] flex items-center justify-center text-[#E84C3D] shrink-0 shadow-sm">
                          <Tag size={20} />
                        </div>
                        {editingCategory?._id === mainCategory._id ? (
                          <div className="flex-1 space-y-2 max-w-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Edit Category</span>
                              <div className="flex gap-2">
                                {editCategoryName && !editCategoryNameKm && (
                                  <button
                                    type="button"
                                    onClick={() => handleTranslate(editCategoryName, 'en', 'km', setEditCategoryNameKm, `edit-km-${mainCategory._id}`)}
                                    className="text-[10px] text-[#E84C3D] hover:underline font-semibold"
                                    disabled={translating === `edit-km-${mainCategory._id}`}
                                  >
                                    {translating === `edit-km-${mainCategory._id}` ? '...' : '✨ to KM'}
                                  </button>
                                )}
                                {editCategoryNameKm && !editCategoryName && (
                                  <button
                                    type="button"
                                    onClick={() => handleTranslate(editCategoryNameKm, 'km', 'en', setEditCategoryName, `edit-en-${mainCategory._id}`)}
                                    className="text-[10px] text-[#E84C3D] hover:underline font-semibold"
                                    disabled={translating === `edit-en-${mainCategory._id}`}
                                  >
                                    {translating === `edit-en-${mainCategory._id}` ? '...' : '✨ to EN'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="Name (EN)"
                                  value={editCategoryName}
                                  onChange={(e) => setEditCategoryName(e.target.value)}
                                  onBlur={() => handleEditCategoryNameBlur(mainCategory._id)}
                                  className="flex-1 w-full px-3 py-1.5 border-none rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                                  autoFocus
                                />
                                <input
                                  type="text"
                                  placeholder="ឈ្មោះ (KM)"
                                  value={editCategoryNameKm}
                                  onChange={(e) => setEditCategoryNameKm(e.target.value)}
                                  onBlur={() => handleEditCategoryNameKmBlur(mainCategory._id)}
                                  className="flex-1 w-full px-3 py-1.5 border-none rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
                                />
                              </div>
                              <select
                                value={editCategoryParent}
                                onChange={(e) => setEditCategoryParent(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none text-sm"
                              >
                                <option value="">{locale === 'km' ? 'គ្មានប្រភេទមេ' : 'No Parent'}</option>
                                {categories.filter(c => !c.parentCategory && c._id !== mainCategory._id).map(c => (
                                  <option key={c._id} value={c._id}>{getCategoryName(c)}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateCategory(mainCategory._id)}
                                className="flex-1 sm:flex-none p-1.5 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors border border-green-200 dark:border-green-800 sm:border-transparent"
                                title={t('save')}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="flex-1 sm:flex-none p-1.5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors border-none sm:border-transparent"
                                title={t('cancel')}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                              {getCategoryName(mainCategory)} <span className="text-gray-600 dark:text-gray-400 text-sm font-normal">{getSecondaryCategoryName(mainCategory) ? ` / ${getSecondaryCategoryName(mainCategory)}` : ''}</span>
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">/{mainCategory.slug}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {editingCategory?._id !== mainCategory._id && (
                          <button
                            onClick={() => {
                              setEditingCategory(mainCategory);
                              setEditCategoryName(mainCategory.name);
                              setEditCategoryNameKm(mainCategory.nameKm || '');
                              setEditCategoryParent(mainCategory.parentCategory || '');
                            }}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#E84C3D] rounded-lg transition-colors"
                            title={t('edit')}
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                        <button
                           onClick={() => openDeleteModal(mainCategory)}
                           className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                           title={t('delete')}
                         >
                           <Trash2 size={18} />
                         </button>
                      </div>
                    </div>

                    {/* Subcategories */}
                    {subcategories.length > 0 && (
                      <div className="pl-6 md:pl-10 space-y-2 relative before:absolute before:left-[27px] md:before:left-[43px] before:top-0 before:bottom-4 before:w-px before:bg-gray-200 dark:before:bg-gray-800">
                        {subcategories.map((subCategory) => (
                          <div key={subCategory._id} className="relative flex items-center justify-between p-3 rounded-xl bg-[#F4F7FE] dark:bg-[#080808] transition-colors">
                            <div className="absolute left-[-23px] top-1/2 w-4 h-px bg-gray-200 dark:bg-gray-800"></div>
                            <div className="flex items-center gap-3 flex-1">
                              {editingCategory?._id === subCategory._id ? (
                                <div className="flex-1 space-y-2 max-w-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Edit Subcategory</span>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-col sm:flex-row gap-2">
                                      <input
                                        type="text"
                                        placeholder="Name (EN)"
                                        value={editCategoryName}
                                        onChange={(e) => setEditCategoryName(e.target.value)}
                                        onBlur={() => handleEditCategoryNameBlur(subCategory._id)}
                                        className="flex-1 w-full px-3 py-1.5 border-none rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none text-sm"
                                        autoFocus
                                      />
                                      <input
                                        type="text"
                                        placeholder="ឈ្មោះ (KM)"
                                        value={editCategoryNameKm}
                                        onChange={(e) => setEditCategoryNameKm(e.target.value)}
                                        onBlur={() => handleEditCategoryNameKmBlur(subCategory._id)}
                                        className="flex-1 w-full px-3 py-1.5 border-none rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none text-sm"
                                      />
                                    </div>
                                    <select
                                      value={editCategoryParent}
                                      onChange={(e) => setEditCategoryParent(e.target.value)}
                                      className="w-full px-3 py-1.5 border-none rounded-lg bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none text-sm"
                                    >
                                      <option value="">{locale === 'km' ? 'គ្មានប្រភេទមេ' : 'No Parent'}</option>
                                      {categories.filter(c => !c.parentCategory && c._id !== subCategory._id).map(c => (
                                        <option key={c._id} value={c._id}>{getCategoryName(c)}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleUpdateCategory(subCategory._id)}
                                      className="flex-1 sm:flex-none p-1 flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors border border-green-200 dark:border-green-800 sm:border-transparent"
                                      title={t('save')}
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingCategory(null)}
                                      className="flex-1 sm:flex-none p-1 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors border-none sm:border-transparent"
                                      title={t('cancel')}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{subCategory.name.en || subCategory.name}</p>
                                  {subCategory.name.km && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{subCategory.name.km}</p>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 z-10">
                              {editingCategory?._id !== subCategory._id && (
                                <button
                                  onClick={() => {
                                    setEditingCategory(subCategory);
                                    setEditCategoryName(subCategory.name);
                                    setEditCategoryNameKm(subCategory.nameKm || '');
                                    setEditCategoryParent(subCategory.parentCategory || '');
                                  }}
                                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-[#E84C3D] rounded-md transition-colors"
                                  title={t('edit')}
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                              <button
                                 onClick={() => openDeleteModal(subCategory)}
                                 className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-500 rounded-md transition-colors"
                                 title={t('delete')}
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Custom Delete Confirmation & Error Modal */}
      {deleteModal.isOpen && typeof window !== 'undefined' && createPortal(
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${locale === 'km' ? 'font-khmer' : ''}`}>
          <div className="bg-white dark:bg-[#111111] border-none rounded-3xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden transition-all transform scale-100 duration-300">
            {deleteModal.hasProductsError ? (
              // Warning screen (has products)
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-955/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/30">
                  <AlertTriangle size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {locale === 'km' ? 'មិនអាចលុបប្រភេទបានទេ' : 'Cannot Delete Category'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 px-2 whitespace-pre-wrap leading-relaxed">
                  {deleteModal.hasProductsError}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '', hasProductsError: null, loading: false })}
                  className="w-full bg-gray-900 dark:bg-white text-white hover:bg-gray-800 dark:hover:bg-gray-100 font-semibold px-5 py-3 rounded-2xl text-sm transition-colors text-center shadow-md focus:outline-none"
                >
                  {locale === 'km' ? 'បិទ' : 'Okay, I understand'}
                </button>
              </div>
            ) : (
              // Confirmation screen
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800/30">
                  <Trash2 size={26} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {locale === 'km' ? 'លុបប្រភេទផលិតផល' : 'Delete Category'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {locale === 'km'
                    ? `តើអ្នកពិតជាចង់លុបប្រភេទ "${deleteModal.categoryName}" នេះមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានឡើយ។`
                    : `Are you sure you want to delete the category "${deleteModal.categoryName}"? This action cannot be undone.`}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={() => setDeleteModal({ isOpen: false, categoryId: null, categoryName: '', hasProductsError: null, loading: false })}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold px-5 py-3 rounded-2xl text-sm transition-colors disabled:opacity-50"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={deleteModal.loading}
                    onClick={confirmDeleteCategory}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50"
                  >
                    {deleteModal.loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      locale === 'km' ? 'លុប' : 'Delete'
                    )}
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
