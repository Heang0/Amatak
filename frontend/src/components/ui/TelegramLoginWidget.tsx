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
  const [widgetError, setWidgetError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  const activeBotUsername = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'amatakshop_bot';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !activeBotUsername || !containerRef.current) return;

    setWidgetError(false);

    // Expose callback globally before injecting the script
    (window as any).TelegramLoginWidget = {
      dataOnauth: (user: any) => onAuth(user),
    };

    // Clear old widget
    containerRef.current.innerHTML = '';

    // Remove any stale script tags
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
    script.setAttribute('data-lang', isKm ? 'km' : 'en');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.async = true;

    script.onload = () => {
      setWidgetError(false);
    };

    script.onerror = () => {
      console.error('[TelegramWidget] Failed to load widget script. Make sure the domain is registered in BotFather.');
      setWidgetError(true);
    };

    containerRef.current.appendChild(script);

    return () => {
      if ((window as any).TelegramLoginWidget) {
        delete (window as any).TelegramLoginWidget;
      }
    };
  }, [mounted, activeBotUsername, onAuth, isKm, loadAttempts]);

  if (!mounted) return null;

  if (!activeBotUsername) {
    return (
      <div className="w-full py-3 px-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-400 text-center">
        {isKm ? 'Telegram Bot មិនត្រូវបានកំណត់' : 'Telegram Bot not configured'}
      </div>
    );
  }

  if (widgetError) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <div className="w-full py-3 px-4 border border-dashed border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-xs text-amber-600 dark:text-amber-400 text-center">
          {isKm
            ? 'Telegram: domain "localhost" ត្រូវបន្ថែមក្នុង BotFather → Bot Settings → Domain'
            : 'Telegram: Add "localhost" as domain in BotFather → @amatakshop_bot → Bot Settings → Domain'}
        </div>
        <button
          onClick={() => setLoadAttempts(a => a + 1)}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline underline-offset-2 transition-colors"
        >
          {isKm ? 'ព្យាយាមម្ដងទៀត' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex justify-center w-full overflow-hidden rounded-xl min-h-[44px]"
      ref={containerRef}
    />
  );
}
