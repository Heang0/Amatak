'use client';

import ProductCardNeoBrutalism from './themes/product-card/ProductCardNeoBrutalism';
import ProductCardSkincareClean from './themes/product-card/ProductCardSkincareClean';
import ProductCardDefault from './themes/product-card/ProductCardDefault';
import ProductCardFashionEditorial from './themes/product-card/ProductCardFashionEditorial';
import ProductCardTechMinimal from './themes/product-card/ProductCardTechMinimal';

export default function ProductCard(props: any) {
  const themeStyle = props.themeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <ProductCardNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <ProductCardSkincareClean {...props} />;
    case 'default':
      return <ProductCardDefault {...props} />;
    case 'tech-minimal':
      return <ProductCardTechMinimal {...props} />;
    case 'fashion-editorial':
    default:
      return <ProductCardFashionEditorial {...props} />;
  }
}
