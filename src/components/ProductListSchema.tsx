import { useEffect } from 'react';

interface Product {
  name: string;
  description: string;
  image?: string;
  category?: string;
}

interface ProductListSchemaProps {
  products: Product[];
}

export function ProductListSchema({ products }: ProductListSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          ...(product.image && { image: product.image }),
          ...(product.category && { category: product.category })
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-products';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('schema-products');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [products]);

  return null;
}
