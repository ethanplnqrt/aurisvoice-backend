'use client';

import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <>
      <Head>
        <title>Paiement Annulé - AurisVoice</title>
        <meta name="description" content="Votre paiement a été annulé" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          {/* Cancel Card */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-12 shadow-2xl text-center">
              
              {/* Cancel Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-xl" />
                  <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-6">
                    <XCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* Cancel Message */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Paiement Annulé
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/70 mb-8"
              >
                Votre paiement n'a pas été traité. Aucun montant n'a été débité.
              </motion.p>

              {/* Info */}
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
                      <CreditCard className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                      <div className="text-left">
                        <p className="text-white font-semibold mb-2">
                          Vous pouvez réessayer à tout moment
                        </p>
                        <p className="text-white/60 text-sm">
                          Vos informations de paiement sont sécurisées par Stripe. 
                          Vous pouvez retourner à la page des crédits pour effectuer un nouvel achat.
                        </p>
                      </div>
                    </div>
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
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    Réessayer
                  </motion.button>
                </Link>
                
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Retour au tableau de bord
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
                Aucun montant n'a été débité de votre compte
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

