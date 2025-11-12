'use client';

import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  RotateCcw,
  ArrowLeft,
  Music,
  Globe,
  Calendar,
  Cpu,
  Zap,
  Download,
  Upload
} from 'lucide-react';
import { ExportModal } from '@/components/ExportModal';

// Mock project data - will be replaced with API call
const mockProjects: Record<string, any> = {
  '1': {
    id: 1,
    name: "demo-voice.mp3",
    lang: "fr",
    duration: 10,
    date: "05 Novembre 2025",
    provider: "OpenAI TTS",
    model: "gpt-4o-mini-tts",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  '2': {
    id: 2,
    name: "english-sample.mp3",
    lang: "en",
    duration: 12,
    date: "04 Novembre 2025",
    provider: "OpenAI TTS",
    model: "gpt-4o-mini-tts",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  '3': {
    id: 3,
    name: "spanish-podcast.mp3",
    lang: "es",
    duration: 15,
    date: "03 Novembre 2025",
    provider: "Mock",
    model: "Demo",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
};

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

export default function StudioPlayer() {
  const router = useRouter();
  const { id } = router.query;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Get project data
  const project = id ? mockProjects[id as string] : null;

  // Update audio element when controls change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = speed;
      audioRef.current.loop = loop;
    }
  }, [volume, speed, loop, isMuted]);

  // Time update handler
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Playback controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleReDub = () => {
    console.log('🔁 ReDub lancé (mock) pour:', project?.name);
    alert(`ReDub lancé (mock) !\n\nFichier: ${project?.name}\nLangue: ${languageNames[project?.lang]}`);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If project not found
  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Projet non trouvé</p>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl">
              Retour au dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Studio - {project.name} - AurisVoice</title>
        <meta name="description" content="Studio de lecture et édition audio AurisVoice" />
      </Head>

      {/* Audio Element */}
      <audio ref={audioRef} src={project.fileUrl} />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectName={project.name}
        projectId={project.id}
      />

      {/* Main Studio View */}
      <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-950 via-purple-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Back Button & Export */}
          <div className="flex justify-between items-center mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link href="/dashboard">
                <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group">
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span>Retour au tableau de bord</span>
                </button>
              </Link>
            </motion.div>

            {/* Export Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload className="h-5 w-5" />
              <span>📤 Exporter le projet</span>
            </motion.button>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex items-center gap-3 mb-3">
              <Music className="h-10 w-10 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              🎧 Studio Audio
            </h1>
            <p className="text-xl text-white/60">
              {project.name}
            </p>
            <p className="text-sm text-white/40 mt-1">
              Explorez et affinez votre doublage IA
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Main: Waveform Player */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              {/* Waveform Container */}
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20" />
                
                <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                  
                  {/* Waveform Display (Mock) */}
                  <div className="mb-6">
                    <div className="relative h-40 bg-black/40 rounded-2xl border border-purple-500/20 overflow-hidden flex items-center justify-center gap-1 px-4">
                      {/* Mock Waveform Bars */}
                      {[...Array(60)].map((_, i) => {
                        const height = Math.random() * 80 + 20;
                        const delay = i * 0.02;
                        return (
                          <motion.div
                            key={i}
                            className="w-1 bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                            style={{ height: `${height}%` }}
                            initial={{ scaleY: 0.3, opacity: 0.5 }}
                            animate={{ 
                              scaleY: isPlaying ? [0.3, 1, 0.3] : 0.3,
                              opacity: isPlaying ? [0.5, 1, 0.5] : 0.5
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: isPlaying ? Infinity : 0,
                              delay: delay,
                              ease: "easeInOut"
                            }}
                          />
                        );
                      })}
                      
                      {/* Play Overlay */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Play className="h-16 w-16 text-white/60" />
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between items-center mt-4 text-white/60 text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || project.duration)}</span>
                    </div>

                    {/* Progress Bar */}
                    <input
                      type="range"
                      min="0"
                      max={duration || project.duration}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer mt-2
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-r
                        [&::-webkit-slider-thumb]:from-indigo-500
                        [&::-webkit-slider-thumb]:to-purple-500
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:shadow-lg
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-webkit-slider-thumb]:transition-transform"
                    />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    
                    {/* Play/Pause Button */}
                    <motion.button
                      onClick={togglePlay}
                      className="p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 rounded-full shadow-xl hover:shadow-purple-500/50 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white" />
                      )}
                    </motion.button>

                    {/* Loop Button */}
                    <motion.button
                      onClick={() => setLoop(!loop)}
                      className={`p-3 rounded-xl transition-all ${
                        loop
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Boucle"
                    >
                      {loop ? <Repeat1 className="h-6 w-6" /> : <Repeat className="h-6 w-6" />}
                    </motion.button>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl">
                      <motion.button
                        onClick={() => setIsMuted(!isMuted)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5 text-white/80" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-white/80" />
                        )}
                      </motion.button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-3
                          [&::-webkit-slider-thumb]:h-3
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-purple-500
                          [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <span className="text-white/60 text-sm w-8">{Math.round(volume * 100)}%</span>
                    </div>

                    {/* Speed Control */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
                      <Zap className="h-5 w-5 text-white/60" />
                      <select
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="bg-transparent text-white/80 text-sm font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="0.75" className="bg-gray-900">0.75×</option>
                        <option value="1" className="bg-gray-900">1×</option>
                        <option value="1.25" className="bg-gray-900">1.25×</option>
                        <option value="1.5" className="bg-gray-900">1.5×</option>
                      </select>
                    </div>

                    {/* Download Button */}
                    <motion.a
                      href={project.fileUrl}
                      download={project.name}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Télécharger"
                    >
                      <Download className="h-6 w-6" />
                    </motion.a>
                  </div>

                  {/* Playback Info */}
                  <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                      {isPlaying ? '▶️ En lecture' : '⏸️ En pause'} • 
                      Vitesse {speed}× • 
                      Volume {Math.round(volume * 100)}% • 
                      {loop ? 'Boucle activée' : 'Lecture normale'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: File Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Info Card */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur opacity-20" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Music className="h-6 w-6 text-purple-400" />
                    Informations
                  </h3>

                  <div className="space-y-4">
                    {/* Filename */}
                    <div className="flex items-start gap-3">
                      <Music className="h-5 w-5 text-white/60 mt-0.5" />
                      <div>
                        <p className="text-white/40 text-xs mb-1">Fichier</p>
                        <p className="text-white font-medium break-all">{project.name}</p>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-white/60 mt-0.5" />
                      <div>
                        <p className="text-white/40 text-xs mb-1">Langue</p>
                        <p className="text-white font-medium">
                          {languageFlags[project.lang]} {languageNames[project.lang]}
                        </p>
                      </div>
                    </div>

                    {/* Provider */}
                    <div className="flex items-start gap-3">
                      <Cpu className="h-5 w-5 text-white/60 mt-0.5" />
                      <div>
                        <p className="text-white/40 text-xs mb-1">Modèle IA</p>
                        <p className="text-white font-medium">{project.provider}</p>
                        <p className="text-white/60 text-xs">{project.model}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-white/60 mt-0.5" />
                      <div>
                        <p className="text-white/40 text-xs mb-1">Date du doublage</p>
                        <p className="text-white font-medium">{project.date}</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-6 h-px bg-white/10" />

                  {/* ReDub Button */}
                  <motion.button
                    onClick={handleReDub}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="h-5 w-5" />
                    🔁 ReDub ce fichier
                  </motion.button>

                  <p className="mt-3 text-center text-white/40 text-xs">
                    Générer une nouvelle version avec des paramètres différents
                  </p>
                </div>
              </div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur opacity-20" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-4">Statistiques</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Durée</span>
                      <span className="text-white font-medium">{formatTime(project.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Format</span>
                      <span className="text-white font-medium">MP3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Qualité</span>
                      <span className="text-white font-medium">Studio</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Lectures</span>
                      <span className="text-white font-medium">—</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
              <Music className="h-5 w-5 text-purple-400" />
              <span className="text-white/60 text-sm">
                AurisVoice Studio – Version beta 1.0
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

