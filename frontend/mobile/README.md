# 📱 AurisVoice - Mobile App (Capacitor)

Ce dossier contient la configuration Capacitor pour générer les applications natives Android et iOS à partir de la PWA.

## 📋 Prérequis

- Node.js 18+
- Capacitor CLI: `npm install -g @capacitor/cli`
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)

## 🚀 Installation

```bash
# Installer Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/app @capacitor/splash-screen @capacitor/status-bar

# Installer les plateformes
npx cap add android
npx cap add ios
```

## 🔧 Configuration

Le fichier `capacitor.config.ts` est déjà configuré avec :
- App ID: `com.aurisvoice.app`
- App Name: `AurisVoice`
- Web Directory: `www` (export statique Next.js)
- Splash Screen configuré (launchShowDuration: 0)
- Status Bar configurée (style: DARK)

## 📦 Build Next.js pour Capacitor

Avant de générer l'app native, build Next.js avec export statique :

```bash
cd ..
npm run build:pwa
```

Ce script :
1. Utilise la configuration d'export statique (`next.config.export.js`)
2. Build Next.js avec `output: 'export'`
3. Déplace le dossier `out/` vers `mobile/www/`
4. Copie les fichiers PWA (manifest.json, sw.js, icons, splash, screenshots)
5. Restaure la configuration originale

**Note:** Le build normal (`npm run build`) reste inchangé et utilise `output: 'standalone'`.

## 🤖 Android

### Installation (première fois)

```bash
# Depuis le dossier frontend/
./scripts/install-capacitor.sh
./scripts/configure-android.sh
```

Ce script installe Capacitor et configure automatiquement la plateforme Android.

### Configuration manuelle (si nécessaire)

Après l'installation, vérifiez manuellement :

1. **AndroidManifest.xml** (`mobile/android/app/src/main/AndroidManifest.xml`)
   - Vérifier `android:usesCleartextTraffic="true"` dans `<application>`
   - Vérifier `android:exported="true"` dans `<activity>` (MainActivity)
   - Vérifier `android:screenOrientation="portrait"`

2. **build.gradle** (`mobile/android/app/build.gradle`)
   - Vérifier `minSdkVersion = 23`
   - Vérifier `targetSdkVersion = 34`
   - Vérifier `versionCode = 1` et `versionName = "1.0.0"`

3. **styles.xml** (`mobile/android/app/src/main/res/values/styles.xml`)
   - Vérifier `android:statusBarColor="@android:color/transparent"`
   - Vérifier `android:windowLightStatusBar="false"`

### Scripts disponibles

```bash
# Synchroniser les fichiers web avec Android
npm run android:sync

# Ouvrir dans Android Studio
npm run android:open

# Build PWA + copier vers Android
npm run android:build

# Générer APK (Debug)
npm run android:apk

# Générer AAB (Release pour Play Store)
npm run android:aab

# Vérifier les fichiers PWA
npm run android:verify
```

### Générer un APK (Debug)

```bash
npm run android:apk
```

L'APK sera généré dans : `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

**Installer sur un appareil :**
```bash
adb install mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

### Générer un AAB (Release pour Play Store)

```bash
npm run android:aab
```

L'AAB sera généré dans : `mobile/android/app/build/outputs/bundle/release/app-release.aab`

**Note :** L'AAB nécessite une signature pour être installé ou publié sur Play Store.

### Dans Android Studio

1. Ouvrir le projet : `npm run android:open`
2. Attendre la synchronisation Gradle
3. Connecter un appareil Android ou lancer un émulateur
4. Cliquer sur "Run" (▶️)
5. L'app se compile et s'installe

### Générer via Android Studio

1. Build → Generate Signed Bundle / APK
2. Choisir "Android App Bundle" (recommandé pour Play Store) ou "APK"
3. Suivre les étapes de signature
4. Le fichier sera généré dans `android/app/build/outputs/`

## 🍎 iOS

### Prérequis iOS

- macOS avec Xcode installé
- xcode-select configuré : `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- Compte développeur Apple (gratuit pour test, payant pour App Store)

### Installation (première fois)

```bash
# Depuis le dossier frontend/
./scripts/install-capacitor-ios.sh
./scripts/configure-ios.sh
```

Ce script installe Capacitor iOS et configure automatiquement la plateforme.

### Configuration manuelle (si nécessaire)

Après l'installation, vérifiez manuellement :

1. **Info.plist** (`mobile/ios/App/App/Info.plist`)
   - Vérifier `UIViewControllerBasedStatusBarAppearance = false`
   - Vérifier `UIStatusBarStyle = UIStatusBarStyleDarkContent`
   - Vérifier `WKAllowsBackForwardNavigationGestures = true`
   - Vérifier `UIRequiresFullScreen = true`
   - Vérifier `LSRequiresIPhoneOS = true`
   - Vérifier `UIApplicationSupportsIndirectInputEvents = true`

