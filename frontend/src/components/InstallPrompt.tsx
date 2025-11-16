'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check localStorage for dismissed state
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      }
    }

    // Listen for beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed (iOS Safari)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIOS && !isInStandaloneMode) {
      // Show iOS install instructions after a delay
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome/Edge install flow
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsVisible(false);
      }
      
      setDeferredPrompt(null);
    } else {
      // iOS Safari - show elegant instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // Show a modal with iOS instructions instead of alert
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        `;
        modal.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #000000 100%);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          ">
            <h2 style="color: white; font-size: 24px; font-weight: 700; margin-bottom: 20px; text-align: center;">
              Installer AurisVoice
            </h2>
            <div style="color: #a0a0a0; line-height: 1.8; margin-bottom: 25px;">
              <p style="margin-bottom: 15px;"><strong style="color: white;">1.</strong> Appuyez sur le bouton <strong style="color: white;">Partager</strong> <span style="font-size: 20px;">📤</span></p>
              <p style="margin-bottom: 15px;"><strong style="color: white;">2.</strong> Sélectionnez <strong style="color: white;">"Sur l'écran d'accueil"</strong> <span style="font-size: 20px;">➕</span></p>
              <p><strong style="color: white;">3.</strong> Appuyez sur <strong style="color: white;">"Ajouter"</strong></p>
            </div>
            <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="
              width: 100%;
              padding: 14px;
              background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
              color: white;
              border: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
              Compris
            </button>
          </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.remove();
          }
        });
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || isDismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
      >
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-30" />
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">
                  Installer AurisVoice
                </h3>
                <p className="text-white/70 text-xs mb-3">
                  Installez l'application pour un accès rapide et une meilleure expérience
                </p>
                
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleInstall}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Installer
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDismiss}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 text-xs font-semibold rounded-lg transition-all"
                  >
                    Plus tard
                  </motion.button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-1 text-white/50 hover:text-white transition-colors"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

