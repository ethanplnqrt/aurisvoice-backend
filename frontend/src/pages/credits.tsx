'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Sparkles,
  Check,
  ArrowLeft,
  AlertCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { getCredits, createCheckoutSession } from '@/lib/credits';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  description: string;
  popular?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    price: 5,
    credits: 15,
    description: '15 crédits de doublage IA',
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 15,
    credits: 60,
    description: '60 crédits de doublage IA',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    price: 30,
    credits: 150,
    description: '150 crédits de doublage IA',
  },
];

export default function Credits() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch current credits
  useEffect(() => {
    fetchCredits();
  }, []);

  // Check URL params for payment success/cancel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccess(true);
      // Refresh credits after successful payment
      setTimeout(() => {
        fetchCredits();
        // Clear URL params
        window.history.replaceState({}, '', '/credits');
      }, 1000);
    }
    if (params.get('canceled') === 'true') {
      setError('Paiement annulé');
      setTimeout(() => setError(null), 5000);
    }
  }, []);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCredits();
      
      if (data.ok) {
        setCredits(data.credits);
      } else {
        throw new Error(data.error || 'Failed to fetch credits');
      }
    } catch (err: any) {
      console.error('Error fetching credits:', err);
      setError(err.message || 'Erreur lors du chargement des crédits');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    try {
      setCheckoutLoading(planId);
      setError(null);
      
      const result = await createCheckoutSession(planId as 'starter' | 'pro' | 'premium');
      
      if (result.ok && result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Erreur lors de la création de la session de paiement');
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>Mes Crédits - AurisVoice</title>
        <meta name="description" content="Gérez vos crédits de doublage IA" />
      </Head>

      <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-950 via-purple-950 to-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link href="/dashboard">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Retour au tableau de bord</span>
              </button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <CreditCard className="h-12 w-12 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              💰 Mes Crédits
            </h1>
            <p className="text-xl text-white/60">
              Rechargez votre compte pour générer plus de doublages IA
            </p>
          </motion.div>

          {/* Success Toast */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 max-w-md mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30" />
                <div className="relative bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-100 font-semibold">Paiement réussi !</p>
                      <p className="text-green-200/60 text-sm">Vos crédits ont été ajoutés ✅</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Toast */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 max-w-md mx-auto"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur opacity-30" />
                <div className="relative bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-red-100 font-semibold">Erreur</p>
                      <p className="text-red-200/60 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Current Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-16 max-w-2xl mx-auto"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Crédits disponibles</p>
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                      <span className="text-2xl text-white/40">Chargement...</span>
                    </div>
                  ) : (
                    <motion.p
                      key={credits}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-6xl font-bold text-white"
                    >
                      {credits ?? 0}
                    </motion.p>
                  )}
                  <p className="text-white/40 text-sm mt-2">
                    1 crédit = ~10 secondes de doublage
                  </p>
                </div>
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl"
                >
                  <Sparkles className="h-12 w-12 text-white" />
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Pricing Plans */}
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white text-center mb-8"
            >
              Choisissez votre pack
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PLANS.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="relative group"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                        ⭐ POPULAIRE
                      </div>
                    </div>
                  )}
                  
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${
                    plan.popular 
                      ? 'from-purple-500 via-pink-500 to-purple-500' 
                      : 'from-indigo-500 via-purple-500 to-pink-500'
                  } rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`} />
                  
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl h-full flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-white/60 text-sm mb-4">
                        {plan.description}
                      </p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-white">
                            {plan.price}€
                          </span>
                        </div>
                        <p className="text-purple-300 font-semibold mt-2">
                          {plan.credits} crédits
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {(plan.price / plan.credits).toFixed(2)}€ / crédit
                        </p>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/80 text-sm">
                            {Math.floor(plan.credits * 10 / 60)} minutes de doublage
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/80 text-sm">
                            Voix naturelles multilingues
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                          <span className="text-white/80 text-sm">
                            Export illimité
                          </span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={checkoutLoading === plan.id}
                      className={`w-full py-4 px-6 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      } text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                      whileHover={{ scale: checkoutLoading === plan.id ? 1 : 1.05 }}
                      whileTap={{ scale: checkoutLoading === plan.id ? 1 : 0.95 }}
                    >
                      {checkoutLoading === plan.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Chargement...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          <span>Acheter maintenant</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-10" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">
                      Paiement sécurisé par Stripe
                    </h3>
                    <p className="text-white/60 text-sm">
                      Vos informations de paiement sont traitées de manière sécurisée. 
                      Nous ne stockons pas les détails de votre carte bancaire. 
                      Les crédits sont ajoutés instantanément après le paiement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

