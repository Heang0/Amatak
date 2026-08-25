'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Users, Shield, Send, CheckCircle2, Search } from 'lucide-react';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  telegramId?: string;
  createdAt: string;
}

export default function SuperadminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Platform Users
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Registered platform accounts, store merchants, and super administrators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-xs font-medium pl-9 pr-4 py-2.5 rounded-2xl placeholder-gray-400 focus:outline-none"
            />
          </div>
          <span className="px-3.5 py-2 bg-white dark:bg-[#13161F] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-gray-300 rounded-2xl text-xs font-bold shadow-xs shrink-0">
            Total: {users.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl">
          <div className="w-8 h-8 border-3 border-red-500/20 border-t-[#E84C3D] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#13161F] border border-gray-200/80 dark:border-white/[0.06] rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Telegram Linked</th>
                  <th className="py-4 pr-6 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03] text-sm font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      {u.email || <span className="text-gray-400 italic">No email</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        u.role === 'superadmin'
                          ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                          : u.role === 'store_admin'
                          ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {u.role === 'superadmin' ? 'Superadmin' : u.role === 'store_admin' ? 'Store Admin' : 'Customer'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.telegramId ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
                          <Send size={12} /> ID: {u.telegramId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 pr-6 text-right text-xs text-gray-500 dark:text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                      No users match your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
