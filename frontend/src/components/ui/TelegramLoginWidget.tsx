'use client';

import { useEffect, useRef, useState } from 'react';

interface TelegramWidgetProps {
  botUsername: string;
  onAuth: (user: any) => void;
  isKm?: boolean;
}

export default function TelegramLoginWidget({ botUsername, onAuth, isKm }: TelegramWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [widgetError, setWidgetError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !botUsername || !containerRef.current) return;

    // Expose callback globally before injecting the script
    (window as any).TelegramLoginWidget = {
      dataOnauth: (user: any) => onAuth(user),
    };

    // Clear any old script
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-lang', isKm ? 'km' : 'en');
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
    script.async = true;
    script.onerror = () => setWidgetError(true);
    containerRef.current.appendChild(script);

    return () => {
      if ((window as any).TelegramLoginWidget) {
        delete (window as any).TelegramLoginWidget;
      }
    };
  }, [mounted, botUsername, onAuth, isKm]);

  if (!mounted) return null;

  if (widgetError || !botUsername) {
    return (
      <div className="w-full py-3 px-4 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400 text-center">
        {isKm ? 'Telegram មិនអាចប្រើបានឥឡូវ' : 'Telegram login unavailable'}
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full overflow-hidden rounded-xl" ref={containerRef} />
  );
}
