#!/bin/bash
# Script d'installation de Capacitor et de la plateforme Android

set -e

echo "🚀 Installation de Capacitor pour AurisVoice..."
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  echo "❌ Erreur: Ce script doit être exécuté depuis le dossier frontend/"
  exit 1
fi

# Installer Capacitor et ses dépendances
echo "📦 Installation des packages Capacitor..."
npm install @capacitor/core @capacitor/cli @capacitor/app @capacitor/splash-screen @capacitor/status-bar

# Ajouter la plateforme Android
echo ""
echo "🤖 Ajout de la plateforme Android..."
npx cap add android

# Synchroniser les fichiers
echo ""
echo "🔄 Synchronisation des fichiers..."
npm run build:pwa
npx cap sync android

echo ""
echo "✅ Installation terminée!"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. npm run android:open  (ouvrir dans Android Studio)"
echo "   2. npm run android:apk  (générer APK de debug)"
echo "   3. npm run android:aab  (générer AAB pour Play Store)"

