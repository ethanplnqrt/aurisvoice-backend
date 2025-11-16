/** @type {import('next').NextConfig} */
// Configuration for static export (Capacitor)
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'aurisvoice-backend.onrender.com'],
    unoptimized: true, // Required for static export
  },
  swcMinify: true,
  poweredByHeader: false,
  output: 'export', // Static export for Capacitor
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // i18n configuration - Note: static export with i18n requires all routes to be static
  // For Capacitor, we'll use the default locale only
  // i18n: {
  //   locales: ['fr', 'en', 'es'],
  //   defaultLocale: 'fr',
  //   localeDetection: false,
  // },
  // Disable trailing slash for Capacitor compatibility
  trailingSlash: false,
  // Ensure absolute paths for assets
  assetPrefix: '',
  basePath: '',
}

module.exports = nextConfig