2. **Xcode Project Settings**
   - Ouvrir : `npm run ios:open`
   - Vérifier iOS Deployment Target = 14.0
   - Vérifier Bundle Identifier = com.aurisvoice.app
   - Vérifier Version = 1.0.0, Build = 1
   - Vérifier Devices = iPhone only

3. **Code Signing**
   - Sélectionner votre équipe de développement
   - Vérifier que le certificat est valide

### Scripts disponibles

```bash
# Synchroniser les fichiers web avec iOS
npm run ios:sync

# Ouvrir dans Xcode
npm run ios:open

# Build PWA + copier vers iOS
npm run ios:build

# Build + ouvrir dans Xcode
npm run ios:prepare
```

### Compiler et lancer dans Xcode

1. **Ouvrir le projet** :
   ```bash
   npm run ios:open
   ```

2. **Dans Xcode** :
   - Sélectionner un simulateur ou un appareil iOS
   - Cliquer sur "Run" (▶️) ou Cmd+R
   - L'app se compile et se lance automatiquement

### Lancer sur iPhone réel

1. **Connecter l'iPhone** via USB
2. **Déverrouiller l'iPhone**
3. **Faire confiance à l'ordinateur** sur l'iPhone
4. **Dans Xcode** :
   - Sélectionner l'iPhone dans la liste des appareils
   - Cliquer sur "Run" (▶️)
5. **Sur l'iPhone** :
   - Paramètres > Général > Gestion de l'appareil
   - Sélectionner votre profil développeur
   - Appuyer sur "Faire confiance"

### Générer IPA

#### Pour Ad Hoc Distribution (test)
1. Product → Archive
2. Organizer → Distribute App
3. Choisir "Ad Hoc"
4. Suivre les étapes

#### Pour App Store Connect (publication)
1. Product → Archive
2. Organizer → Distribute App
3. Choisir "App Store Connect"
4. Suivre les étapes
5. L'IPA sera uploadé vers App Store Connect

### TestFlight (préparation)

1. **App Store Connect** :
   - Se connecter à [App Store Connect](https://appstoreconnect.apple.com)
   - Sélectionner votre app
   - Aller dans "TestFlight"

2. **Ajouter des testeurs** :
   - Testeurs internes (membres de l'équipe)
   - Testeurs externes (créer un groupe)

3. **Uploader un build** :
   - Via Xcode (Product > Archive > Distribute App)
   - Le build sera traité (10-30 minutes)

4. **Soumettre pour review** :
   - Ajouter des notes de test
   - Soumettre pour review externe (si nécessaire)

## 🔄 Mise à jour

Après chaque modification du code Next.js :

```bash
# 1. Rebuild Next.js pour Capacitor
npm run build:pwa

# 2. Synchroniser avec Capacitor
npm run android:sync  # Pour Android
npm run ios:sync       # Pour iOS

# 3. Rebuild dans Android Studio / Xcode
npm run android:open   # Pour Android
npm run ios:open       # Pour iOS
```

**Ou en une commande :**
```bash
npm run android:build  # Build + sync Android
npm run ios:build      # Build + sync iOS
npm run ios:prepare    # Build + ouvre Xcode
```

## 📝 Notes

- Le webDir pointe vers `www` (export statique dans `mobile/www/`)
- Pour le développement, décommentez `server.url` dans `capacitor.config.ts`
- Les plugins Capacitor sont configurés (SplashScreen, StatusBar)
- Les icônes et splash screens sont copiés automatiquement depuis `public/`
- Le service worker (`sw.js`) est fonctionnel dans Capacitor
- Les chemins dans `manifest.json` et `sw.js` utilisent des chemins absolus (`/`) pour compatibilité Capacitor

## 🐛 Dépannage

### Erreur "webDir not found"
- Vérifiez que `npm run build:pwa` a été exécuté depuis le dossier `frontend/`
- Vérifiez que le dossier `mobile/www/` existe et contient les fichiers
- Vérifiez que le chemin `www` dans `capacitor.config.ts` est correct (relatif au dossier `mobile/`)

### Erreur de signature (iOS)
- Vérifiez votre compte développeur dans Xcode
- Vérifiez les certificats dans Keychain Access

### Erreur de build Android
- Vérifiez que Android SDK est installé
- Vérifiez les versions dans `android/build.gradle`

## 📚 Documentation

- Capacitor: https://capacitorjs.com/docs
- Android: https://developer.android.com
- iOS: https://developer.apple.com

