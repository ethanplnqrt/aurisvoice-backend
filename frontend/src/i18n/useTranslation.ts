'use client';

import { useRouter } from 'next/router';
import { translations, Locale, TranslationKey } from './translations';

export function useTranslation() {
  const router = useRouter();
  const locale = (router.locale || 'fr') as Locale;
  
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.fr[key] || key;
  };
  
  const changeLocale = (newLocale: Locale) => {
    router.push(router.pathname, router.asPath, { locale: newLocale });
  };
  
  return { t, locale, changeLocale };
}

export function getStaticTranslation(locale: string) {
  const validLocale = (locale in translations ? locale : 'fr') as Locale;
  
  return (key: TranslationKey): string => {
    return translations[validLocale][key] || translations.fr[key] || key;
  };
}

