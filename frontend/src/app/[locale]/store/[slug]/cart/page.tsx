'use client';

import { useEffect, useState } from 'react';
import CartPageNeoBrutalism from './themes/CartPageNeoBrutalism';
import CartPageSkincareClean from './themes/CartPageSkincareClean';
import CartPageDefault from './themes/CartPageDefault';
import CartPageFashionEditorial from './themes/CartPageFashionEditorial';
import CartPageTechMinimal from './themes/CartPageTechMinimal';

export default function CartPageRouter(props: any) {
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
      return <CartPageNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <CartPageSkincareClean {...props} />;
    case 'default':
      return <CartPageDefault {...props} />;
    case 'tech-minimal':
      return <CartPageTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <CartPageFashionEditorial {...props} />;
  }
}
