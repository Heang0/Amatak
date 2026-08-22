'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Plan {
 _id: string;
 name: string;
 price: number;
 durationDays: number;
 maxProducts: number;
}

export default function PlansManagement() {
 const user = useAuthStore((state) => state.user);
 const [plans, setPlans] = useState<Plan[]>([]);
 const [loading, setLoading] = useState(true);

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
 const [formData, setFormData] = useState({
  name: '',
  price: 0,
  durationDays: 30,
  maxProducts: 100
 });

 useEffect(() => {
  fetchPlans();
 }, []);

 const fetchPlans = async () => {
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/plans`, {
    headers: { Authorization: `Bearer ${user?.token}` }
   });
   const data = await res.json();
   if (res.ok) setPlans(data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 const handleOpenModal = (plan?: Plan) => {
  if (plan) {
   setEditingPlan(plan);
   setFormData({
    name: plan.name,
    price: plan.price,
    durationDays: plan.durationDays,
    maxProducts: plan.maxProducts
   });
  } else {
   setEditingPlan(null);
   setFormData({ name: '', price: 0, durationDays: 30, maxProducts: 100 });
  }
  setIsModalOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
   const url = editingPlan 
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/plans/${editingPlan._id}`
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/plans`;
    
   const method = editingPlan ? 'PUT' : 'POST';

   const res = await fetch(url, {
    method,
    headers: {
     'Content-Type': 'application/json',
     Authorization: `Bearer ${user?.token}`
    },
    body: JSON.stringify(formData)
   });

   if (res.ok) {
    setIsModalOpen(false);
    fetchPlans();
   } else {
    const data = await res.json();
    alert(data.message || 'Error saving plan');
   }
  } catch (err) {
   console.error(err);
   alert('Network error');
  }
 };

 const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this plan?')) return;
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/plans/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${user?.token}` }
   });
   if (res.ok) {
    fetchPlans();
   } else {
    alert('Failed to delete plan');
   }
  } catch (err) {
   console.error(err);
  }
 };

 return (
  <div className="space-y-6 max-w-5xl mx-auto">
   <div className="flex justify-between items-center">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Manage Plans</h2>
   </div>

   {loading ? (
    <p className="text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">Loading plans...</p>
   ) : (
    <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-none border-none overflow-hidden">
     <table className="min-w-full divide-y divide-[#F4F7FE] dark:divide-white/10">
      <thead className="bg-[#F4F7FE] dark:bg-[#000000]">
       <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">Plan Name</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">Price (USD)</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">Duration</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">Limits</th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] uppercase tracking-wider">Actions</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-[#F4F7FE] dark:divide-white/10">
       {plans.map((plan) => (
        <tr key={plan._id} className="hover:bg-[#F4F7FE] dark:hover:bg-gray-800/50 transition-colors">
         <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{plan.name}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-[#d4d4d8] font-medium">${plan.price}</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-[#d4d4d8]">{plan.durationDays} Days</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-[#d4d4d8]">{plan.maxProducts} Products</td>
         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button onClick={() => handleOpenModal(plan)} className="text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] hover:text-[#E84C3D] mr-4 transition-colors">Edit Price</button>
         </td>
        </tr>
       ))}
       {plans.length === 0 && (
        <tr>
         <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">
          No plans found. Create one to get started.
         </td>
        </tr>
       )}
      </tbody>
     </table>
    </div>
   )}

   {/* Modal */}
   {isModalOpen && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
     <div className="bg-white dark:bg-gray-900 rounded-[20px] shadow-2xl p-8 max-w-md w-full border border-none border-none">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] mb-6">
       Edit Plan Price
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8] mb-1">Plan Name</label>
        <input
         type="text"
         required
         value={formData.name}
         disabled
         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] focus:ring-2 focus:ring-[#E84C3D] outline-none cursor-not-allowed"
        />
       </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8] mb-1">Price (USD)</label>
         <input
          type="number"
          step="0.01"
          required
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          disabled={formData.name === 'Free'}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[#F4F7FE] dark:bg-[#121212] dark:border dark:border-white/10 text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa] focus:ring-2 focus:ring-[#E84C3D] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8] mb-1">Duration (Days)</label>
         <input
          type="number"
          required
          value={formData.durationDays}
          disabled
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] focus:ring-2 focus:ring-[#E84C3D] outline-none cursor-not-allowed"
         />
        </div>
       </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8] mb-1">Max Products</label>
        <input
         type="number"
         required
         value={formData.maxProducts}
         disabled
         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] focus:ring-2 focus:ring-[#E84C3D] outline-none cursor-not-allowed"
        />
       </div>
       
       <div className="mt-8 flex justify-end space-x-3">
        <button
         type="button"
         onClick={() => setIsModalOpen(false)}
         className="px-5 py-2 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa] hover:text-gray-900 dark:text-[#fafafa] dark:hover:text-white font-medium"
        >
         Cancel
        </button>
        <button
         type="submit"
         className="px-5 py-2 bg-[#E84C3D] text-white rounded-lg font-medium hover:bg-red-600 transition-colors shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none"
        >
         Save Changes
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}
