#!/bin/bash
# Script d'installation de Capacitor iOS

set -e

echo "🍎 Installation de Capacitor iOS pour AurisVoice..."
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "❌ Erreur: Ce script doit être exécuté depuis le dossier frontend/"
  exit 1
fi

# Vérifier que Xcode est installé
if ! command -v xcodebuild &> /dev/null; then
  echo "❌ Erreur: Xcode n'est pas installé ou xcode-select n'est pas configuré."
  echo "   Installez Xcode depuis l'App Store et exécutez: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

# Vérifier xcode-select
if ! xcode-select -p &> /dev/null; then
  echo "❌ Erreur: xcode-select n'est pas configuré."
  echo "   Exécutez: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

# Installer Capacitor et ses dépendances si pas déjà fait
if ! npm list @capacitor/core &> /dev/null; then
  echo "📦 Installation des packages Capacitor..."
  npm install @capacitor/core @capacitor/cli @capacitor/app @capacitor/splash-screen @capacitor/status-bar
fi

# Ajouter la plateforme iOS
echo ""
echo "🍎 Ajout de la plateforme iOS..."
npx cap add ios

# Synchroniser les fichiers
echo ""
echo "🔄 Synchronisation des fichiers..."
npm run build:pwa
npx cap sync ios

echo ""
echo "✅ Installation terminée!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. ./scripts/configure-ios.sh  (configurer iOS)"
echo "   2. npm run ios:open  (ouvrir dans Xcode)"
echo "   3. Configurer le signing dans Xcode"
echo "   4. Build et run dans Xcode"

