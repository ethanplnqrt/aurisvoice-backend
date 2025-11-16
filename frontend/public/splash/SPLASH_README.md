# 🖼️ Splash Screens iOS - Guide de génération

## 📋 Splash Screens requises

Les splash screens iOS sont utilisées lors du démarrage de l'application. Capacitor utilise le `LaunchScreen.storyboard` pour le splash initial, mais vous pouvez aussi ajouter des images dans `Assets.xcassets/Splash.imageset/`.

### Tailles recommandées

| Appareil | Résolution | Taille fichier | Nom recommandé |
|----------|------------|----------------|----------------|
| iPhone SE (1st gen) | 640x1136 | @2x | splash-iphone-se.png |
| iPhone 8/SE (2nd gen) | 750x1334 | @2x | splash-iphone-8.png |
| iPhone 8 Plus | 1242x2208 | @3x | splash-iphone-8-plus.png |
| iPhone X/XS/11 Pro | 1125x2436 | @3x | splash-iphone-x.png |
| iPhone XR/11 | 828x1792 | @2x | splash-iphone-xr.png |
| iPhone XS Max/11 Pro Max | 1242x2688 | @3x | splash-iphone-xs-max.png |
| iPhone 12/12 Pro | 1170x2532 | @3x | splash-iphone-12.png |
| iPhone 12 Pro Max | 1284x2778 | @3x | splash-iphone-12-pro-max.png |
| iPhone 13/13 Pro | 1170x2532 | @3x | splash-iphone-13.png |
| iPhone 13 Pro Max | 1284x2778 | @3x | splash-iphone-13-pro-max.png |
| iPhone 14/14 Pro | 1179x2556 | @3x | splash-iphone-14.png |
| iPhone 14 Pro Max | 1290x2796 | @3x | splash-iphone-14-pro-max.png |
| iPhone 15/15 Pro | 1179x2556 | @3x | splash-iphone-15.png |
| iPhone 15 Pro Max | 1290x2796 | @3x | splash-iphone-15-pro-max.png |
| iPad | 1536x2048 | @2x | splash-ipad.png |

## 🛠️ Génération des splash screens

### Option 1 : Utiliser Capacitor Splash Screen Plugin

Le plugin Capacitor SplashScreen gère automatiquement les splash screens. Vous pouvez configurer :

```typescript
// capacitor.config.ts
plugins: {
  SplashScreen: {
    launchShowDuration: 0,
    backgroundColor: '#020617',
    // Les splash screens sont générées automatiquement
  }
}
```

### Option 2 : Génération manuelle

1. **Créer un template de base** :
   - Fond : #020617 (couleur de l'app)
   - Logo : AurisVoice centré
   - Design : Minimaliste, cohérent avec l'app

2. **Générer toutes les tailles** :
   ```bash
   # Utiliser ImageMagick ou un outil similaire
   convert template.png -resize 640x1136 splash-iphone-se.png
   convert template.png -resize 750x1334 splash-iphone-8.png
   # ... etc
   ```

3. **Placer dans le projet iOS** :
   - `ios/App/App/Assets.xcassets/Splash.imageset/`
   - Créer un `Contents.json` pour référencer les images

### Option 3 : Outil en ligne

- **Splash Screen Generator** : https://www.appicon.co/splash
- Upload une image source et générer toutes les tailles

## 📐 Spécifications techniques

### Design
- **Fond** : #020617 (couleur de l'app)
- **Logo** : AurisVoice centré verticalement et horizontalement
- **Texte** : Optionnel, mais recommandé de garder minimal
- **Safe Area** : Respecter les safe areas iOS (notch, home indicator)

### Format
- **Type** : PNG
- **Couleur** : RGB
- **Optimisation** : Compresser avec TinyPNG ou ImageOptim

### LaunchScreen.storyboard

Le `LaunchScreen.storyboard` créé en Phase 5.3.3 utilise :
- Fond : #020617
- Logo : "AurisVoice" centré
- Safe Area : Support complet

Pour modifier :
1. Ouvrir `ios/App/App/LaunchScreen.storyboard` dans Xcode
2. Modifier le design
3. Vérifier la compatibilité avec tous les appareils

## ✅ Vérification

Après génération, vérifier que :
- [ ] Le LaunchScreen.storyboard est présent
- [ ] Les images splash sont dans Assets.xcassets (optionnel)
- [ ] Le fond est #020617
- [ ] Le logo est centré
- [ ] Les safe areas sont respectées
- [ ] Pas de flash blanc au démarrage

## 🔗 Références

- [Capacitor Splash Screen](https://capacitorjs.com/docs/apis/splash-screen)
- [iOS Launch Screens](https://developer.apple.com/design/human-interface-guidelines/launch-screens)

