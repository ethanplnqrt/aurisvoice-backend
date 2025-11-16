# ✅ Checklist PWA Ready - AurisVoice

Cette checklist permet de vérifier que l'application est prête pour un lancement public en tant que PWA et application native.

## 📱 Tests d'installation

### PWA Web (Chrome/Edge)
- [ ] L'app s'installe via le bouton "Installer" dans la barre d'adresse
- [ ] L'app s'installe via le prompt personnalisé (`beforeinstallprompt`)
- [ ] L'app apparaît dans le menu Applications
- [ ] L'icône est correcte après installation
- [ ] L'app se lance en mode standalone (sans barre d'adresse)
- [ ] Le `start_url` fonctionne correctement (`/?source=pwa`)

### iOS PWA (Safari)
- [ ] L'app peut être ajoutée à l'écran d'accueil via "Partager > Sur l'écran d'accueil"
- [ ] L'icône apparaît correctement sur l'écran d'accueil
- [ ] L'app se lance en mode standalone
- [ ] Les meta tags iOS sont présents (`apple-mobile-web-app-capable`, etc.)
- [ ] L'icône Apple Touch (180x180) est présente
- [ ] Les splash screens iOS fonctionnent

### Android WebAPK
- [ ] L'app peut être installée via Chrome/Edge
- [ ] L'app apparaît dans le launcher Android
- [ ] L'icône est correcte
- [ ] L'app se lance en mode standalone
- [ ] Les permissions sont correctes

## 🔄 Tests Service Worker (Offline)

### Enregistrement
- [ ] Le service worker s'enregistre correctement
- [ ] Le service worker s'active après installation
- [ ] Les caches sont créés (`aurisvoice-cache-v2`)
- [ ] Les routes sont precachées (/, /credits, /dashboard, etc.)

