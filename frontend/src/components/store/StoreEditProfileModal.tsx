'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import { useCustomerAuthStore } from '@/lib/store/useCustomerAuthStore';

interface StoreEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
  themeStyle: string;
  isKm: boolean;
}

export default function StoreEditProfileModal({ isOpen, onClose, isKm }: StoreEditProfileModalProps) {
  const user = useCustomerAuthStore(state => state.customerInfo);
  const setCustomerInfo = useCustomerAuthStore(state => state.setCustomerInfo);
  
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const body: any = { name };
      if (password) body.password = password;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setCustomerInfo({
        ...user,
        name: data.name,
      });

      setSuccess(isKm ? 'បានធ្វើបច្ចុប្បន្នភាពគណនីដោយជោគជ័យ!' : 'Profile updated successfully!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 text-xs sm:text-sm font-medium bg-white dark:bg-[#111318] text-gray-900 dark:text-white border border-gray-300 dark:border-white/15 focus:border-black dark:focus:border-white rounded-none outline-none transition-all";

  const buttonClass = `w-full py-3.5 px-4 text-xs font-bold ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-center transition-all bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-none shadow-xs`;

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs ${isKm ? 'font-khmer' : ''}`}>
      <div className="w-full max-w-md bg-white dark:bg-[#111318] rounded-none border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden space-y-5">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
          <h2 className={`text-xs font-black ${isKm ? 'tracking-normal' : 'uppercase tracking-widest'} text-gray-900 dark:text-white`}>
            {isKm ? 'កែប្រែគណនី' : 'EDIT PROFILE'}
          </h2>
          <button onClick={onClose} className="p-1 -mr-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 pt-0">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-none text-xs font-medium border border-red-200 dark:border-red-900/30">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-none text-xs font-medium border border-green-200 dark:border-green-900/30">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'ឈ្មោះ' : 'Name'}</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">{isKm ? 'លេខសម្ងាត់ថ្មី (ស្រេចចិត្ត)' : 'New Password (Optional)'}</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              minLength={6}
            />
            <p className="text-[11px] text-gray-400 mt-1">{isKm ? 'ទុកវាទទេប្រសិនបើអ្នកមិនចង់ផ្លាស់ប្តូរ' : 'Leave blank to keep current password'}</p>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className={buttonClass}
            >
              {loading ? <Loader2 className="w-4 h-4 mx-auto animate-spin" /> : (isKm ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'SAVE CHANGES')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('app-root') || document.body
  );
}
