'use client';

import { useEffect, useState } from 'react';
import CheckoutPageNeoBrutalism from './themes/CheckoutPageNeoBrutalism';
import CheckoutPageSkincareClean from './themes/CheckoutPageSkincareClean';
import CheckoutPageDefault from './themes/CheckoutPageDefault';
import CheckoutPageFashionEditorial from './themes/CheckoutPageFashionEditorial';
import CheckoutPageTechMinimal from './themes/CheckoutPageTechMinimal';

export default function CheckoutPageRouter(props: any) {
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
      return <CheckoutPageNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <CheckoutPageSkincareClean {...props} />;
    case 'default':
      return <CheckoutPageDefault {...props} />;
    case 'tech-minimal':
      return <CheckoutPageTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <CheckoutPageFashionEditorial {...props} />;
  }
}
