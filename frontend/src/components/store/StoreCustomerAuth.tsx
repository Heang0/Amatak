'use client';

import StoreCustomerAuthNeoBrutalism from './themes/customer-auth/StoreCustomerAuthNeoBrutalism';
import StoreCustomerAuthSkincareClean from './themes/customer-auth/StoreCustomerAuthSkincareClean';
import StoreCustomerAuthDefault from './themes/customer-auth/StoreCustomerAuthDefault';
import StoreCustomerAuthFashionEditorial from './themes/customer-auth/StoreCustomerAuthFashionEditorial';
import StoreCustomerAuthTechMinimal from './themes/customer-auth/StoreCustomerAuthTechMinimal';

export default function StoreCustomerAuth(props: any) {
  const themeStyle = props.themeStyle || props.initialThemeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <StoreCustomerAuthNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <StoreCustomerAuthSkincareClean {...props} />;
    case 'default':
      return <StoreCustomerAuthDefault {...props} />;
    case 'tech-minimal':
      return <StoreCustomerAuthTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <StoreCustomerAuthFashionEditorial {...props} />;
  }
}
