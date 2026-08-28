'use client';

import ProductDetailFashion from './themes/product-detail/ProductDetailFashion';
import ProductDetailSkincare from './themes/product-detail/ProductDetailSkincare';
import ProductDetailNeoBrutalism from './themes/product-detail/ProductDetailNeoBrutalism';
import ProductDetailDefault from './themes/product-detail/ProductDetailDefault';
import ProductDetailTech from './themes/product-detail/ProductDetailTech';

interface ProductDetailClientProps {
  product: any;
  store: any;
  relatedProducts: any[];
  locale: string;
  slug: string;
}

export default function ProductDetailClient(props: ProductDetailClientProps) {
  const themeStyle = props.store?.branding?.themeStyle || 'fashion-editorial';

  switch (themeStyle) {
    case 'neo-brutalism':
      return <ProductDetailNeoBrutalism {...props} />;
    case 'skincare-clean':
      return <ProductDetailSkincare {...props} />;
    case 'default':
      return <ProductDetailDefault {...props} />;
    case 'tech-minimal':
      return <ProductDetailTech {...props} />;
    case 'fashion-editorial':
    default:
      return <ProductDetailFashion {...props} />;
  }
}
