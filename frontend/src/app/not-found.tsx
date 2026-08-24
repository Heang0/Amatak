'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] text-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">404</h1>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-2">Page Not Found</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">The requested page or store could not be found.</p>
        <Link href="/" className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-[#E84C3D] hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-500/20">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
