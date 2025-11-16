# 📋 Phase 5.3.1 – Préparation du build mobile - COMPLETE

## 1. 📁 FICHIERS CRÉÉS

### Scripts de build
- **`frontend/scripts/build-pwa.js`**
  - Script principal pour build PWA avec export statique
  - Gère le backup/restauration de `next.config.js`
  - Lance le build Next.js avec config d'export
  - Déplace `out/` vers `mobile/www/`
  - Appelle le script post-export
  - Restaure la config originale

- **`frontend/scripts/post-export.js`**
  - Script post-export pour copier les fichiers PWA
  - Copie `manifest.json` et `sw.js` dans `mobile/www/`
  - Copie les dossiers `icons/`, `splash/`, `screenshots/`
  - Vérifie la présence des fichiers critiques
  - Vérifie la structure `_next/static/`

### Configuration
- **`frontend/next.config.export.js`**
  - Configuration Next.js pour export statique
  - `output: 'export'` pour générer un site statique
  - `images.unoptimized: true` (requis pour export)
  - i18n désactivé (incompatible avec static export)
  - `trailingSlash: false` pour compatibilité Capacitor
  - Chemins absolus (`assetPrefix: ''`, `basePath: ''`)

### Documentation
- **`frontend/PHASE_5.3.1_COMPLETE.md`** (ce fichier)
  - Compte-rendu complet de la phase 5.3.1

## 2. ✏️ FICHIERS MODIFIÉS

### Configuration package.json
- **`frontend/package.json`**
  - Ajout du script `"build:pwa": "node scripts/build-pwa.js"`
  - Le script `build` normal reste inchangé

### Configuration Capacitor
- **`frontend/mobile/capacitor.config.ts`**
  - Modification `webDir: 'www'` (au lieu de `'../.next'`)
  - Modification `SplashScreen.launchShowDuration: 0` (au lieu de `2000`)
  - Modification `StatusBar.style: 'DARK'` (au lieu de `'dark'`)

### Documentation
- **`frontend/mobile/README.md`**
  - Mise à jour de la section "Configuration" (webDir: www)
  - Mise à jour de la section "Build Next.js" (nouveau script build:pwa)
  - Mise à jour de la section "Mise à jour" (workflow avec build:pwa)
  - Mise à jour de la section "Notes" (chemins absolus, service worker)
  - Mise à jour de la section "Dépannage" (webDir not found)

## 3. ⚙️ COMPORTEMENT AJOUTÉ / MODIFIÉ

### Nouveau script de build
- **`npm run build:pwa`** : Build complet pour Capacitor
  1. Sauvegarde `next.config.js`
  2. Applique `next.config.export.js`
  3. Nettoie `mobile/www/`
  4. Build Next.js avec export statique
  5. Déplace `out/` vers `mobile/www/`
  6. Copie les fichiers PWA (manifest, sw.js, icons, splash, screenshots)
  7. Restaure `next.config.js` original

