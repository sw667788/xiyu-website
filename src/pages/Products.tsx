import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import {
  ShoppingBag,
  Zap,
  Settings,
  CircleDot,
  Layers,
  CheckCircle2,
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

export default function Products() {
  const { t } = useLanguage();
  useSEO({title: t.seo.products.title, description: t.seo.products.description, keywords: t.seo.products.keywords});
  const [activeSeries, setActiveSeries] = useState(0);

  const seriesIcons = [ShoppingBag, Zap, Settings, CircleDot, Layers];

  return (
    <div className="min-h-screen">
      {/* Page Header - Full Screen */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/moonstarious-project-KbaSNX-6Vdo-unsplash.jpg"
            alt="Xiyu Textile Products"
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              {t.products.title}
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
              {t.products.exploreProducts}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Series Navigation */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4">
            {t.products.series.map((series, idx) => {
              const Icon = seriesIcons[idx];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSeries(idx)}
                  className={`flex items-center gap-2 px-8 py-4 font-medium border-2 transition-all ${
                    activeSeries === idx
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {series.title}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {t.products.series[activeSeries].title}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl">
                {t.products.series[activeSeries].desc}
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {activeSeries === 0 && [
              { img: 'chuttersnap-reA-vD9KHwg-unsplash.jpg', name: t.products.series[0].products[0].name, eco: t.products.series[0].products[0].eco, use: t.products.series[0].products[0].use },
              { img: 'victor-volkov-mPCCiE4vpzQ-unsplash.jpg', name: t.products.series[0].products[1].name, eco: t.products.series[0].products[1].eco, use: t.products.series[0].products[1].use }
            ].map((product, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="group">
                  <div className="aspect-[4/3] relative overflow-hidden mb-8">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                    <div className="space-y-3 text-gray-600 mb-6">
                      <p><strong>{t.products.ecoHighlight}:</strong> {product.eco}</p>
                      <p><strong>{t.products.useScene}:</strong> {product.use}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.products.inStock}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
            {activeSeries === 1 && [
              { img: 'moonstarious-project-wl2TODALiAY-unsplash.jpg', name: t.products.series[1].products[0].name, eco: t.products.series[1].products[0].eco, use: t.products.series[1].products[0].use },
              { img: 'divazus-fabric-store-gep5qKPlDzA-unsplash.jpg', name: t.products.series[1].products[1].name, eco: t.products.series[1].products[1].eco, use: t.products.series[1].products[1].use }
            ].map((product, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="group">
                  <div className="aspect-[4/3] relative overflow-hidden mb-8">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                    <div className="space-y-3 text-gray-600 mb-6">
                      <p><strong>{t.products.ecoHighlight}:</strong> {product.eco}</p>
                      <p><strong>{t.products.useScene}:</strong> {product.use}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.products.inStock}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
            {activeSeries === 2 && [
              { img: 'raelle-cameron-eHm_wq_Ys7M-unsplash.jpg', name: t.products.series[2].products[0].name, eco: t.products.series[2].products[0].eco, use: t.products.series[2].products[0].use },
              { img: 'edo-IjAZtZ7cZW8-unsplash.jpg', name: t.products.series[2].products[1].name, eco: t.products.series[2].products[1].eco, use: t.products.series[2].products[1].use }
            ].map((product, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="group">
                  <div className="aspect-[4/3] relative overflow-hidden mb-8">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                    <div className="space-y-3 text-gray-600 mb-6">
                      <p><strong>{t.products.ecoHighlight}:</strong> {product.eco}</p>
                      <p><strong>{t.products.useScene}:</strong> {product.use}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.products.inStock}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
            {activeSeries === 3 && [
              { img: 'ekaterina-grosheva-Htzlqefo8Rg-unsplash.jpg', name: t.products.series[3].products[0].name, eco: t.products.series[3].products[0].eco, use: t.products.series[3].products[0].use },
              { img: 'moonstarious-project-R2Z3xE7nsB8-unsplash.jpg', name: t.products.series[3].products[1].name, eco: t.products.series[3].products[1].eco, use: t.products.series[3].products[1].use }
            ].map((product, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="group">
                  <div className="aspect-[4/3] relative overflow-hidden mb-8">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                    <div className="space-y-3 text-gray-600 mb-6">
                      <p><strong>{t.products.ecoHighlight}:</strong> {product.eco}</p>
                      <p><strong>{t.products.useScene}:</strong> {product.use}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.products.inStock}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
            {activeSeries === 4 && [
              { img: 'wyteshot-toQSUFO1hSA-unsplash.jpg', name: t.products.series[4].products[0].name, eco: t.products.series[4].products[0].eco, use: t.products.series[4].products[0].use },
              { img: 'tasha-kostyuk-UKnEy-YX3Pc-unsplash.jpg', name: t.products.series[4].products[1].name, eco: t.products.series[4].products[1].eco, use: t.products.series[4].products[1].use }
            ].map((product, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <div className="group">
                  <div className="aspect-[4/3] relative overflow-hidden mb-8">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h3>
                    <div className="space-y-3 text-gray-600 mb-6">
                      <p><strong>{t.products.ecoHighlight}:</strong> {product.eco}</p>
                      <p><strong>{t.products.useScene}:</strong> {product.use}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.products.inStock}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-4xl font-bold mb-6">{t.products.interested}</h2>
            <p className="text-xl text-gray-400 mb-10">{t.products.cta.description}</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-medium hover:bg-gray-100 transition-all"
            >
              {t.products.cta.contact}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}
