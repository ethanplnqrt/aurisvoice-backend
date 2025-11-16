# 🚀 PWA Setup - AurisVoice

## ✅ Fichiers créés

### 1. Manifest PWA
- `public/manifest.json` - Configuration PWA complète

### 2. Service Worker
- `public/sw.js` - Service worker avec cache strategy

### 3. Composant Service Worker
- `src/components/ServiceWorkerRegister.tsx` - Enregistrement automatique du SW

### 4. Métadonnées PWA
- `src/pages/_document.tsx` - Métadonnées PWA ajoutées
- `src/pages/_app.tsx` - ServiceWorkerRegister intégré

### 5. Icônes (Placeholders)
- `public/icons/icon-192x192.svg` - Icône 192x192
- `public/icons/icon-512x512.svg` - Icône 512x512

## 📋 Actions requises

### Générer les icônes PNG

Les fichiers SVG sont fournis comme placeholders. Vous devez générer les PNG correspondants :

1. **icon-192x192.png** (192x192 pixels)
2. **icon-192x192-maskable.png** (192x192 pixels, avec safe zone 80%)
3. **icon-512x512.png** (512x512 pixels)
4. **icon-512x512-maskable.png** (512x512 pixels, avec safe zone 80%)

**Méthodes :**

```bash
# ImageMagick
convert public/icons/icon-192x192.svg -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon-512x512.svg -resize 512x512 public/icons/icon-512x512.png

# Pour les maskable, créer des versions avec safe zone (80% du canvas)
```

Ou utilisez des outils en ligne :
- https://convertio.co/svg-png/
- https://cloudconvert.com/svg-to-png

## 🔧 Fonctionnalités PWA

### Service Worker
- ✅ Cache des routes principales
- ✅ Ignore les requêtes `/api/` (Stripe/dubbing)
- ✅ Stratégie cache-first avec fallback réseau
- ✅ Nettoyage automatique des anciens caches

### Manifest
- ✅ Nom et description
- ✅ Thème sombre (#0f172a)
- ✅ Icônes configurées
- ✅ Shortcuts (Nouveau doublage, Mes crédits)
- ✅ Mode standalone

### Protection API
- ✅ Les requêtes vers `/api/` ne sont **jamais** mises en cache
- ✅ Stripe et dubbing fonctionnent normalement
- ✅ Pas d'interférence avec les webhooks

## 🧪 Tester la PWA

1. **Démarrer le serveur de développement :**
   ```bash
   npm run dev
   ```

2. **Ouvrir Chrome DevTools :**
   - Application > Service Workers
   - Vérifier que le SW est enregistré

3. **Tester l'installation :**
   - Chrome : Menu > Installer AurisVoice
   - Safari iOS : Partager > Sur l'écran d'accueil

4. **Vérifier le cache :**
   - Application > Cache Storage
   - Voir `aurisvoice-cache-v1`

## 📱 Compatibilité

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari iOS (14+)
- ✅ Firefox (Desktop & Mobile)
- ✅ Samsung Internet

## 🔒 Sécurité

- ✅ Service Worker uniquement en HTTPS (ou localhost)
- ✅ API endpoints jamais mis en cache
- ✅ Pas d'interférence avec Stripe webhooks
- ✅ Pas d'interférence avec dubbing API

## 📝 Notes

- Les icônes SVG sont des placeholders - remplacez par des PNG pour la production
- Le service worker se met à jour automatiquement
- Le cache est nettoyé automatiquement lors des mises à jour

