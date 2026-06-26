import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-white">Xiyu Textile</span>
            </div>
            <p className="text-sm text-gray-400">
              {t.contact.cooperation}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.quickLinks}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:text-white transition-colors">
                {t.nav.home}
              </Link>
              <Link to="/about" className="text-sm hover:text-white transition-colors">
                {t.nav.about}
              </Link>
              <Link to="/products" className="text-sm hover:text-white transition-colors">
                {t.nav.products}
              </Link>
              <Link to="/production" className="text-sm hover:text-white transition-colors">
                {t.nav.production}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.contact.title}</h3>
            <div className="space-y-2 text-sm">
              <p>{t.contact.info.phone}</p>
              <p>{t.contact.info.wechat}</p>
              <p>{t.contact.info.email}</p>
              <p>{t.contact.info.address}</p>
            </div>
          </div>

          {/* Contact CTA */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t.footer.contactUs}</h3>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded hover:bg-gray-100 transition-colors"
            >
              {t.contact.form.submit}
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
