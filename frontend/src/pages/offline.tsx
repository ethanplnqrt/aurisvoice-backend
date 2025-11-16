'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  RefreshCw, 
  Home,
  AlertCircle
} from 'lucide-react';

export default function Offline() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <Head>
        <title>Hors ligne - AurisVoice</title>
        <meta name="description" content="Vous êtes actuellement hors ligne" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Offline Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
              
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-6">
                    <WifiOff className="h-16 w-16 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Vous êtes hors ligne
              </motion.h1>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/70 mb-8"
              >
                Certaines fonctionnalités sont indisponibles sans connexion internet.
              </motion.p>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10" />
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <p className="text-white font-semibold mb-2">
                          Fonctionnalités disponibles hors ligne
                        </p>
                        <ul className="text-white/60 text-sm space-y-1">
                          <li>• Navigation entre les pages</li>
                          <li>• Consultation de l'historique</li>
                          <li>• Visualisation des crédits</li>
                        </ul>
                        <p className="text-white/40 text-xs mt-3">
                          Le doublage et les paiements nécessitent une connexion internet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Status Indicator */}
              {isOnline && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-100 font-semibold">
                      ✓ Connexion rétablie
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  onClick={handleReload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-5 w-5" />
                  Recharger
                </motion.button>
                
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Home className="h-5 w-5" />
                    Accueil
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

