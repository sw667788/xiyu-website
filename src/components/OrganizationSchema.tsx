import { useEffect } from 'react';

interface OrganizationSchemaProps {
  name: string;
  alternateName?: string;
  url: string;
  logo?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

export function OrganizationSchema({
  name,
  alternateName,
  url,
  logo,
  telephone,
  email,
  address,
  sameAs
}: OrganizationSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name,
      ...(alternateName && { alternateName }),
      url,
      ...(logo && { logo }),
      ...(telephone && { telephone }),
      ...(email && { email }),
      ...(address && {
        address: {
          '@type': 'PostalAddress',
          ...address
        }
      }),
      ...(sameAs && sameAs.length > 0 && { sameAs })
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-organization';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('schema-organization');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [name, alternateName, url, logo, telephone, email, address, sameAs]);

  return null;
}
