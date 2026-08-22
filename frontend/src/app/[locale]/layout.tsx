import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Outfit, Kantumruy_Pro } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], display: 'swap' });
const kantumruy = Kantumruy_Pro({ 
  subsets: ["khmer"], 
  display: 'swap',
  variable: '--font-kantumruy'
});

import { Viewport } from 'next';

export const metadata = {
  title: 'Amatak | អមតៈ - Your Ultimate Online Shopping Platform',
  description: 'Amatak is the ultimate multi-vendor e-commerce platform in Cambodia. Manage sales, inventory, and customers with seamless KHQR and Telegram integration.',
  icons: {
    icon: '/logo/favicon.ico',
    apple: '/logo/logo-website.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
 
export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  const messages = await getMessages();
 
  // Select the font based on the locale
  const fontClass = locale === 'km' ? `${kantumruy.className} ${kantumruy.variable} lang-km` : `${outfit.className} ${kantumruy.variable}`;

  return (
    <div id="app-root" className={fontClass}>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
