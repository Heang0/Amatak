'use client';

import { useEffect, useState } from 'react';
import StoreFavoritesPageNeoBrutalism from './themes/StoreFavoritesPageNeoBrutalism';
import StoreFavoritesPageSkincareClean from './themes/StoreFavoritesPageSkincareClean';
import StoreFavoritesPageDefault from './themes/StoreFavoritesPageDefault';
import StoreFavoritesPageFashionEditorial from './themes/StoreFavoritesPageFashionEditorial';
import StoreFavoritesPageTechMinimal from './themes/StoreFavoritesPageTechMinimal';

export default function StoreFavoritesPageRouter(props: any) {
  const [themeStyle, setThemeStyle] = useState<string | null>(null);

  useEffect(() => {
    const slug = props.params?.slug || props.slug || '';
    if (!slug) return setThemeStyle('fashion-editorial');
    
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/stores/${slug}`)
      .then(res => res.json())
      .then(data => setThemeStyle(data.branding?.themeStyle || 'fashion-editorial'))
      .catch(() => setThemeStyle('fashion-editorial'));
  }, [props.params?.slug, props.slug]);

  if (!themeStyle) {
    return null;
  }

  switch (themeStyle) {
    case 'neo-brutalism':
      return <StoreFavoritesPageNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <StoreFavoritesPageSkincareClean {...props} />;
    case 'default':
      return <StoreFavoritesPageDefault {...props} />;
    case 'tech-minimal':
      return <StoreFavoritesPageTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <StoreFavoritesPageFashionEditorial {...props} />;
  }
}
