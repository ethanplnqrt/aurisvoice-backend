'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CheckCircle2 } from 'lucide-react';

export function InstallButton() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check iOS standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIOS && isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // iOS Safari - show instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert('Pour installer AurisVoice:\n\n1. Appuyez sur le bouton Partager (□↑)\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Appuyez sur "Ajouter"');
      }
    }
  };

  if (isInstalled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg"
        title="Application installée"
      >
        <CheckCircle2 className="h-4 w-4 text-green-400" />
        <span className="text-xs text-green-300 hidden sm:inline">Installé</span>
      </motion.div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <motion.button
      onClick={handleInstall}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-lg text-white text-xs font-semibold transition-all"
      title="Installer l'application"
    >
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">Installer</span>
    </motion.button>
  );
}

