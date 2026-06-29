import { useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'schema-faq';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('schema-faq');
      if (existing) {
        document.head.removeChild(existing);
      }
    };
  }, [faqs]);

  return null;
}
