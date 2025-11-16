# 🎨 Icônes AurisVoice - Guide de génération

## 📋 Icônes requises

### PWA (Web App Manifest)
- **icon-192x192.png** - Icône standard 192x192
- **icon-192x192-maskable.png** - Icône maskable 192x192 (fond transparent, contenu centré)
- **icon-512x512.png** - Icône standard 512x512
- **icon-512x512-maskable.png** - Icône maskable 512x512

### iOS (Apple Touch Icon)
- **icon-180x180.png** - Icône iOS 180x180 (iPhone/iPad)

## 🛠️ Génération des icônes

### Option 1 : Outil en ligne (Recommandé)

1. **App Icon Generator** : https://www.appicon.co/
   - Upload une image 1024x1024
   - Sélectionner "PWA" et "iOS"
   - Télécharger les icônes générées

2. **IconKitchen** : https://icon.kitchen/
   - Upload une image source
   - Générer toutes les tailles nécessaires

3. **PWA Asset Generator** : https://github.com/onderceylan/pwa-asset-generator
   ```bash
   npx pwa-asset-generator source-icon.png public/icons/
   ```

### Option 2 : Génération manuelle

#### Depuis une image source (1024x1024)

1. **Créer l'icône source** :
   - Format : PNG, 1024x1024 pixels
   - Fond : Transparent (pour maskable) ou #020617 (pour standard)
   - Contenu : Logo AurisVoice centré avec padding de sécurité

2. **Générer les tailles** :
   ```bash
   # Utiliser ImageMagick ou un outil similaire
   convert source-1024.png -resize 192x192 icon-192x192.png
   convert source-1024.png -resize 512x512 icon-512x512.png
   convert source-1024.png -resize 180x180 icon-180x180.png
   ```

3. **Créer les versions maskable** :
   - Les icônes maskable doivent avoir un padding de sécurité
   - Le contenu doit être centré dans un cercle de 80% du canvas
   - Utiliser un outil comme Figma ou Photoshop pour créer les versions maskable

### Option 3 : Script automatique

Un script `scripts/generate-icons.js` peut être créé pour générer automatiquement toutes les icônes depuis une source unique.

## 📐 Spécifications techniques

### Icônes standard (any)
- **Format** : PNG
- **Fond** : #020617 (couleur de l'app) ou transparent
- **Contenu** : Logo AurisVoice centré
- **Padding** : 10% minimum autour du contenu

### Icônes maskable
- **Format** : PNG
- **Fond** : Transparent
- **Contenu** : Centré dans un cercle de 80% du canvas
- **Padding de sécurité** : 10% minimum
- **Zone sûre** : Cercle de 80% au centre (pour les systèmes qui appliquent un masque)

### Icônes iOS (180x180)
- **Format** : PNG
- **Fond** : Transparent ou #020617
- **Contenu** : Logo AurisVoice centré
- **Pas de coins arrondis** : iOS les applique automatiquement

## ✅ Vérification

Après génération, vérifier que :
- [ ] Tous les fichiers PNG sont présents
- [ ] Les tailles sont correctes (192, 512, 180)
- [ ] Les icônes maskable ont un padding de sécurité
- [ ] Les icônes sont optimisées (TinyPNG recommandé)
- [ ] Les références dans `manifest.json` sont correctes

## 🔗 Références

- [Web App Manifest Icons](https://www.w3.org/TR/appmanifest/#icons-member)
- [Maskable Icons](https://web.dev/maskable-icon/)
- [iOS App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)

