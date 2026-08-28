'use client';

import { useEffect, useState } from 'react';
import ProfilePageNeoBrutalism from './themes/ProfilePageNeoBrutalism';
import ProfilePageSkincareClean from './themes/ProfilePageSkincareClean';
import ProfilePageDefault from './themes/ProfilePageDefault';
import ProfilePageFashionEditorial from './themes/ProfilePageFashionEditorial';
import ProfilePageTechMinimal from './themes/ProfilePageTechMinimal';

export default function StoreProfileRouter({ params }: { params: { slug: string, locale: string, path?: string[] } }) {
  const [themeStyle, setThemeStyle] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${params.slug}`)
      .then(res => res.json())
      .then(data => setThemeStyle(data.branding?.themeStyle || 'fashion-editorial'))
      .catch(() => setThemeStyle('fashion-editorial'));
  }, [params.slug]);

  if (!themeStyle) {
    return (
      <div className="flex-1 flex justify-center py-20 min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  switch (themeStyle) {
    case 'neo-brutalism':
      return <ProfilePageNeoBrutalism params={params} />;
    case 'skincare-clean':
      return <ProfilePageSkincareClean params={params} />;
    case 'default':
      return <ProfilePageDefault params={params} />;
    case 'tech-minimal':
      return <ProfilePageTechMinimal params={params} />;
    case 'fashion-editorial':
    default:
      return <ProfilePageFashionEditorial params={params} />;
  }
}
