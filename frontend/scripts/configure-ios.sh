#!/bin/bash
# Script de configuration iOS après l'ajout de la plateforme Capacitor

set -e

IOS_DIR="mobile/ios"
CONFIG_DIR="mobile/ios-config"

echo "🍎 Configuration iOS pour AurisVoice..."
echo ""

# Vérifier que le dossier iOS existe
if [ ! -d "$IOS_DIR" ]; then
  echo "❌ Erreur: Le dossier $IOS_DIR n'existe pas."
  echo "   Exécutez d'abord: ./scripts/install-capacitor-ios.sh"
  exit 1
fi

# Vérifier que les templates existent
if [ ! -d "$CONFIG_DIR" ]; then
  echo "❌ Erreur: Le dossier $CONFIG_DIR n'existe pas."
  exit 1
fi

echo "📝 Application des configurations iOS..."
echo ""

# Info.plist
INFO_PLIST_PATH="$IOS_DIR/App/App/Info.plist"
if [ -f "$INFO_PLIST_PATH" ]; then
  echo "✅ Info.plist trouvé"
  echo "   ⚠️  Modification manuelle requise pour Info.plist"
  echo "      Vérifiez que les clés suivantes sont présentes:"
  echo "      - UIViewControllerBasedStatusBarAppearance = false"
  echo "      - UIStatusBarStyle = UIStatusBarStyleDarkContent"
  echo "      - WKAllowsBackForwardNavigationGestures = true"
  echo "      - UIRequiresFullScreen = true"
  echo "      - LSRequiresIPhoneOS = true"
  echo "      - UIApplicationSupportsIndirectInputEvents = true"
  echo ""
  echo "      Utilisez le template: $CONFIG_DIR/Info.plist.template"
else
  echo "⚠️  Info.plist non trouvé (sera créé par Capacitor)"
fi

# AppDelegate.swift
APP_DELEGATE_PATH="$IOS_DIR/App/App/AppDelegate.swift"
if [ -f "$APP_DELEGATE_PATH" ]; then
  echo "✅ AppDelegate.swift trouvé"
  if ! grep -q "window?.backgroundColor" "$APP_DELEGATE_PATH"; then
    echo "   → Remplacement de AppDelegate.swift..."
    cp "$CONFIG_DIR/AppDelegate.swift.template" "$APP_DELEGATE_PATH"
    echo "   ✅ AppDelegate.swift mis à jour"
  else
    echo "   ✅ AppDelegate.swift déjà configuré"
  fi
else
  echo "⚠️  AppDelegate.swift non trouvé (sera créé par Capacitor)"
fi

# LaunchScreen.storyboard
LAUNCH_SCREEN_PATH="$IOS_DIR/App/App/LaunchScreen.storyboard"
if [ -f "$LAUNCH_SCREEN_PATH" ]; then
  echo "✅ LaunchScreen.storyboard trouvé"
  if ! grep -q "AurisVoice" "$LAUNCH_SCREEN_PATH"; then
    echo "   → Remplacement de LaunchScreen.storyboard..."
    cp "$CONFIG_DIR/LaunchScreen.storyboard.template" "$LAUNCH_SCREEN_PATH"
    echo "   ✅ LaunchScreen.storyboard mis à jour"
  else
    echo "   ✅ LaunchScreen.storyboard déjà configuré"
  fi
else
  echo "⚠️  LaunchScreen.storyboard non trouvé (sera créé par Capacitor)"
fi

# Vérifier le projet Xcode
PROJECT_PATH="$IOS_DIR/App/App.xcodeproj"
if [ -d "$PROJECT_PATH" ]; then
  echo "✅ Projet Xcode trouvé"
  echo "   ⚠️  Configuration manuelle requise dans Xcode:"
  echo "      1. Ouvrir le projet: npm run ios:open"
  echo "      2. Sélectionner le projet 'App' dans le navigateur"
  echo "      3. Vérifier les paramètres suivants:"
  echo "         - iOS Deployment Target = 14.0"
  echo "         - Bundle Identifier = com.aurisvoice.app"
  echo "         - Version = 1.0.0"
  echo "         - Build = 1"
  echo "         - Devices = iPhone only"
else
  echo "⚠️  Projet Xcode non trouvé (sera créé par Capacitor)"
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 Vérifications manuelles recommandées:"
echo "   1. Info.plist: Vérifier toutes les clés requises"
echo "   2. Xcode Project: iOS Deployment Target, Bundle ID, Version"
echo "   3. Assets: Ajouter les icônes dans Assets.xcassets/AppIcon.appiconset/"
echo "   4. Signing: Configurer le code signing dans Xcode"
echo ""
echo "💡 Prochaines étapes:"
echo "   npm run ios:open  (ouvrir dans Xcode)"
echo "   Configurer le signing dans Xcode"
echo "   Build et run dans Xcode"

