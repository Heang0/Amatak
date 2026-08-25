import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
export const locales = ['en', 'km'];
 
export default getRequestConfig(async ({requestLocale}) => {
  const reqLocale = await requestLocale;
  
  const locale: string = (reqLocale && locales.includes(reqLocale as any)) ? reqLocale : 'km';
 
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
