import Head from 'next/head';
import { useTranslation } from '@/i18n/useTranslation';
import { Sparkles, Zap, Shield, Heart, Users, Globe2 } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Sparkles,
      title: t('feature_ai_title'),
      description: t('feature_ai_desc'),
    },
    {
      icon: Shield,
      title: t('feature_quality_title'),
      description: t('feature_quality_desc'),
    },
    {
      icon: Zap,
      title: t('feature_fast_title'),
      description: t('feature_fast_desc'),
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'Nous sommes passionnés par la technologie et l\'innovation dans le domaine du doublage vocal.',
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Nous travaillons en étroite collaboration avec nos clients pour répondre à leurs besoins spécifiques.',
    },
    {
      icon: Globe2,
      title: 'Accessibilité',
      description: 'Nous croyons en l\'accessibilité du contenu multimédia pour tous, dans toutes les langues.',
    },
  ];

  return (
    <>
      <Head>
        <title>{t('about_title')} - AurisVoice</title>
        <meta name="description" content={t('about_description')} />
      </Head>

      <div className="min-h-[calc(100vh-128px)]">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {t('about_title')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about_description')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('about_features_title')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-8 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-800 hover:shadow-xl transition-shadow"
                >
                  <div className="p-4 rounded-full bg-white dark:bg-gray-700 w-fit mb-6">
                    <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Nos Valeurs</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              Les principes qui guident notre mission et notre vision pour l'avenir du doublage vocal.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="p-8 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="p-4 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 w-fit mb-6">
                    <value.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Transformez vos contenus audio et vidéo dès aujourd'hui avec AurisVoice.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              {t('get_started')}
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

