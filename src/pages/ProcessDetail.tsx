import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Factory } from 'lucide-react';

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

const images = [
  'callum-hill-L7V4rwETDb0-unsplash.jpg',
  'yasamine-june-9pFE-9CWEBI-unsplash.jpg',
  'h-co-9PPrJxNWBZk-unsplash.jpg',
  'sil-group-cAWzxVTynvs-unsplash.jpg'
];

const tags = ['SOURCING', 'DEVELOP', 'BULK', 'INSPECTION'];

export default function ProcessDetail() {
  const { t } = useLanguage();
  useSEO({title: t.seo.production.title, description: t.seo.production.description, keywords: t.seo.production.keywords});
  const { step } = useParams<{ step: string }>();
  
  const stepIndex = parseInt(step || '0');
  
  if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">404</h2>
          <p className="text-gray-600 mb-6">Page not found</p>
          <Link to="/production" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            {t.common.learnMore}
          </Link>
        </div>
      </div>
    );
  }

  const process = t.production.process[stepIndex];
  const img = images[stepIndex];
  const tag = tags[stepIndex];

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center overflow-hidden">
        <img
          src={`/images/${img}`}
          alt={process.step}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="flex items-center gap-4 mb-6">
              <Link to="/production" className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <span className="text-red-500 font-bold text-xl tracking-wider">{tag}</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              {process.fullTitle}
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
              {process.desc}
            </p>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="flex items-center gap-4 mb-12">
              <Factory className="h-10 w-10 text-gray-400" />
              <h2 className="text-4xl font-bold text-gray-900">{process.step}</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {process.fullDesc}
                </p>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900">核心优势</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {process.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={`/images/${img}`}
                  alt={process.step}
                  className="w-full h-full object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">流程概览</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {t.production.process.map((item, idx) => (
                <Link
                  key={idx}
                  to={`/production/${idx}`}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${
                    idx === stepIndex
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <span className="font-bold">{idx + 1}</span>
                  <span className="hidden sm:inline">{item.step}</span>
                </Link>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
