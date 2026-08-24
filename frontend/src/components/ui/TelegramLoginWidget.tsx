'use client';

import { useEffect, useRef, useState } from 'react';

interface TelegramWidgetProps {
  botUsername?: string;
  onAuth: (user: any) => void;
  isKm?: boolean;
}

export default function TelegramLoginWidget({ botUsername, onAuth, isKm }: TelegramWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [waitingForApp, setWaitingForApp] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  const activeBotUsername = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'amatakshop_bot';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Direct 1-Click Login via Telegram App (Zero Phone Numbers Required)
  const handleDirectAppLogin = async () => {
    setIsDirectLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/telegram/session`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.sessionId) {
        throw new Error(data.message || 'Failed to create Telegram session');
      }

      // Open Telegram App Deep Link
      window.open(data.deepLink, '_blank');
      setWaitingForApp(true);

      // Poll for completion
      const interval = setInterval(async () => {
        try {
          const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/telegram/session/${data.sessionId}`);
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.status === 'authenticated' && checkData.user) {
              clearInterval(interval);
              setWaitingForApp(false);
              setIsDirectLoading(false);
              onAuth(checkData.user);
            }
          }
        } catch (pollErr) {
          console.error('Session poll error:', pollErr);
        }
      }, 1500);

      // Timeout polling after 3 minutes
      setTimeout(() => {
        clearInterval(interval);
        setWaitingForApp(false);
        setIsDirectLoading(false);
      }, 3 * 60 * 1000);

    } catch (err: any) {
      console.error('Direct app login error:', err);
      setIsDirectLoading(false);
      setWaitingForApp(false);
    }
  };

  // Official Widget Loader
  useEffect(() => {
    if (!mounted || !activeBotUsername || !containerRef.current) return;

    setWidgetError(false);

    (window as any).TelegramLoginWidget = {
      dataOnauth: (user: any) => onAuth(user),
    };

    containerRef.current.innerHTML = '';

    const oldScript = document.getElementById('telegram-widget-script');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = 'telegram-widget-script';
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', activeBotUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.async = true;

    script.onerror = () => {
      setWidgetError(true);
    };

    containerRef.current.appendChild(script);

    return () => {
      if ((window as any).TelegramLoginWidget) {
        delete (window as any).TelegramLoginWidget;
      }
    };
  }, [mounted, activeBotUsername, onAuth, isKm]);

  if (!mounted) return null;

  return (
    <div className="space-y-3 w-full">
      {/* 1-Click Direct Login Button (Opens Telegram App directly) */}
      <button
        type="button"
        onClick={handleDirectAppLogin}
        disabled={isDirectLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-[#24A1DE] hover:bg-[#1f91ca] active:scale-[0.98] transition-all shadow-sky-500/20 disabled:opacity-75 group"
      >
        {waitingForApp ? (
          <div className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{isKm ? 'កំពុងរង់ចាំការបញ្ជាក់ពី Telegram...' : 'Waiting for Telegram confirmation...'}</span>
          </div>
        ) : (
          <>
            <svg className="w-5 h-5 fill-current shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            <span>{isKm ? 'ចូលតាម Telegram App (1-Click)' : 'Open in Telegram App (1-Click)'}</span>
          </>
        )}
      </button>

      {/* Embedded Telegram Widget Container (Hidden if direct button is used, or as secondary option) */}
      {!widgetError && (
        <div className="flex justify-center w-full overflow-hidden rounded-xl" ref={containerRef} />
      )}
    </div>
  );
}
