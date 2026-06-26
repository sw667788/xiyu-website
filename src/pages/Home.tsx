import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import {
  Factory,
  ShoppingBag,
  Building2,
  ArrowRight
} from 'lucide-react';

const ParallaxSection = ({ children, className = '', speed = 0.3 }: { children: React.ReactNode; className?: string; speed?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        const newOffset = (rect.top - window.innerHeight) * speed;
        setOffset(newOffset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

const FadeInSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
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

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Custom Animations */}
      <style>{`
        @keyframes heroZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes lightMove1 {
          0%, 100% { opacity: 0.3; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.8; transform: translate(30px, -30px) scale(1.15); }
        }
        @keyframes lightMove2 {
          0%, 100% { opacity: 0.2; transform: translate(0, 0) scale(1); }
          50% { opacity: 0.6; transform: translate(-20px, 20px) scale(1.1); }
        }
        .hero-img {
          animation: heroZoom 15s ease-in-out infinite;
        }
        .light-1 {
          animation: lightMove1 10s ease-in-out infinite;
        }
        .light-2 {
          animation: lightMove2 12s ease-in-out infinite 2s;
        }
      `}</style>

      {/* Hero Section - Large Image Background with Dynamic Effects */}
      <section className="relative h-screen flex items-center overflow-hidden bg-gray-900">
        {/* Animated Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero.png"
            alt="Xiyu Textile"
            className="hero-img w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          {/* Light Ray Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="light-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl"></div>
            <div className="light-2 absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Parallax Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <FadeInSection>
            <div className="max-w-4xl">
              {/* Subtitle */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-300 tracking-wide">{t.home.badge}</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight text-white">
                {(Array.isArray(t.home.slogan) ? t.home.slogan : [t.home.slogan]).map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-12">
                {t.home.subSlogan.split('|').map((part, i) => (
                  <span key={i} className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-base md:text-lg text-gray-200">
                    {part.trim()}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-medium rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {t.home.cta.viewProducts}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-2 px-8 py-4 border border-white/50 text-white font-medium rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  {t.home.cta.contactUs}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Navigation Links - Clean, Image Style */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { to: '/about', img: 'dane-deaner-_-KLkj7on_c-unsplash.jpg', title: t.home.quickNav.items[0].title, desc: t.home.quickNav.items[0].desc },
              { to: '/products', img: 'vitalijs-barilo-azMZaQCUyV8-unsplash.jpg', title: t.home.quickNav.items[1].title, desc: t.home.quickNav.items[1].desc },
              { to: '/production', img: 'kevin-limbri-mBXQCNKbq7E-unsplash.jpg', title: t.home.quickNav.items[2].title, desc: t.home.quickNav.items[2].desc },
              { to: '/contact', img: 'firmbee-com-SpVHcbuKi6E-unsplash.jpg', title: t.home.quickNav.items[3].title, desc: t.home.quickNav.items[3].desc }
            ].map((item, idx) => (
              <FadeInSection key={idx} delay={idx * 150}>
                <Link
                  to={item.to}
                  className="group block relative overflow-hidden"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <img
                      src={`/images/${item.img}`}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-gray-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                      {t.home.explore} <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section - Parallax */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <ParallaxSection speed={0.2} className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gray-200/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gray-200/50 rounded-full blur-3xl"></div>
        </ParallaxSection>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16 text-center">
              {t.home.advantages.title}
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.home.advantages.items.map((item, idx) => (
              <FadeInSection key={idx} delay={idx * 100}>
                <div className="p-8 bg-white hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mb-6">
                    {idx === 0 && <Building2 className="h-8 w-8 text-gray-600" />}
                    {idx === 1 && <Factory className="h-8 w-8 text-gray-600" />}
                    {idx === 2 && <ShoppingBag className="h-8 w-8 text-gray-600" />}
                    {idx === 3 && <Building2 className="h-8 w-8 text-gray-600" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Large Image Section - Leejotex style */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeInSection>
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="/images/amina-atar-4mEyvORkbN0-unsplash.jpg"
                  alt={t.home.ourCommitment}
                  className="w-full h-full object-cover"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  {t.home.ourCommitment}
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed mb-8">
                  {t.home.commitmentText}
                </p>
                <Link
                  to="/production"
                  className="inline-flex items-center gap-2 px-8 py-4 border border-gray-600 text-white font-medium hover:bg-white hover:text-gray-900 transition-all"
                >
                  {t.home.learnMore}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>
    </div>
  );
}
