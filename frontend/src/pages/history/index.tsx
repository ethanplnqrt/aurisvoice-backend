'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock,
  Music,
  Globe,
  Cpu,
  Calendar,
  Play,
  Download,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  FileAudio
} from 'lucide-react';

interface HistoryProject {
  id: number;
  file: string;
  lang: string;
  model: string;
  date: string;
  duration: string;
  provider: string;
}

export default function History() {
  const [historyProjects, setHistoryProjects] = useState<HistoryProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const res = await fetch('/api/history', { headers: { Accept: 'application/json' } });
        if (res.status === 404) {
          if (mounted) {
            setHistoryProjects([]);
          }
          return;
        }
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }
        const data = await res.json();
        if (mounted) {
          const list = Array.isArray(data) ? data : (Array.isArray(data?.history) ? data.history : []);
          setHistoryProjects(list as HistoryProject[]);
        }
      } catch (_) {
        if (mounted) setHasError(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const languageFlags: Record<string, string> = {
    fr: '🇫🇷',
    en: '🇬🇧',
    es: '🇪🇸',
    de: '🇩🇪',
    it: '🇮🇹'
  };

  const languageNames: Record<string, string> = {
    fr: 'Français',
    en: 'English',
    es: 'Español',
    de: 'Deutsch',
    it: 'Italiano'
  };

  // Filter projects
  const filteredProjects = historyProjects.filter(project => {
    const matchesSearch = project.file.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || project.lang === languageFilter;
    const matchesModel = modelFilter === 'all' || project.provider === modelFilter;
    return matchesSearch && matchesLanguage && matchesModel;
  });

  // Actions
  const handlePlay = (project: HistoryProject) => {
    console.log('▶️ Playing:', project.file);
    alert(`Lecture de ${project.file}`);
  };

  const handleDownload = (project: HistoryProject) => {
    console.log('📥 Downloading:', project.file);
    alert(`Téléchargement de ${project.file}`);
  };

  const handleReDub = (project: HistoryProject) => {
    console.log('🔁 ReDub:', project.file);
    alert(`ReDub lancé pour ${project.file}`);
  };

  const handleDelete = (id: number) => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce projet de l&apos;historique ?')) {
      setHistoryProjects(historyProjects.filter(p => p.id !== id));
    }
  };

  return (
    <>
      <Head>
        <title>Historique - AurisVoice</title>
        <meta name="description" content="Retrouvez tous vos doublages IA terminés" />
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
              <Clock className="h-12 w-12 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              🕒 Historique des doublages
            </h1>
            <p className="text-xl text-white/60">
              Retrouvez tous vos projets IA terminés
            </p>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative mb-12"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-10" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-white mb-1">{historyProjects.length}</p>
                  <p className="text-sm text-white/60">Total doublages</p>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {historyProjects.filter(p => p.provider === 'openai').length}
                  </p>
                  <p className="text-sm text-white/60">OpenAI TTS</p>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {historyProjects.filter(p => p.provider === 'elevenlabs').length}
                  </p>
                  <p className="text-sm text-white/60">ElevenLabs</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-10" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un fichier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Language Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
                  >
                    <option value="all">🌍 Toutes les langues</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="it">🇮🇹 Italiano</option>
                  </select>
                </div>

                {/* Model Filter */}
                <div className="relative">
                  <Cpu className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <select
                    value={modelFilter}
                    onChange={(e) => setModelFilter(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
                  >
                    <option value="all">🤖 Tous les modèles</option>
                    <option value="openai">OpenAI TTS</option>
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="mock">Mock</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* History Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-10" />
            
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <FileAudio className="h-8 w-8 text-purple-400" />
                Tous les projets
              </h2>

              {isLoading ? (
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-white/70 text-lg">Chargement de l'historique...</p>
                  </motion.div>
                </div>
              ) : filteredProjects.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5A2 2 0 003 8v9a2 2 0 002 2z"
                    />
                  </svg>
                  <h2 className="text-xl font-semibold">Aucun projet pour le moment</h2>
                  <p className="text-gray-400 mt-2 text-center">
                    Vos projets apparaîtront ici lorsque vous aurez effectué vos premiers doublages.
                  </p>
                </div>
              ) : (
                // History Table
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Fichier</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Langue</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Modèle IA</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Date</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Durée</th>
                        <th className="text-center py-4 px-4 text-white/60 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          {/* Filename */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Music className="h-5 w-5 text-purple-400" />
                              </div>
                              <span className="text-white font-medium">{project.file}</span>
                            </div>
                          </td>

                          {/* Language */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{languageFlags[project.lang]}</span>
                              <span className="text-white/80">{languageNames[project.lang]}</span>
                            </div>
                          </td>

                          {/* Model */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Cpu className="h-4 w-4 text-white/60" />
                              <span className="text-white/80">{project.model}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-white/60" />
                              <span className="text-white/60 text-sm">{project.date}</span>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-white/60" />
                              <span className="text-white/80">{project.duration}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Play */}
                              <motion.button
                                onClick={() => handlePlay(project)}
                                className="p-2 bg-white/10 hover:bg-purple-500/30 rounded-lg text-white/80 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Écouter"
                              >
                                <Play className="h-5 w-5" />
                              </motion.button>

                              {/* Download */}
                              <motion.button
                                onClick={() => handleDownload(project)}
                                className="p-2 bg-white/10 hover:bg-green-500/30 rounded-lg text-white/80 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Télécharger"
                              >
                                <Download className="h-5 w-5" />
                              </motion.button>

                              {/* ReDub */}
                              <motion.button
                                onClick={() => handleReDub(project)}
                                className="p-2 bg-white/10 hover:bg-blue-500/30 rounded-lg text-white/80 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Re-doubler"
                              >
                                <RotateCcw className="h-5 w-5" />
                              </motion.button>

                              {/* Delete */}
                              <motion.button
                                onClick={() => handleDelete(project.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Supprimer"
                              >
                                <Trash2 className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Results / Error */}
              {hasError && filteredProjects.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-red-300 text-sm">Une erreur est survenue lors du chargement de l'historique.</p>
                </div>
              )}
              {filteredProjects.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/40 text-sm">
                    {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} dans l'historique
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
