'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Mic2 } from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Mic2 className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AurisVoice
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { path: '/', label: t('home') },
              { path: '/dashboard', label: t('dashboard') },
              { path: '/history', label: 'Historique' },
              { path: '/credits', label: '💰 Crédits' },
              { path: '/about', label: t('about') },
            ].map((link) => (
              <Link key={link.path} href={link.path}>
                <motion.div
                  className="relative group"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-white'
                        : 'text-white/60 group-hover:text-white'
                    }`}
                  >
                    {link.label}
                  </span>
                  
                  {/* Animated underline */}
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActive(link.path) ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Hover underline */}
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

