#!/bin/bash
# Script de configuration Android après l'ajout de la plateforme Capacitor

set -e

ANDROID_DIR="mobile/android"
CONFIG_DIR="mobile/android-config"

echo "🔧 Configuration Android pour AurisVoice..."
echo ""

# Vérifier que le dossier Android existe
if [ ! -d "$ANDROID_DIR" ]; then
  echo "❌ Erreur: Le dossier $ANDROID_DIR n'existe pas."
  echo "   Exécutez d'abord: npx cap add android"
  exit 1
fi

# Vérifier que les templates existent
if [ ! -d "$CONFIG_DIR" ]; then
  echo "❌ Erreur: Le dossier $CONFIG_DIR n'existe pas."
  exit 1
fi

echo "📝 Application des configurations Android..."
echo ""

# AndroidManifest.xml
MANIFEST_PATH="$ANDROID_DIR/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST_PATH" ]; then
  echo "✅ AndroidManifest.xml trouvé"
  # Vérifier si les modifications sont déjà présentes
  if ! grep -q "android:usesCleartextTraffic" "$MANIFEST_PATH"; then
    echo "   → Ajout de usesCleartextTraffic..."
    # Note: Modification manuelle recommandée car le fichier est complexe
    echo "   ⚠️  Modification manuelle requise pour AndroidManifest.xml"
    echo "      Ajoutez: android:usesCleartextTraffic=\"true\" dans <application>"
    echo "      Ajoutez: android:exported=\"true\" dans <activity>"
  else
    echo "   ✅ AndroidManifest.xml déjà configuré"
  fi
else
  echo "⚠️  AndroidManifest.xml non trouvé (sera créé par Capacitor)"
fi

# MainActivity.java
MAIN_ACTIVITY_PATH="$ANDROID_DIR/app/src/main/java/com/aurisvoice/app/MainActivity.java"
if [ -f "$MAIN_ACTIVITY_PATH" ]; then
  echo "✅ MainActivity.java trouvé"
  if ! grep -q "BridgeActivity" "$MAIN_ACTIVITY_PATH"; then
    echo "   → Remplacement de MainActivity.java..."
    cp "$CONFIG_DIR/MainActivity.java.template" "$MAIN_ACTIVITY_PATH"
    echo "   ✅ MainActivity.java mis à jour"
  else
    echo "   ✅ MainActivity.java déjà configuré"
  fi
else
  echo "⚠️  MainActivity.java non trouvé (sera créé par Capacitor)"
fi

# build.gradle
BUILD_GRADLE_PATH="$ANDROID_DIR/app/build.gradle"
if [ -f "$BUILD_GRADLE_PATH" ]; then
  echo "✅ build.gradle trouvé"
  if ! grep -q "minSdkVersion.*23" "$BUILD_GRADLE_PATH"; then
    echo "   → Vérification de build.gradle..."
    echo "   ⚠️  Vérifiez manuellement que:"
    echo "      - minSdkVersion = 23"
    echo "      - targetSdkVersion = 34"
    echo "      - versionCode = 1"
    echo "      - versionName = \"1.0.0\""
  else
    echo "   ✅ build.gradle déjà configuré"
  fi
else
  echo "⚠️  build.gradle non trouvé (sera créé par Capacitor)"
fi

# styles.xml
STYLES_PATH="$ANDROID_DIR/app/src/main/res/values/styles.xml"
if [ -f "$STYLES_PATH" ]; then
  echo "✅ styles.xml trouvé"
  if ! grep -q "android:statusBarColor.*transparent" "$STYLES_PATH"; then
    echo "   → Mise à jour de styles.xml..."
    cp "$CONFIG_DIR/styles.xml.template" "$STYLES_PATH"
    echo "   ✅ styles.xml mis à jour"
  else
    echo "   ✅ styles.xml déjà configuré"
  fi
else
  echo "⚠️  styles.xml non trouvé (sera créé par Capacitor)"
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 Vérifications manuelles recommandées:"
echo "   1. AndroidManifest.xml: usesCleartextTraffic, exported"
echo "   2. build.gradle: minSdkVersion, targetSdkVersion, versionCode, versionName"
echo "   3. styles.xml: statusBarColor transparent"
echo ""
echo "💡 Prochaines étapes:"
echo "   npm run android:open  (ouvrir dans Android Studio)"
echo "   npm run android:apk   (générer APK)"

