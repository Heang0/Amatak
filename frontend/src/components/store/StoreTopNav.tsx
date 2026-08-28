'use client';

import StoreTopNavNeoBrutalism from './themes/top-nav/StoreTopNavNeoBrutalism';
import StoreTopNavSkincareClean from './themes/top-nav/StoreTopNavSkincareClean';
import StoreTopNavDefault from './themes/top-nav/StoreTopNavDefault';
import StoreTopNavFashionEditorial from './themes/top-nav/StoreTopNavFashionEditorial';
import StoreTopNavTechMinimal from './themes/top-nav/StoreTopNavTechMinimal';

export default function StoreTopNav(props: any) {
  const themeStyle = props.themeStyle || props.initialThemeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <StoreTopNavNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <StoreTopNavSkincareClean {...props} />;
    case 'default':
      return <StoreTopNavDefault {...props} />;
    case 'tech-minimal':
      return <StoreTopNavTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <StoreTopNavFashionEditorial {...props} />;
  }
}
