'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Headphones,
  Clock,
  Globe,
  Play,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Music,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  lang: string;
  duration: string;
  date: string;
  status: string;
  fileUrl: string;
}

export default function Dashboard() {
  // Mock data - will connect to GET /api/projects later
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "demo-voice.mp3",
      lang: "fr",
      duration: "0:10",
      date: "2025-11-05",
      status: "Terminé",
      fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      id: 2,
      name: "english-sample.mp3",
      lang: "en",
      duration: "0:12",
      date: "2025-11-04",
      status: "Terminé",
      fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
      id: 3,
      name: "spanish-podcast.mp3",
      lang: "es",
      duration: "0:15",
      date: "2025-11-03",
      status: "Terminé",
      fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [playingId, setPlayingId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate KPIs
  const totalProjects = projects.length;
  const totalDuration = projects.reduce((acc, p) => {
    const [min, sec] = p.duration.split(':').map(Number);
    return acc + min * 60 + sec;
  }, 0);
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = totalDuration % 60;

  // Get favorite language
  const langCounts = projects.reduce((acc, p) => {
    acc[p.lang] = (acc[p.lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const favoriteLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'fr';

  // Language flags
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
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || project.lang === languageFilter;
    return matchesSearch && matchesLanguage;
  });

  // Actions
  const handlePlay = (project: Project) => {
    if (playingId === project.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = project.fileUrl;
        audioRef.current.play();
        setPlayingId(project.id);
      }
    }
  };

  const handleReDub = (project: Project) => {
    console.log('🔁 ReDub started for:', project.name);
    alert(`ReDub démarré pour ${project.name}`);
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      setProjects(projects.filter(p => p.id !== id));
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Mes Projets - AurisVoice</title>
        <meta name="description" content="Gérez et écoutez vos doublages IA" />
      </Head>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Main Dashboard */}
      <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Link href="/">
              <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span>Retour à l'accueil</span>
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
              <Headphones className="h-12 w-12 text-purple-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-3">
              🎧 Mes doublages IA
            </h1>
            <p className="text-xl text-white/60">
              Gérez et écoutez vos créations
            </p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Total Projects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Total projets</p>
                    <p className="text-4xl font-bold text-white">{totalProjects}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                    <Music className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Duration */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Durée totale</p>
                    <p className="text-4xl font-bold text-white">{totalMinutes}:{totalSeconds.toString().padStart(2, '0')}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Favorite Language */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Langue favorite</p>
                    <p className="text-4xl font-bold text-white">{languageFlags[favoriteLanguage]} {favoriteLanguage.toUpperCase()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-500 to-indigo-500 rounded-xl">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-10" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
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
              </div>
            </div>
          </motion.div>

          {/* Projects Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-10" />
            
            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Music className="h-8 w-8 text-purple-400" />
                Mes projets
              </h2>

              {filteredProjects.length === 0 ? (
                // Empty State
                <div className="text-center py-16">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Headphones className="h-20 w-20 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg mb-2">
                      {searchQuery || languageFilter !== 'all' 
                        ? 'Aucun projet trouvé' 
                        : 'Aucun projet pour le moment'}
                    </p>
                    <p className="text-white/40 text-sm">
                      {searchQuery || languageFilter !== 'all'
                        ? 'Essayez de modifier vos filtres'
                        : 'Créez votre premier doublage depuis la page d\'accueil'}
                    </p>
                  </motion.div>
                </div>
              ) : (
                // Projects Table
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Fichier</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Langue</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Durée</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Date</th>
                        <th className="text-left py-4 px-4 text-white/60 font-semibold text-sm">Statut</th>
                        <th className="text-center py-4 px-4 text-white/60 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project, index) => (
                        <motion.tr
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {/* Filename - Clickable */}
                          <td className="py-4 px-4">
                            <Link href={`/dashboard/${project.id}`}>
                              <div className="flex items-center gap-3 group">
                                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                  <Music className="h-5 w-5 text-purple-400" />
                                </div>
                                <span className="text-white font-medium group-hover:text-purple-300 transition-colors">
                                  {project.name}
                                </span>
                              </div>
                            </Link>
                          </td>

                          {/* Language */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{languageFlags[project.lang]}</span>
                              <span className="text-white/80">{languageNames[project.lang]}</span>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-4">
                            <span className="text-white/80">{project.duration}</span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-4">
                            <span className="text-white/60 text-sm">{project.date}</span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                              <span className="text-green-300 text-sm font-medium">{project.status}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Play Button */}
                              <motion.button
                                onClick={() => handlePlay(project)}
                                className={`p-2 rounded-lg transition-all ${
                                  playingId === project.id
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                                }`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Écouter"
                              >
                                <Play className="h-5 w-5" />
                              </motion.button>

                              {/* ReDub Button */}
                              <motion.button
                                onClick={() => handleReDub(project)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Re-doubler"
                              >
                                <RotateCcw className="h-5 w-5" />
                              </motion.button>

                              {/* Delete Button */}
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

              {/* Results Count */}
              {filteredProjects.length > 0 && (
                <div className="mt-6 text-center">
                  <p className="text-white/40 text-sm">
                    {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} affiché{filteredProjects.length > 1 ? 's' : ''}
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

