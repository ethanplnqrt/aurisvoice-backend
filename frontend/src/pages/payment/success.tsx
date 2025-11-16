'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch updated credits after payment
    const fetchCredits = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const response = await fetch(`${API_URL}/api/credits`);
        const data = await response.json();
        
        if (data.ok) {
          setCredits(data.credits);
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, []);

  return (
    <>
      <Head>
        <title>Paiement Réussi - AurisVoice</title>
        <meta name="description" content="Votre paiement a été traité avec succès" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Success Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
              
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl" />
                  <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-6">
                    <CheckCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                🎉 Paiement Réussi !
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/70 mb-8"
              >
                Vos crédits ont été ajoutés avec succès à votre compte
              </motion.p>

              {/* Credits Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <div className="relative inline-block">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <p className="text-white/60 text-sm mb-2">Nouveau solde</p>
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                        <span className="text-2xl text-white/40">Chargement...</span>
                      </div>
                    ) : (
                      <motion.p
                        key={credits}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-5xl font-bold text-white flex items-center justify-center gap-3"
                      >
                        {credits ?? 0}
                        <Sparkles className="h-8 w-8 text-purple-400" />
                      </motion.p>
                    )}
                    <p className="text-white/40 text-xs mt-2">crédits disponibles</p>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/credits">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white font-semibold transition-all"
                  >
                    Voir mes crédits
                  </motion.button>
                </Link>
                
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Commencer à doubler
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Info */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-white/40 text-sm mt-8"
              >
                Vous pouvez maintenant utiliser vos crédits pour générer des doublages IA
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

