import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="AurisVoice - La Rolls du doublage vocal IA. Transformez vos contenus audio et vidéo en doublages professionnels." />
        
        {/* OpenGraph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AurisVoice - La Rolls du doublage vocal IA" />
        <meta property="og:description" content="Transformez vos contenus audio et vidéo en doublages professionnels avec l'intelligence artificielle." />
        <meta property="og:site_name" content="AurisVoice" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AurisVoice - La Rolls du doublage vocal IA" />
        <meta name="twitter:description" content="Transformez vos contenus audio et vidéo en doublages professionnels avec l'intelligence artificielle." />
        
        {/* Additional SEO */}
        <meta name="keywords" content="AI, dubbing, voice, audio, video, translation, French, English, Spanish" />
        <meta name="author" content="AurisVoice" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

