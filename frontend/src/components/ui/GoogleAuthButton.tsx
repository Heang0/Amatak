'use client';

import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from '@/navigation';

interface GoogleAuthButtonProps {
  isKm?: boolean;
  role?: 'store_admin' | 'customer';
  redirectPath?: string;
  onError?: (msg: string) => void;
  onSuccess?: (data: any) => void; // custom handler — bypasses default store + redirect
}

function CustomGoogleButton({
  isKm,
  role,
  redirectPath,
  onError,
  onSuccess,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: tokenResponse.access_token,
            role,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || (isKm ? 'ការចូលដោយប្រើ Google បានបរាជ័យ' : 'Google authentication failed'));
        }

        if (onSuccess) {
          // Custom handler (e.g. store profile — uses customer auth store)
          onSuccess(data);
        } else {
          // Default: save to admin store + redirect
          setUser(data);
          if (redirectPath) {
            router.push(redirectPath);
          } else if (data.role === 'superadmin') {
            router.push('/superadmin');
          } else if (data.role === 'store_admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      } catch (err: any) {
        console.error('Google Auth error:', err);
        if (onError) onError(err.message || (isKm ? 'ការចូលដោយប្រើ Google បានបរាជ័យ' : 'Google login error'));
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google Login error:', error);
      if (onError) {
        onError(isKm ? 'ការចូលដោយប្រើ Google មិនបានជោគជ័យ' : 'Google Sign-In was cancelled or failed');
      }
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:shadow-md disabled:opacity-50 group"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
          <span>{isKm ? 'កំពុងភ្ជាប់ Google...' : 'Connecting to Google...'}</span>
        </div>
      ) : (
        <>
          <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="truncate">{isKm ? 'បន្តជាមួយ Google' : 'Continue with Google'}</span>
        </>
      )}
    </button>
  );
}

export default function GoogleAuthButton(props: GoogleAuthButtonProps) {
  const [mounted, setMounted] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-[#050505] opacity-60"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span className="truncate">{props.isKm ? 'បន្តជាមួយ Google' : 'Continue with Google'}</span>
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CustomGoogleButton {...props} />
    </GoogleOAuthProvider>
  );
}