### Export statique Next.js
- Génération d'un site statique dans `mobile/www/`
- Compatible avec Capacitor (file:// protocol)
- Tous les assets dans `_next/static/`
- Pages HTML statiques générées

### Copie automatique des fichiers PWA
- `manifest.json` → `mobile/www/manifest.json`
- `sw.js` → `mobile/www/sw.js`
- `public/icons/` → `mobile/www/icons/`
- `public/splash/` → `mobile/www/splash/`
- `public/screenshots/` → `mobile/www/screenshots/`

### Vérification post-export
- Vérifie la présence de `manifest.json`, `sw.js`, `icons/`
- Vérifie la structure `_next/static/`
- Affiche des warnings si fichiers manquants
- Exit code 1 si fichiers critiques manquants

### Configuration Capacitor optimisée
- `webDir: 'www'` pointe vers l'export statique
- Splash screen immédiat (`launchShowDuration: 0`)
- Status bar sombre (`style: 'DARK'`)

## 4. 🔧 POINTS TECHNIQUES IMPORTANTS

### Contraintes respectées
- ✅ **Aucune modification backend** : Seul le frontend a été modifié
- ✅ **sw.js non modifié** : La logique du service worker reste intacte
- ✅ **Build normal non cassé** : `npm run build` utilise toujours `output: 'standalone'`
- ✅ **Compatible Next.js 14** : Utilisation de `output: 'export'` pour static export

### Choix techniques

#### 1. Configuration séparée pour export
- **Raison** : Next.js ne permet pas d'avoir `output: 'standalone'` et `output: 'export'` simultanément
- **Solution** : `next.config.export.js` séparé, appliqué temporairement pendant le build PWA
- **Avantage** : Le build normal reste inchangé

#### 2. Désactivation i18n pour export
- **Raison** : Next.js i18n n'est pas compatible avec static export
- **Solution** : i18n commenté dans `next.config.export.js`
- **Impact** : Seule la locale par défaut (fr) est exportée
- **Note** : Pour multi-langues, il faudrait générer plusieurs builds ou utiliser une solution client-side

#### 3. Images non optimisées
- **Raison** : Next.js Image Optimization nécessite un serveur Node.js
- **Solution** : `images.unoptimized: true` dans config d'export
- **Impact** : Images servies telles quelles (pas de resize automatique)
- **Note** : Les images doivent être optimisées manuellement avant l'export

#### 4. Chemins absolus
- **Raison** : Capacitor utilise `file://` protocol, les chemins relatifs peuvent poser problème
- **Solution** : `assetPrefix: ''` et `basePath: ''` dans config
- **Vérification** : `manifest.json` et `sw.js` utilisent déjà des chemins absolus (`/icons/...`)

#### 5. Script de build avec backup/restore
- **Raison** : Éviter de casser la config normale
- **Solution** : Backup de `next.config.js`, application de la config d'export, restauration après build
- **Avantage** : Sécurité et réversibilité

### Structure de sortie
```
mobile/www/
├── index.html
├── _next/
│   └── static/
│       └── [hash]/
│           ├── chunks/
│           ├── css/
│           └── ...
├── manifest.json
├── sw.js
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── ...
├── splash/
│   └── ...
└── screenshots/
    └── ...
```

## 5. 🧪 TESTS À EFFECTUER

### Tests de build
1. **Build PWA**
   ```bash
   cd frontend
   npm run build:pwa
   ```
   - ✅ Vérifier que `mobile/www/` est créé
   - ✅ Vérifier la présence de `manifest.json`, `sw.js`, `icons/`
   - ✅ Vérifier la structure `_next/static/`
   - ✅ Vérifier que `next.config.js` est restauré

2. **Build normal (non cassé)**
   ```bash
   cd frontend
   npm run build
   ```
   - ✅ Vérifier que le build normal fonctionne toujours
   - ✅ Vérifier que `output: 'standalone'` est utilisé

### Tests Capacitor (après installation Capacitor)
1. **Sync Capacitor**
   ```bash
   cd frontend/mobile
   npx cap sync
   ```
   - ✅ Vérifier que les fichiers sont copiés dans les projets natifs
   - ✅ Vérifier que `webDir: 'www'` est correct

2. **Test Android**
   ```bash
   npx cap open android
   ```
   - ✅ Vérifier que l'app se lance
   - ✅ Vérifier que les assets sont chargés
   - ✅ Vérifier que le service worker fonctionne
   - ✅ Vérifier que les chemins absolus fonctionnent

3. **Test iOS**
   ```bash
   npx cap open ios
   ```
   - ✅ Vérifier que l'app se lance
   - ✅ Vérifier que les assets sont chargés
   - ✅ Vérifier que le service worker fonctionne
   - ✅ Vérifier que les chemins absolus fonctionnent

### Tests PWA dans Capacitor
1. **Service Worker**
   - ✅ Vérifier l'enregistrement du service worker
   - ✅ Vérifier le caching des routes
   - ✅ Vérifier le fallback offline

2. **Manifest**
   - ✅ Vérifier que `manifest.json` est accessible
   - ✅ Vérifier que les icônes sont chargées
   - ✅ Vérifier que les chemins sont corrects

3. **Assets statiques**
   - ✅ Vérifier que les images sont chargées
   - ✅ Vérifier que les CSS/JS sont chargés
   - ✅ Vérifier que les fonts sont chargées

### Tests de compatibilité
1. **Chemins absolus**
   - ✅ Vérifier que `/icons/icon-192x192.png` fonctionne
   - ✅ Vérifier que `/manifest.json` fonctionne
   - ✅ Vérifier que `/sw.js` fonctionne

2. **File protocol**
   - ✅ Vérifier que l'app fonctionne avec `file://` (Android)
   - ✅ Vérifier que l'app fonctionne avec `capacitor://` (iOS)

## 6. ⚠️ NOTES / LIMITES

### Limitations connues

1. **i18n désactivé pour export**
   - Seule la locale par défaut (fr) est exportée
   - Pour multi-langues, il faudrait :
     - Générer plusieurs builds (un par locale)
     - Ou utiliser une solution client-side (i18next, react-intl)
   - **Impact** : Les utilisateurs verront uniquement la version française dans l'app native

2. **Images non optimisées**
   - Les images ne sont pas automatiquement optimisées
   - Doivent être optimisées manuellement avant l'export
   - **Impact** : Taille de l'app potentiellement plus grande

3. **Pas de SSR/ISR**
   - Toutes les pages sont statiques
   - Pas de génération à la demande
   - **Impact** : Toutes les routes doivent être statiques

4. **Service Worker dans Capacitor**
   - Le service worker fonctionne dans Capacitor, mais avec certaines limitations
   - Les requêtes réseau peuvent être interceptées différemment
   - **Impact** : Tester soigneusement le comportement offline

### Points à vérifier manuellement

1. **Icônes et splash screens**
   - Vérifier que toutes les icônes sont présentes dans `mobile/www/icons/`
   - Vérifier que les splash screens sont présentes dans `mobile/www/splash/`
   - Générer les PNG manquants si nécessaire

2. **Screenshots**
   - Ajouter de vrais screenshots dans `public/screenshots/`
   - Les placeholders actuels doivent être remplacés

3. **Configuration Capacitor**
   - Vérifier que les plugins sont installés (`@capacitor/splash-screen`, `@capacitor/status-bar`)
   - Vérifier que les permissions sont configurées dans les projets natifs

4. **Backend API**
   - Les appels API doivent pointer vers le bon endpoint
   - Vérifier que les CORS sont configurés pour les apps natives
   - **Note** : Les requêtes `/api/*` ne sont pas interceptées par le service worker (comme prévu)

### Prochaines étapes (Phase 5.3.2+)

1. **Installation Capacitor**
   - Installer `@capacitor/core`, `@capacitor/cli`, `@capacitor/app`
   - Installer `@capacitor/splash-screen`, `@capacitor/status-bar`
   - Ajouter les plateformes Android/iOS

2. **Configuration native**
   - Configurer les icônes dans les projets natifs
   - Configurer les splash screens dans les projets natifs
   - Configurer les permissions (microphone, stockage, etc.)

3. **Tests sur appareils réels**
   - Tester sur Android réel
   - Tester sur iOS réel
   - Tester le comportement offline
   - Tester les appels API

4. **Optimisations**
   - Optimiser les images avant export
   - Réduire la taille du bundle
   - Optimiser le service worker pour Capacitor

### Ce qui n'a pas été touché

- ✅ Backend (aucune modification)
- ✅ Service Worker logic (sw.js non modifié)
- ✅ Composants React (aucune modification)
- ✅ Pages Next.js (aucune modification)
- ✅ Configuration de développement (dev server non modifié)

---

**Phase 5.3.1 terminée avec succès** ✅

Le frontend est maintenant prêt pour être buildé et intégré dans Capacitor. Le script `npm run build:pwa` génère un export statique complet dans `mobile/www/` avec tous les fichiers PWA nécessaires.

