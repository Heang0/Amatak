'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, X, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';

interface TelegramWidgetProps {
  botUsername?: string;
  onAuth: (user: any) => void;
  isKm?: boolean;
}

export default function TelegramLoginWidget({ botUsername, onAuth, isKm }: TelegramWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [deepLink, setDeepLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeBotUsername = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'amatakshop_bot';

  useEffect(() => {
    setMounted(true);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleDirectLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/telegram/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok || !data.sessionId) {
        throw new Error(data.message || 'Failed to initialize Telegram login session');
      }

      const sessionLink = data.deepLink || `https://t.me/${activeBotUsername}?start=login_${data.sessionId}`;
      setDeepLink(sessionLink);
      setIsWaiting(true);
      setLoading(false);

      // Open Telegram deep link in new window/tab
      window.open(sessionLink, '_blank', 'noopener,noreferrer');

      // Start polling for session authentication
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      const startTime = Date.now();
      pollIntervalRef.current = setInterval(async () => {
        // Stop polling after 4 minutes
        if (Date.now() - startTime > 240000) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setIsWaiting(false);
          setError(isKm ? 'សម័យចូលប្រើប្រាស់បានផុតកំណត់។ សូមសាកល្បងម្ដងទៀត។' : 'Login session timed out. Please try again.');
          return;
        }

        try {
          const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/telegram/session/${data.sessionId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.status === 'authenticated' && checkData.user) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setIsWaiting(false);
              onAuth(checkData.user);
            }
          }
        } catch (e) {
          // ignore transient poll error
        }
      }, 1500);

    } catch (err: any) {
      console.error('Telegram session login error:', err);
      setError(err.message || 'Unable to connect with Telegram');
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setIsWaiting(false);
  };

  if (!mounted) return null;

  return (
    <>
      <div className="w-full">
        {error && (
          <div className="mb-2 p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-none border border-red-200 dark:border-red-900/30 text-center">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleDirectLogin}
          disabled={loading}
          className="w-full py-3 px-4 text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white rounded-none shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.718-1.574 7.42-2.28 10.741-.299 1.404-.97 1.637-1.637 1.637-.997 0-1.748-.75-2.716-1.385-1.516-.997-2.37-1.62-3.837-2.587-.718-.475-.246-1.127.172-1.558.11-.113 2.01-1.844 3.69-3.4 1.68-1.557.067-.067-1.87 1.258-2.67 1.821-3.79 2.587-5.306 1.591-.718-.475-1.386-.718-1.386-1.282 0-.629.785-.997 2.14-1.535 5.306-2.302 8.85-3.824 10.63-4.57 2.96-1.242 3.57-1.455 3.97-1.455.088 0 .285.02.414.125.109.088.139.208.152.292.014.084.032.274.018.423z"/>
            </svg>
          )}
          <span>{isKm ? 'ចូលគណនីតាមរយៈ Telegram' : 'Continue with Telegram'}</span>
        </button>
      </div>

      {/* Waiting for Telegram Confirmation Modal */}
      {isWaiting && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#111318] border border-gray-200 dark:border-white/10 rounded-none shadow-2xl p-6 relative text-center space-y-4">
            
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              title="Cancel"
            >
              <X size={18} />
            </button>

            {/* Telegram Icon with radar ripple */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-[#229ED9]/20 rounded-full animate-ping" />
              <div className="w-14 h-14 bg-[#229ED9] text-white rounded-full flex items-center justify-center relative shadow-md">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.718-1.574 7.42-2.28 10.741-.299 1.404-.97 1.637-1.637 1.637-.997 0-1.748-.75-2.716-1.385-1.516-.997-2.37-1.62-3.837-2.587-.718-.475-.246-1.127.172-1.558.11-.113 2.01-1.844 3.69-3.4 1.68-1.557.067-.067-1.87 1.258-2.67 1.821-3.79 2.587-5.306 1.591-.718-.475-1.386-.718-1.386-1.282 0-.629.785-.997 2.14-1.535 5.306-2.302 8.85-3.824 10.63-4.57 2.96-1.242 3.57-1.455 3.97-1.455.088 0 .285.02.414.125.109.088.139.208.152.292.014.084.032.274.018.423z"/>
                </svg>
              </div>
            </div>

            <div>
              <h3 className={`text-base font-bold text-gray-900 dark:text-white ${isKm ? 'font-khmer' : 'uppercase tracking-wider'}`}>
                {isKm ? 'កំពុងរង់ចាំការបញ្ជាក់' : 'Confirm in Telegram'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                {isKm 
                  ? 'សូមបើក Telegram ហើយចុច "Start" ដើម្បីបញ្ចប់ការចូលគណនី។' 
                  : 'Please open Telegram and tap "Start" to complete your sign in.'}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-black rounded-none shadow-xs"
              >
                <span>{isKm ? 'បើកកម្មវិធី Telegram' : 'Open Telegram'}</span>
                <ExternalLink size={13} />
              </a>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                {isKm ? 'បោះបង់' : 'Cancel'}
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
