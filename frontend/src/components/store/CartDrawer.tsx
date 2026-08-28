'use client';

import CartDrawerNeoBrutalism from './themes/cart-drawer/CartDrawerNeoBrutalism';
import CartDrawerSkincareClean from './themes/cart-drawer/CartDrawerSkincareClean';
import CartDrawerDefault from './themes/cart-drawer/CartDrawerDefault';
import CartDrawerFashionEditorial from './themes/cart-drawer/CartDrawerFashionEditorial';
import CartDrawerTechMinimal from './themes/cart-drawer/CartDrawerTechMinimal';

export default function CartDrawer(props: any) {
  const themeStyle = props.themeStyle || props.initialThemeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <CartDrawerNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <CartDrawerSkincareClean {...props} />;
    case 'default':
      return <CartDrawerDefault {...props} />;
    case 'tech-minimal':
      return <CartDrawerTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <CartDrawerFashionEditorial {...props} />;
  }
}
