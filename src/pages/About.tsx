import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import {
  Building2,
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

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Page Header - Full Screen Image */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <img
          src="/images/dane-deaner-_-KLkj7on_c-unsplash.jpg"
          alt="About Xiyu Textile"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              {t.about.title}
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              {t.about.subtitle}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Content Sections - Alternating */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Company Positioning */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <FadeInSection>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/images/abbe-sublett-nxZDMUQhN4o-unsplash.jpg"
                  alt={t.about.intro.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="flex items-center gap-4 mb-6">
                <Building2 className="h-8 w-8 text-gray-400" />
                <h2 className="text-3xl font-bold text-gray-900">{t.about.intro.title}</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.about.intro.content}
              </p>
            </FadeInSection>
          </div>

          {/* Environmental Philosophy - Reversed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <FadeInSection delay={200} className="order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <Building2 className="h-8 w-8 text-gray-400" />
                <h2 className="text-3xl font-bold text-gray-900">{t.about.philosophy.title}</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.about.philosophy.content}
              </p>
            </FadeInSection>
            <FadeInSection className="order-1 lg:order-2">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/images/slidebean-HH7OwIClUsY-unsplash.jpg"
                  alt={t.about.philosophy.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInSection>
          </div>

          {/* Company Strength */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/images/krakenimages-Y5bvRlcCx8k-unsplash.jpg"
                  alt={t.about.strength.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="flex items-center gap-4 mb-6">
                <Factory className="h-8 w-8 text-gray-400" />
                <h2 className="text-3xl font-bold text-gray-900">{t.about.strength.title}</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.about.strength.content}
              </p>
            </FadeInSection>
          </div>
        </div>
      </section>


    </div>
  );
}
