'use client';

import { motion } from 'framer-motion';
import { Mic2, Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 bg-black/60 backdrop-blur-xl">
      {/* Gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                  '0 0 30px rgba(147, 51, 234, 0.4)',
                  '0 0 20px rgba(99, 102, 241, 0.3)',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Mic2 className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <div className="text-sm font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AurisVoice
              </div>
              <div className="text-xs text-white/40">
                La Rolls du doublage vocal IA
              </div>
            </div>
          </motion.div>

          {/* Copyright & Powered by */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-sm text-white/60 mb-1">
              © {currentYear} AurisVoice · Propulsé par <span className="text-purple-400 font-semibold">Synrgy Labs</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <motion.div
                animate={{ 
                  opacity: [0.4, 1, 0.4],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-3 w-3 text-purple-400" />
              </motion.div>
              <span>OpenAI • ElevenLabs</span>
            </div>
          </motion.div>

          {/* Links */}
          <motion.div
            className="flex gap-6 text-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.a
              href="#"
              className="text-white/50 hover:text-white transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              <span>Conditions</span>
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 scale-x-0 group-hover:scale-x-100 transition-transform" />
            </motion.a>
            <motion.a
              href="#"
              className="text-white/50 hover:text-white transition-colors relative group"
              whileHover={{ y: -2 }}
            >
              <span>Contact</span>
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-purple-500/0 via-purple-500 to-purple-500/0 scale-x-0 group-hover:scale-x-100 transition-transform" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

