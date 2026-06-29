import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { OrganizationSchema } from './OrganizationSchema';
import { useLanguage } from '../hooks/useLanguage';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { language } = useLanguage();

  const orgData = {
    zh: {
      name: '稀榆纺织',
      alternateName: 'Xiyu Textile',
      url: 'https://xiyutex.com',
      telephone: '+86 13771650911',
      email: 'official@xiyutex.com',
      address: {
        streetAddress: '针织路89号铂逸针织园北6号',
        addressLocality: '盛泽镇, 吴江区',
        addressRegion: '苏州市, 江苏省',
        addressCountry: 'CN'
      }
    },
    en: {
      name: 'Xiyu Textile',
      alternateName: '稀榆纺织',
      url: 'https://xiyutex.com',
      telephone: '+86 13771650911',
      email: 'official@xiyutex.com',
      address: {
        streetAddress: 'No. 6 North, Boyi Knitting Park, 89 Zhenzhi Road',
        addressLocality: 'Shengze Town, Wujiang District',
        addressRegion: 'Suzhou, Jiangsu Province',
        addressCountry: 'CN'
      }
    },
    ko: {
      name: '시위 텍스타일',
      alternateName: 'Xiyu Textile',
      url: 'https://xiyutex.com',
      telephone: '+86 13771650911',
      email: 'official@xiyutex.com',
      address: {
        streetAddress: '보이이 직물원 북6호, 지엔즈루 89호',
        addressLocality: '성쩡진, 우장구',
        addressRegion: '쑤저우시, 장쑤성',
        addressCountry: 'CN'
      }
    }
  };

  const data = orgData[language as keyof typeof orgData] || orgData.zh;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OrganizationSchema {...data} />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
