'use client';

import { useEffect, useState } from 'react';
import StorefrontViewNeoBrutalism from './themes/StorefrontViewNeoBrutalism';
import StorefrontViewSkincareClean from './themes/StorefrontViewSkincareClean';
import StorefrontViewDefault from './themes/StorefrontViewDefault';
import StorefrontViewFashionEditorial from './themes/StorefrontViewFashionEditorial';
import StorefrontViewTechMinimal from './themes/StorefrontViewTechMinimal';

export default function StorefrontViewRouter(props: any) {
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
      return <StorefrontViewNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <StorefrontViewSkincareClean {...props} />;
    case 'default':
      return <StorefrontViewDefault {...props} />;
    case 'tech-minimal':
      return <StorefrontViewTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <StorefrontViewFashionEditorial {...props} />;
  }
}
