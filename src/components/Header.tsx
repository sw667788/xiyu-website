import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { Language } from '../i18n';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const { t, setLanguage, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: t.nav.home },
    { path: '/about', label: t.nav.about },
    { path: '/products', label: t.nav.products },
    { path: '/production', label: t.nav.production },
    { path: '/contact', label: t.nav.contact }
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'EN' },
    { code: 'ko', label: '한' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white border-b border-gray-200 py-2' 
        : 'bg-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className={`text-lg font-bold ${isScrolled ? 'text-gray-900' : 'text-white'} hover:opacity-80 transition-opacity`}>Xiyu Textile</Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:${isScrolled ? 'text-gray-900' : 'text-gray-200'} ${
                  location.pathname === item.path
                    ? (isScrolled ? 'text-gray-900' : 'text-white')
                    : (isScrolled ? 'text-gray-600' : 'text-white/80')
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors border rounded ${
                  isScrolled 
                    ? 'text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400' 
                    : 'text-white hover:text-white/80 border-white/30 hover:border-white/50'
                }`}
              >
                {languages.find((l) => l.code === language)?.label}
                <ChevronDown className="h-4 w-4" />
              </button>
              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-24 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          language === lang.code
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden p-2 ${isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-white/80'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t bg-white">
            <nav className="flex flex-col gap-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium px-2 py-1 rounded ${
                    location.pathname === item.path
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
