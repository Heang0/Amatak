'use client';

import StoreSidebarMenuNeoBrutalism from './themes/sidebar-menu/StoreSidebarMenuNeoBrutalism';
import StoreSidebarMenuSkincareClean from './themes/sidebar-menu/StoreSidebarMenuSkincareClean';
import StoreSidebarMenuDefault from './themes/sidebar-menu/StoreSidebarMenuDefault';
import StoreSidebarMenuFashionEditorial from './themes/sidebar-menu/StoreSidebarMenuFashionEditorial';
import StoreSidebarMenuTechMinimal from './themes/sidebar-menu/StoreSidebarMenuTechMinimal';

export default function StoreSidebarMenu(props: any) {
  const themeStyle = props.themeStyle || props.initialThemeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <StoreSidebarMenuNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <StoreSidebarMenuSkincareClean {...props} />;
    case 'default':
      return <StoreSidebarMenuDefault {...props} />;
    case 'tech-minimal':
      return <StoreSidebarMenuTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <StoreSidebarMenuFashionEditorial {...props} />;
  }
}