### Mode Offline
- [ ] Les pages en cache se chargent hors ligne
- [ ] La page `/offline.html` s'affiche si aucune page n'est en cache
- [ ] Les assets statiques (CSS, JS, images) se chargent depuis le cache
- [ ] Les appels API échouent gracieusement (pas d'interception)
- [ ] Le bouton "Générer" est désactivé en mode offline

### Mise à jour
- [ ] Les nouveaux service workers remplacent les anciens
- [ ] Les anciens caches sont supprimés automatiquement
- [ ] L'app se met à jour après rechargement

## 🍎 Tests iOS Add-to-Homescreen

### Installation
- [ ] Le prompt d'installation iOS s'affiche (si implémenté)
- [ ] Les instructions d'installation sont claires
- [ ] L'utilisateur peut ajouter l'app à l'écran d'accueil
- [ ] L'icône 180x180 est utilisée

### Fonctionnement
- [ ] L'app se lance depuis l'écran d'accueil
- [ ] Le LaunchScreen s'affiche correctement
- [ ] Pas de flash blanc au démarrage
- [ ] Les safe areas iOS sont respectées (notch, home indicator)
- [ ] La status bar est correcte (sombre, transparente)

## 🤖 Tests Android WebAPK

### Installation
- [ ] L'app peut être installée via Chrome
- [ ] L'app peut être installée via Edge
- [ ] Le prompt d'installation s'affiche
- [ ] L'installation se termine sans erreur

### Fonctionnement
- [ ] L'app se lance depuis le launcher
- [ ] L'icône est correcte (192x192 ou 512x512)
- [ ] L'app se lance en mode standalone
- [ ] Les permissions sont demandées si nécessaire

## 📦 Tests Capacitor WebView

### Android Capacitor
- [ ] L'app se build correctement (`npm run android:apk`)
- [ ] L'app s'installe sur un appareil Android
- [ ] Le service worker fonctionne dans WebView
- [ ] Les assets se chargent correctement (file://)
- [ ] Les appels API fonctionnent
- [ ] Le mode offline fonctionne

### iOS Capacitor
- [ ] L'app se build correctement dans Xcode
- [ ] L'app s'installe sur un iPhone
- [ ] Le service worker fonctionne dans WebView
- [ ] Les assets se chargent correctement
- [ ] Les appels API fonctionnent
- [ ] Le mode offline fonctionne
- [ ] Les safe areas sont respectées

## 💳 Tests Stripe (Intégration App)

### Checkout
- [ ] Le checkout Stripe fonctionne depuis l'app
- [ ] La redirection vers Stripe fonctionne
- [ ] Le retour après paiement fonctionne (`/payment/success`)
- [ ] L'annulation fonctionne (`/payment/cancel`)

### Webhooks
- [ ] Les webhooks Stripe sont reçus
- [ ] Les crédits sont ajoutés après paiement
- [ ] L'utilisateur voit ses crédits mis à jour

### Mode App
- [ ] Le checkout fonctionne en mode standalone
- [ ] Le checkout fonctionne en mode WebView
- [ ] Les redirections fonctionnent correctement

## 🎨 Tests Assets

### Icônes
- [ ] `icon-192x192.png` existe et est correcte
- [ ] `icon-512x512.png` existe et est correcte
- [ ] `icon-192x192-maskable.png` existe et a un padding de sécurité
- [ ] `icon-512x512-maskable.png` existe et a un padding de sécurité
- [ ] `icon-180x180.png` existe (iOS)
- [ ] Toutes les icônes sont référencées dans `manifest.json`
- [ ] Les icônes s'affichent correctement après installation

### Splash Screens
- [ ] Le `LaunchScreen.storyboard` est présent (iOS)
- [ ] Les splash screens iOS fonctionnent
- [ ] Pas de flash blanc au démarrage
- [ ] Le fond est #020617

### Screenshots
- [ ] `screenshot-1.png` (wide) existe
- [ ] `screenshot-2.png` (narrow) existe
- [ ] Les screenshots sont référencés dans `manifest.json`
- [ ] Les screenshots sont de bonne qualité

## 🔍 Tests Manifest.json

### Champs requis
- [ ] `name` est présent
- [ ] `short_name` est présent
- [ ] `start_url` est correct (`/?source=pwa`)
- [ ] `scope` est correct (`/`)
- [ ] `display` est `standalone`
- [ ] `display_override` contient `fullscreen` et `standalone`
- [ ] `theme_color` est `#0f172a`
- [ ] `background_color` est `#020617`
- [ ] `icons` contient au moins 192x192 et 512x512

### Champs recommandés
- [ ] `orientation` est présent (`any`)
- [ ] `prefer_related_applications` est `false`
- [ ] `categories` est présent
- [ ] `screenshots` est présent (au moins 2)
- [ ] `shortcuts` est présent (optionnel)

## 🧪 Tests fonctionnels

### Navigation
- [ ] Toutes les pages sont accessibles
- [ ] La navigation fonctionne en mode offline
- [ ] Les liens fonctionnent correctement

### Dubbing
- [ ] L'upload de fichiers fonctionne
- [ ] Le dubbing se génère correctement
- [ ] Les crédits sont déduits après dubbing
- [ ] Le résultat s'affiche correctement

### Crédits
- [ ] L'achat de crédits fonctionne
- [ ] Les crédits sont ajoutés après achat
- [ ] Le solde s'affiche correctement

### Dashboard
- [ ] Les doublages s'affichent
- [ ] Le téléchargement fonctionne
- [ ] L'historique est accessible

## 📊 Tests de performance

### Chargement
- [ ] L'app se charge rapidement (< 3s)
- [ ] Les assets sont optimisés
- [ ] Le service worker améliore les performances

### Cache
- [ ] Les pages sont mises en cache
- [ ] Les assets sont mis en cache
- [ ] Le cache est utilisé efficacement

## 🔒 Tests de sécurité

### HTTPS
- [ ] L'app fonctionne uniquement en HTTPS (production)
- [ ] Les appels API sont sécurisés
- [ ] Les données sensibles sont protégées

### Service Worker
- [ ] Le service worker ne cache pas les appels API
- [ ] Les endpoints Stripe ne sont pas interceptés
- [ ] Les données utilisateur sont sécurisées

## ✅ Checklist finale

### Avant Phase 6
- [ ] Tous les tests ci-dessus sont passés
- [ ] Les assets sont générés et optimisés
- [ ] Le manifest.json est complet
- [ ] Le service worker est fonctionnel
- [ ] Les tests sur appareils réels sont effectués
- [ ] La documentation est à jour

### Statut global
- [ ] **PWA Web** : ✅ Ready / ⚠️ Warning / ❌ Not Ready
- [ ] **Android WebAPK** : ✅ Ready / ⚠️ Warning / ❌ Not Ready
- [ ] **iOS PWA** : ✅ Ready / ⚠️ Warning / ❌ Not Ready
- [ ] **Android Capacitor** : ✅ Ready / ⚠️ Warning / ❌ Not Ready
- [ ] **iOS Capacitor** : ✅ Ready / ⚠️ Warning / ❌ Not Ready

---

**Date de vérification** : _______________

**Vérifié par** : _______________

**Notes** : _______________

