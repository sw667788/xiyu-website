import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import {
  Factory,
  ArrowRight
} from 'lucide-react';

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {children}
    </div>
  );
};

export default function Production() {
  const { t } = useLanguage();
  useSEO({title: t.seo.production.title, description: t.seo.production.description, keywords: t.seo.production.keywords});

  return (
    <div className="min-h-screen">
      {/* Page Header - Full Screen */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <img
          src="/images/kevin-limbri-mBXQCNKbq7E-unsplash.jpg"
          alt="Xiyu Textile Production"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              {t.production.title}
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
              {t.production.subtitle}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Production Process - Grid Layout */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { img: 'callum-hill-L7V4rwETDb0-unsplash.jpg', tag: 'SOURCING' },
              { img: 'yasamine-june-9pFE-9CWEBI-unsplash.jpg', tag: 'DEVELOP' },
              { img: 'h-co-9PPrJxNWBZk-unsplash.jpg', tag: 'BULK' },
              { img: 'sil-group-cAWzxVTynvs-unsplash.jpg', tag: 'INSPECTION' }
            ].map((item, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <Link to={`/production/${idx}`} className="group relative block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={`/images/${item.img}`}
                      alt={item.tag}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                      <span className="text-red-500 font-bold text-lg tracking-wider mb-2">{item.tag}</span>
                      <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowRight className="h-6 w-6 text-gray-900" />
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Service Advantages - Cards */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              {t.production.features.title}
            </h2>
          </FadeInSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.production.features.items.map((item, idx) => (
              <FadeInSection key={idx} delay={idx * 100}>
                <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-red-500 font-bold text-xl">{idx + 1}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{item}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Commitment */}
      <section className="py-32 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="flex items-center gap-4 mb-10">
              <Factory className="h-10 w-10 text-gray-400" />
              <h2 className="text-4xl font-bold">{t.production.ecoSpecial.title}</h2>
            </div>
            <p className="text-xl text-gray-400 leading-relaxed max-w-3xl">
              {t.production.ecoSpecial.content}
            </p>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
