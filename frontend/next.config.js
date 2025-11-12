/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'aurisvoice-backend.onrender.com'],
  },
  // Optimize for performance
  swcMinify: true,
  poweredByHeader: false,
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // i18n configuration
  i18n: {
    locales: ['fr', 'en', 'es'],
    defaultLocale: 'fr',
    localeDetection: false,
  },
}

module.exports = nextConfig

