'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '@/i18n/useTranslation';
import { FileUpload } from '@/components/FileUpload';
import { LanguageSelector } from '@/components/LanguageSelector';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Loader2, 
  Download, 
  Mic2, 
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Play,
  ArrowRight,
  AudioWaveform,
  WifiOff
} from 'lucide-react';
import { generateDub } from '@/lib/api';
import { useIsOffline } from '@/lib/useIsOffline';

export default function Home() {
  const { t } = useTranslation();
  const isOffline = useIsOffline();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dubInfo, setDubInfo] = useState<any>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier audio ou vidéo');
      return;
    }

    if (isOffline) {
      setError('Vous êtes hors ligne. Le doublage nécessite une connexion internet.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setDubInfo(null);
    
    try {
      console.log('🎙️ Starting dub generation...');
      console.log('📁 File:', selectedFile.name);
      console.log('🌍 Target language:', targetLanguage);
      
      const result = await generateDub(selectedFile, targetLanguage);
      
      if (result.ok && result.data) {
        console.log('✅ Dub ready:', result.data);
        setAudioUrl(result.data.audioUrl);
        setDubInfo(result.data);
      } else {
        setError(result.error || 'Erreur lors de la génération du doublage');
      }
    } catch (error) {
      console.error('❌ Generation error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la génération du doublage');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>AurisVoice - La Rolls du doublage vocal IA</title>
        <meta name="description" content="Transformez vos vidéos et podcasts en voix multilingues réalistes en quelques secondes" />
      </Head>

      {/* 1️⃣ HERO SECTION - Full Screen */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 dark:from-black dark:via-indigo-950 dark:to-purple-950">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: Math.random() * 4 + 2 + 'px',
                  height: Math.random() * 4 + 2 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo Icon */}
            <motion.div
              className="inline-block mb-6"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-2xl opacity-50" />
                <Mic2 className="relative h-20 w-20 text-white" strokeWidth={1.5} />
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                AurisVoice
              </span>
            </h1>

            {/* Slogan */}
            <motion.p
              className="text-2xl md:text-3xl font-light text-white/90 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              La Rolls du doublage vocal IA.
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Transformez vos vidéos et podcasts en voix multilingues réalistes en quelques secondes.
            </motion.p>

            {/* CTA Button */}
            <motion.button
              onClick={scrollToUpload}
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Headphones className="h-6 w-6" />
              <span>Démarrer un doublage</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Floating Badge */}
            <motion.div
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Sparkles className="h-4 w-4" />
              <span>Propulsé par OpenAI & ElevenLabs</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* 2️⃣ DEMO SECTION */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Écoutez la différence
              <span className="block text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
                AurisVoice
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Notre moteur vocal IA crée une immersion sonore inégalée avec des voix naturelles et expressives.
            </p>

            {/* Demo Audio Player */}
            <div className="relative">
              <motion.div
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <AudioWaveform className="h-8 w-8 text-purple-400" />
                  <span className="text-white font-semibold text-lg">
                    Exemple de doublage IA
                  </span>
                </div>
                
                <div className="relative bg-black/40 rounded-2xl p-6 border border-purple-500/20">
                  <audio
                    controls
                    className="w-full"
                    src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                  >
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                </div>

                <p className="mt-6 text-sm text-gray-400 italic">
                  Voix générée par IA • Qualité studio • Multilingue
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3️⃣ FEATURES SECTION */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pourquoi choisir AurisVoice ?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              La technologie vocale premium pour vos contenus audio et vidéo
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative p-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-sm border border-indigo-500/20 rounded-2xl hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Mic2 className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Doublage réaliste
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  Voix naturelles et expressives grâce à l'IA de pointe. Chaque intonation, chaque émotion est préservée.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ultra-rapide
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  Génération instantanée de vos doublages. De l'upload à l'écoute en quelques secondes seulement.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative p-8 bg-gradient-to-br from-pink-900/30 to-indigo-900/30 backdrop-blur-sm border border-pink-500/20 rounded-2xl hover:border-pink-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  5 langues
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  Français, Anglais, Espagnol, Allemand, Italien. Élargissez votre audience à l'international.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📤 UPLOAD SECTION */}
      <section 
        ref={uploadSectionRef}
        className="py-24 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Créez votre doublage
              </h2>
              <p className="text-lg text-gray-400">
                Upload, sélectionnez, générez. C'est aussi simple que ça.
              </p>
            </div>

            {/* Main Upload Card - Glassmorphism */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20" />
              
              <div className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="space-y-8">
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Mic2 className="h-4 w-4" />
                      Fichier audio ou vidéo
                    </label>
                    <FileUpload onFileSelect={setSelectedFile} />
                    <p className="mt-3 text-xs text-gray-500">
                      MP3, WAV, MP4, AVI • Maximum 50 Mo
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <LanguageSelector
                      label="🌍 Langue cible"
                      value={targetLanguage}
                      onChange={setTargetLanguage}
                    />
                  </div>

                  {/* Generate Button */}
                  <motion.button
                    onClick={handleGenerate}
                    disabled={!selectedFile || isGenerating || isOffline}
                    className="w-full py-5 px-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold text-xl rounded-2xl shadow-xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3"
                    whileHover={selectedFile && !isGenerating && !isOffline ? { scale: 1.02 } : {}}
                    whileTap={selectedFile && !isGenerating && !isOffline ? { scale: 0.98 } : {}}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isOffline ? (
                      <>
                        <WifiOff className="h-7 w-7" />
                        <span>Hors ligne</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="h-7 w-7" />
                        <span>🎧 Generate Dub</span>
                      </>
                    )}
                  </motion.button>

                  {/* Processing Status */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-indigo-900/30 border border-indigo-500/30 rounded-2xl backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-center gap-3 text-indigo-300">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-indigo-400 rounded-full"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <span className="font-medium">
                          Génération en cours... Veuillez patienter 5-10 secondes
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-5 bg-red-900/30 border border-red-500/30 rounded-2xl backdrop-blur-sm"
                    >
                      <p className="text-red-300 text-center font-medium">
                        ❌ {error}
                      </p>
                    </motion.div>
                  )}

                  {/* Audio Player - Success State */}
                  {audioUrl && !isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      {/* Glow Effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur-xl opacity-30" />
                      
                      <div className="relative p-8 bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl border border-green-500/30 rounded-3xl">
                        {/* Success Header */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <CheckCircle2 className="h-8 w-8 text-green-400" />
                          <h3 className="text-2xl font-bold text-white">
                            Doublage généré avec succès !
                          </h3>
                        </div>

                        {/* Dub Info */}
                        {dubInfo && (
                          <div className="mb-6 flex justify-center gap-8">
                            <div className="text-center">
                              <p className="text-gray-400 text-sm mb-1">Langue</p>
                              <p className="text-white font-bold text-xl">{dubInfo.targetLanguage?.toUpperCase()}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400 text-sm mb-1">Provider</p>
                              <p className="text-white font-bold text-xl capitalize">{dubInfo.provider}</p>
                            </div>
                          </div>
                        )}

                        {/* Audio Player */}
                        <div className="mb-6 bg-black/40 rounded-2xl p-6">
                          <audio
                            controls
                            src={audioUrl}
                            className="w-full"
                            autoPlay
                          />
                        </div>

                        {/* Download Button */}
                        <div className="text-center">
                          <motion.a
                            href={audioUrl}
                            download={`aurisvoice-dub-${Date.now()}.mp3`}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Download className="h-5 w-5" />
                            Télécharger le doublage
                          </motion.a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4️⃣ CTA FINALE */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.15),transparent_50%)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Glass Card */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30" />
              
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 md:p-16">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  Prêt à révolutionner
                  <span className="block text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text">
                    vos vidéos ?
                  </span>
                </h2>

                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Rejoignez les créateurs qui transforment leurs contenus avec AurisVoice
                </p>

                <Link href="/dashboard">
                  <motion.button
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="h-6 w-6" />
                    <span>Tester AurisVoice</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>

                <p className="mt-8 text-sm text-gray-400">
                  Aucune carte de crédit requise • Essai gratuit
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5️⃣ FOOTER CUSTOM */}
      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Mic2 className="h-8 w-8 text-purple-400" />
              <span className="text-xl font-bold text-white">AurisVoice</span>
            </div>

            {/* Copyright */}
            <div className="text-gray-400 text-sm text-center">
              © 2025 AurisVoice · Propulsé par Synrgy Labs
            </div>

            {/* Links */}
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

