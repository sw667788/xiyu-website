import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useSEO } from '../hooks/useSEO';
import emailjs from '@emailjs/browser';
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Send
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

const EMAILJS_PUBLIC_KEY = 'zP-ofYYqkd8BE0DMC';
const EMAILJS_SERVICE_ID = 'service_bzvpppx';
const EMAILJS_TEMPLATE_ID = 'template_ny8uxh8';

export default function Contact() {
  const { t } = useLanguage();
  useSEO({title: t.seo.contact.title, description: t.seo.contact.description, keywords: t.seo.contact.keywords});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message
      },
      EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      setSubmitted(true);
      setLoading(false);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }, 3000);
    })
    .catch((error) => {
      console.error('Email send failed:', error);
      setLoading(false);
      alert('发送失败，请检查网络连接后重试');
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    { icon: <Phone className="h-6 w-6" />, label: t.contact.info.phone },
    { icon: <MessageSquare className="h-6 w-6" />, label: t.contact.info.wechat },
    { icon: <Mail className="h-6 w-6" />, label: t.contact.info.email },
    { icon: <MapPin className="h-6 w-6" />, label: t.contact.info.address },
    { icon: <Clock className="h-6 w-6" />, label: t.contact.info.hours }
  ];

  return (
    <div className="min-h-screen">
      {/* Page Header - Full Screen */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <img
          src="/images/firmbee-com-SpVHcbuKi6E-unsplash.jpg"
          alt="Contact Xiyu Textile"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
              {t.contact.title}
            </h1>
          </FadeInSection>
          <FadeInSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl">
              {t.contact.cooperation}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <FadeInSection>
                <h2 className="text-4xl font-bold text-gray-900 mb-10">{t.contact.title}</h2>
                <div className="space-y-6 mb-16">
                  {contactInfo.map((info, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-6 border-b border-gray-100">
                      <div className="text-gray-400">
                        {info.icon}
                      </div>
                      <p className="text-gray-700">{info.label}</p>
                    </div>
                  ))}
                </div>
              </FadeInSection>

              {/* Map Placeholder */}
              <FadeInSection delay={200}>
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="/images/location.jpg"
                    alt={t.contact.ourLocation}
                    className="w-full h-full object-cover"
                  />
                </div>
              </FadeInSection>
            </div>

            {/* Contact Form */}
            <div>
              <FadeInSection delay={200}>
                <h2 className="text-4xl font-bold text-gray-900 mb-10">{t.contact.form.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.contact.form.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 focus:border-gray-400 focus:ring-0 transition-all bg-gray-50 focus:bg-white"
                      placeholder={t.contact.form.name}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.contact.form.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 focus:border-gray-400 focus:ring-0 transition-all bg-gray-50 focus:bg-white"
                      placeholder={t.contact.form.phone}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.contact.form.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-5 py-4 border-2 border-gray-200 focus:border-gray-400 focus:ring-0 transition-all bg-gray-50 focus:bg-white"
                      placeholder={t.contact.form.email}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t.contact.form.message}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-5 py-4 border-2 border-gray-200 focus:border-gray-400 focus:ring-0 transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder={t.contact.form.message}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitted || loading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-5 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                    {loading ? '发送中...' : (submitted ? t.contact.form.success : t.contact.form.submit)}
                  </button>
                </form>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
