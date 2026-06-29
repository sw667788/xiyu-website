import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  hreflang?: {
    zh: string;
    en: string;
    ko: string;
  };
}

export function useSEO({ title, description, keywords, image, url, hreflang }: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const currentUrl = url || `${window.location.origin}${location.pathname}`;

    if (title) {
      document.title = title;
      setMetaTag('og:title', title, 'property');
      setMetaTag('twitter:title', title);
    }
    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, 'property');
      setMetaTag('twitter:description', description);
    }
    if (keywords) {
      setMetaTag('keywords', keywords);
    }
    if (image) {
      setMetaTag('og:image', image, 'property');
      setMetaTag('twitter:image', image);
    }
    setMetaTag('og:url', currentUrl, 'property');

    if (hreflang) {
      setHreflangLinks(hreflang, currentUrl);
    }
  }, [title, description, keywords, image, url, hreflang, location.pathname]);
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setHreflangLinks(
  langs: { zh: string; en: string; ko: string },
  _currentUrl: string
) {
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  const langMap: { code: string; path: string }[] = [
    { code: 'zh-CN', path: langs.zh },
    { code: 'en', path: langs.en },
    { code: 'ko', path: langs.ko },
    { code: 'x-default', path: langs.zh }
  ];

  langMap.forEach(({ code, path }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', code);
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}
