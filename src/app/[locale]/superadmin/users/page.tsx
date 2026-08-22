'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface User {
 _id: string;
 name: string;
 email: string;
 role: string;
 telegramId?: string;
 createdAt: string;
}

export default function SuperadminUsersPage() {
 const user = useAuthStore((state) => state.user);
 const [users, setUsers] = useState<User[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchUsers = async () => {
   try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/superadmin/users`, {
     headers: { Authorization: `Bearer ${user?.token}` }
    });
    const data = await res.json();
    if (res.ok) setUsers(data);
   } catch (err) {
    console.error('Error fetching users:', err);
   } finally {
    setLoading(false);
   }
  };

  if (user?.token) fetchUsers();
 }, [user]);

 if (loading) {
  return <div className="p-8 text-center text-gray-600 dark:text-[#a1a1aa]">Loading users...</div>;
 }

 return (
  <div className="space-y-6">
   <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">All Platform Users</h2>
    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-[#a1a1aa] dark:text-[#d4d4d8] rounded-full text-sm font-medium">
     Total: {users.length}
    </span>
   </div>

   <div className="bg-white dark:bg-[#121212] dark:border dark:border-white/10 rounded-[20px] shadow-[0_18px_40px_rgba(112,144,176,0.12)] dark:shadow-none border border-none border-none overflow-hidden">
    <div className="overflow-x-auto">
     <table className="w-full text-left text-sm">
      <thead className="bg-[#F4F7FE] dark:bg-[#000000] border-b border-none border-none">
       <tr>
        <th className="px-6 py-4 font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Name</th>
        <th className="px-6 py-4 font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Email</th>
        <th className="px-6 py-4 font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Role</th>
        <th className="px-6 py-4 font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Telegram Link</th>
        <th className="px-6 py-4 font-bold text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">Joined Date</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-white/10">
       {users.map((u) => (
        <tr key={u._id} className="hover:bg-[#F4F7FE] dark:hover:bg-gray-900/50 transition-colors">
         <td className="px-6 py-4 font-medium text-gray-900 dark:text-[#fafafa] dark:text-[#fafafa]">{u.name}</td>
         <td className="px-6 py-4 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">{u.email || '-'}</td>
         <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
           u.role === 'superadmin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
           u.role === 'store_admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
           'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-600 dark:text-[#a1a1aa]'
          }`}>
           {u.role.replace('_', ' ')}
          </span>
         </td>
         <td className="px-6 py-4 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">
          {u.telegramId ? 'Linked (ID: ' + u.telegramId + ')' : '-'}
         </td>
         <td className="px-6 py-4 text-gray-600 dark:text-[#a1a1aa] dark:text-gray-600 dark:text-[#a1a1aa]">
          {new Date(u.createdAt).toLocaleDateString()}
         </td>
        </tr>
       ))}
       {users.length === 0 && (
        <tr>
         <td colSpan={5} className="px-6 py-8 text-center text-gray-600 dark:text-[#a1a1aa]">
          No users found.
         </td>
        </tr>
       )}
      </tbody>
     </table>
    </div>
   </div>
  </div>
 );
}
