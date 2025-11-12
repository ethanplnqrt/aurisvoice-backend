'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileAudio,
  Share2,
  CheckCircle2,
  Loader2,
  Copy
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: number;
}

type ExportFormat = 'mp3' | 'wav' | 'json';

export function ExportModal({ isOpen, onClose, projectName, projectId }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('mp3');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const formats = [
    { value: 'mp3' as ExportFormat, label: 'MP3', description: 'Audio compressé (recommandé)' },
    { value: 'wav' as ExportFormat, label: 'WAV', description: 'Audio non compressé (haute qualité)' },
    { value: 'json' as ExportFormat, label: 'JSON', description: 'Métadonnées du projet' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsExporting(false);
    setExportComplete(true);

    // Mock download
    console.log(`📤 Exporting ${projectName} as ${selectedFormat}`);
  };

  const handleShare = () => {
    const shareLink = `https://aurisvoice.com/share/${projectId}`;
    navigator.clipboard.writeText(shareLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
    console.log('🔗 Link copied:', shareLink);
  };

  const handleDownload = () => {
    // Mock download
    console.log(`💾 Downloading ${projectName}.${selectedFormat}`);
    alert(`Téléchargement de ${projectName}.${selectedFormat} démarré!`);
  };

  const handleClose = () => {
    setExportComplete(false);
    setIsExporting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="relative w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30" />

              {/* Modal Content */}
              <div className="relative bg-gray-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                        <FileAudio className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          📤 Exporter le projet
                        </h2>
                        <p className="text-sm text-white/60">{projectName}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-6 w-6 text-white/60" />
                    </motion.button>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  
                  {!exportComplete ? (
                    <>
                      {/* Format Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-white/80 mb-3">
                          Format d'export
                        </label>
                        <div className="space-y-2">
                          {formats.map((format) => (
                            <motion.button
                              key={format.value}
                              onClick={() => setSelectedFormat(format.value)}
                              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                selectedFormat === format.value
                                  ? 'border-purple-500 bg-purple-500/10'
                                  : 'border-white/10 bg-white/5 hover:border-white/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-semibold">{format.label}</p>
                                  <p className="text-white/50 text-sm">{format.description}</p>
                                </div>
                                {selectedFormat === format.value && (
                                  <CheckCircle2 className="h-6 w-6 text-purple-400" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Export Button */}
                      <motion.button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-3"
                        whileHover={!isExporting ? { scale: 1.02 } : {}}
                        whileTap={!isExporting ? { scale: 0.98 } : {}}
                      >
                        {isExporting ? (
                          <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Export en cours...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-6 w-6" />
                            <span>Exporter en {selectedFormat.toUpperCase()}</span>
                          </>
                        )}
                      </motion.button>
                    </>
                  ) : (
                    // Success State
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-8"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 className="h-20 w-20 text-green-400 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        ✅ Export terminé !
                      </h3>
                      <p className="text-white/60 mb-6">
                        Votre fichier est prêt à être téléchargé
                      </p>

                      {/* Download Button */}
                      <motion.button
                        onClick={handleDownload}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-3 mb-4"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="h-6 w-6" />
                        Télécharger {selectedFormat.toUpperCase()}
                      </motion.button>

                      {/* Share Button */}
                      <motion.button
                        onClick={handleShare}
                        className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {showCopied ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                            <span>Lien copié !</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-5 w-5" />
                            <span>Partager le lien</span>
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
