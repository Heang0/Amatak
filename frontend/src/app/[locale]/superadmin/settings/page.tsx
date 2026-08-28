'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { User } from 'lucide-react';

export default function SuperadminSettings() {
 const user = useAuthStore((state) => state.user);
 const setUser = useAuthStore((state) => state.setUser);
 
 const [formData, setFormData] = useState({
  name: user?.name || '',
  password: '',
  profilePic: user?.profilePic || ''
 });
 
 const [loading, setLoading] = useState(false);
 const [successMsg, setSuccessMsg] = useState('');
 const [uploading, setUploading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setSuccessMsg('');

  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
    method: 'PUT',
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${user?.token}`
    },
    body: JSON.stringify(formData)
   });

   const data = await res.json();
   if (res.ok) {
    setSuccessMsg('Profile updated successfully!');
    // Update user store
    if (user) setUser({ ...user, ...data, token: user.token });
   } else {
    alert(data.message || 'Failed to update profile');
   }
  } catch (err) {
   console.error(err);
   alert('Network error');
  } finally {
   setLoading(false);
  }
 };

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploading(true);
  const uploadData = new FormData();
  uploadData.append('image', file);

  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${user?.token}` },
    body: uploadData
   });
   const data = await res.json();
   if (res.ok) {
    setFormData({ ...formData, profilePic: data.url });
   } else {
    alert(data.message || 'Image upload failed');
   }
  } catch (err) {
   console.error(err);
   alert('Upload error');
  } finally {
   setUploading(false);
  }
 };

 return (
  <div className="max-w-3xl mx-auto space-y-8">
   <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>

   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-none shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-none border-none p-8">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Information</h3>
    
    {successMsg && (
     <div className="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-none font-medium border border-green-200 dark:border-green-800/50">
      {successMsg}
     </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
     <div className="flex items-center space-x-6">
      <div className="shrink-0">
       <div className="h-24 w-24 rounded-none bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-none dark:border-gray-700">
        {formData.profilePic ? (
         <img src={formData.profilePic} alt="Profile" className="h-full w-full object-cover" />
        ) : (
         <User className="w-10 h-10 text-gray-600 dark:text-[#a1a1aa]" />
        )}
       </div>
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
       <div className="flex items-center space-x-4">
        <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-[#F4F7FE] dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-none font-medium transition-colors">
         {uploading ? 'Uploading...' : 'Upload Image'}
         <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
        </label>
       </div>
      </div>
     </div>

     <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
      <input
       type="text"
       required
       value={formData.name}
       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-none bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
      />
     </div>

     <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
      <input
       type="password"
       placeholder="Leave blank to keep current password"
       value={formData.password}
       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
       className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-none bg-[#F4F7FE] dark:bg-[#000000] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#E84C3D] outline-none"
      />
     </div>

     <div className="pt-4 border-t border-none border-none">
      <button
       type="submit"
       disabled={loading || uploading}
       className="bg-[#E84C3D] text-white px-6 py-3 rounded-none font-semibold hover:bg-red-600 transition-colors shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none disabled:opacity-50"
      >
       {loading ? 'Saving...' : 'Save Changes'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
