'use client';

import { useTranslation } from '@/i18n/useTranslation';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { Locale } from '@/i18n/translations';

const languages = [
  { code: 'fr' as Locale, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  { code: 'es' as Locale, name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { locale, changeLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 ${
                  locale === lang.code ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

