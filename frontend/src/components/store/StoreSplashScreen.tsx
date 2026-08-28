'use client';

import { useEffect, useState } from 'react';

interface StoreSplashScreenProps {
  storeName: string;
  storeLogo?: string;
  primaryColor: string;
  themeStyle: string;
  slug: string;
  hasSeenSplash: boolean;
}

export default function StoreSplashScreen({
  storeName,
  storeLogo,
  primaryColor,
  themeStyle,
  slug,
  hasSeenSplash,
}: StoreSplashScreenProps) {
  const [visible, setVisible] = useState(!hasSeenSplash);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    // Only show splash screen if the app is running as a PWA (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

    if (!isStandalone || hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Set cookie so the server knows next time
    const key = `splash_shown_${slug}`;
    document.cookie = `${key}=1; path=/; max-age=86400`; // 1 day

    // Phase 1: zoom in (0 → 600ms)
    // Phase 2: hold (600ms → 1200ms)
    const holdTimer = setTimeout(() => setPhase('hold'), 600);
    // Phase 3: zoom out + fade (1200ms → 1800ms)
    const outTimer = setTimeout(() => setPhase('out'), 1200);
    // Phase 4: hide completely
    const hideTimer = setTimeout(() => setVisible(false), 1900);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(hideTimer);
    };
  }, [slug]);

  if (!visible) return null;

  // Background color based on theme
  const bgColor =
    themeStyle === 'skincare-clean'
      ? '#FAF9F6'
      : themeStyle === 'neo-brutalism'
      ? '#ffffff'
      : primaryColor;

  const textColor =
    themeStyle === 'skincare-clean' ? '#333333' : '#ffffff';

  const logoScale =
    phase === 'in' ? 'scale-75 opacity-0' :
    phase === 'hold' ? 'scale-100 opacity-100' :
    'scale-125 opacity-0';

  const overlayOpacity =
    phase === 'out' ? 'opacity-0' : 'opacity-100';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 md:hidden ${overlayOpacity}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Logo */}
      <div className={`transition-all duration-700 ease-out ${logoScale} flex flex-col items-center gap-4`}>
        {storeLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={storeLogo}
            alt={storeName}
            className="w-24 h-24 object-contain drop-shadow-2xl"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black shadow-2xl"
            style={{
              backgroundColor: themeStyle === 'skincare-clean' ? '#333' : '#ffffff22',
              color: textColor,
              border: themeStyle === 'neo-brutalism' ? '4px solid #000' : 'none',
            }}
          >
            {storeName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Store name */}
        <p
          className={`text-sm font-bold uppercase tracking-[0.3em] mt-2 transition-all duration-700 ${
            phase === 'in' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          style={{ color: textColor }}
        >
          {storeName}
        </p>
      </div>

      {/* Subtle loading dot pulse at bottom */}
      <div className="absolute bottom-16 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full opacity-60 animate-pulse"
            style={{
              backgroundColor: textColor,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
