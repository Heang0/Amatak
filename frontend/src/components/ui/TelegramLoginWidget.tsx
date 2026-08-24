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

  const activeBotUsername = botUsername || process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'amatakshop_bot';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !activeBotUsername || !containerRef.current) return;

    // Expose callback globally before injecting script
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

    containerRef.current.appendChild(script);

    return () => {
      if ((window as any).TelegramLoginWidget) {
        delete (window as any).TelegramLoginWidget;
      }
    };
  }, [mounted, activeBotUsername, onAuth, isKm]);

  if (!mounted) return null;

  return (
    <div className="flex justify-center w-full min-h-[44px]">
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}
