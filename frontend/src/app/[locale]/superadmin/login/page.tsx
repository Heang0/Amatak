'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Link, useRouter } from '@/navigation';

export default function SuperadminLoginPage() {
  const t = useTranslations('Index');
  const router = useRouter();
  const params = useParams();
  const isKm = params?.locale === 'km';
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // SECURITY: Calls the strict superadmin-only endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/superadmin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data);
      router.push('/superadmin');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#050505] flex flex-col justify-center transition-colors duration-300 overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <img 
              src="/logo/logo-website.png" 
              alt="Amatak Logo" 
              className="h-14 w-auto object-contain" 
            />
          </Link>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          {isKm ? 'ចូលគណនីគ្រប់គ្រងកំពូល' : 'Superadmin Portal'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#111111] py-8 px-4 shadow-xl sm:rounded-[2rem] sm:px-10 border border-gray-100 dark:border-gray-800">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-200 dark:border-red-800/50">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isKm ? 'អ៊ីមែលគ្រប់គ្រងកំពូល' : 'Superadmin Email'}
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-[#E84C3D] focus:border-[#E84C3D] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isKm ? 'ពាក្យសម្ងាត់' : 'Password'}
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-[#E84C3D] focus:border-[#E84C3D] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#E84C3D] hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84C3D] disabled:opacity-50 transition-colors"
              >
                {loading ? (isKm ? 'កំពុងចូល...' : 'Authenticating...') : (isKm ? 'ចូលគណនីសុវត្ថិភាព' : 'Secure Login')}
              </button>
            </div>
          </form>
            
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
            {isKm 
              ? 'ការព្រមាន៖ ការចូលដោយគ្មានការអនុញ្ញាត ត្រូវបានហាមឃាត់យ៉ាងតឹងរ៉ឹង និងត្រូវបានកត់ត្រា។'
              : 'Warning: Unauthorized access to this system is strictly prohibited and logged.'}
          </p>

        </div>
      </div>
    </div>
  );
}
