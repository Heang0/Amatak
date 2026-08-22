'use client';

import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from '@/navigation';

interface GoogleAuthButtonProps {
  isKm?: boolean;
  role?: 'store_admin' | 'customer';
  redirectPath?: string;
  onError?: (msg: string) => void;
}

function GoogleLoginInner({
  isKm,
  role,
  redirectPath,
  onError,
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      if (onError) onError(isKm ? 'ការចូលដោយប្រើ Google បានបរាជ័យ' : 'Google credential not received');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isKm ? 'ការចូលដោយប្រើ Google បានបរាជ័យ' : 'Google authentication failed'));
      }

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
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (onError) onError(err.message || (isKm ? 'ការចូលដោយប្រើ Google បានបរាជ័យ' : 'Google login error'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    if (onError) {
      onError(isKm ? 'ការចូលដោយប្រើ Google មិនបានជោគជ័យ' : 'Google Sign-In was cancelled or failed');
    }
  };

  if (loading) {
    return (
      <div className="py-2.5 flex items-center justify-center gap-2 text-sm text-gray-500">
        <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
        <span>{isKm ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Authenticating...'}</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center [&>div]:!w-full [&>div>iframe]:!w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        shape="rectangular"
        theme="outline"
        size="large"
        width="100%"
        text={role === 'store_admin' ? 'continue_with' : 'signin_with'}
      />
    </div>
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
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#050505] hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        <span>{props.isKm ? 'បន្តជាមួយ Google' : 'Continue with Google'}</span>
      </button>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLoginInner {...props} />
    </GoogleOAuthProvider>
  );
}
