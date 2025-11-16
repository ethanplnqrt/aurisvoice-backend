# 📱 Assets iOS - AurisVoice

Ce dossier contient les instructions pour générer les assets iOS (icônes et splash screens).

## 🎨 Icônes (AppIcon)

Les icônes doivent être placées dans :
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Dimensions requises

| Taille | Résolution | Nom du fichier |
|--------|------------|----------------|
| 20x20 | 40x40 (@2x), 60x60 (@3x) | icon-20.png, icon-20@2x.png, icon-20@3x.png |
| 29x29 | 58x58 (@2x), 87x87 (@3x) | icon-29.png, icon-29@2x.png, icon-29@3x.png |
| 40x40 | 80x80 (@2x), 120x120 (@3x) | icon-40.png, icon-40@2x.png, icon-40@3x.png |
| 60x60 | 120x120 (@2x), 180x180 (@3x) | icon-60.png, icon-60@2x.png, icon-60@3x.png |
| 76x76 | 152x152 (@2x), 228x228 (@3x) | icon-76.png, icon-76@2x.png, icon-76@3x.png |
| 83.5x83.5 | 167x167 (@2x) | icon-83.5@2x.png |
| 1024x1024 | 1024x1024 | icon-1024.png |

### Génération automatique

Vous pouvez utiliser un outil comme [App Icon Generator](https://www.appicon.co/) ou [IconKitchen](https://icon.kitchen/) pour générer toutes les tailles à partir d'une image 1024x1024.

### Configuration Contents.json

Le fichier `Contents.json` dans `AppIcon.appiconset/` doit contenir :

```json
{
  "images" : [
    {
      "filename" : "icon-20.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "icon-29.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "icon-40.png",
      "idiom" : "iphone",
      "scale" : "1x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "icon-60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "icon-76.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "76x76"
    },
    {
      "filename" : "icon-76@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76"
    },
    {
      "filename" : "icon-83.5@2x.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5"
    },
    {
      "filename" : "icon-1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
```

## 🖼️ Splash Screens

Les splash screens sont gérés par Capacitor via le plugin SplashScreen. Cependant, vous pouvez ajouter des images dans :

`ios/App/App/Assets.xcassets/Splash.imageset/`

### Dimensions recommandées

- **iPhone SE (1st gen)** : 640x1136 (@2x)
- **iPhone 8/SE (2nd gen)** : 750x1334 (@2x)
- **iPhone 8 Plus** : 1242x2208 (@3x)
- **iPhone X/XS/11 Pro** : 1125x2436 (@3x)
- **iPhone XR/11** : 828x1792 (@2x)
- **iPhone XS Max/11 Pro Max** : 1242x2688 (@3x)
- **iPhone 12/12 Pro** : 1170x2532 (@3x)
- **iPhone 12 Pro Max** : 1284x2778 (@3x)
- **iPhone 13/13 Pro** : 1170x2532 (@3x)
- **iPhone 13 Pro Max** : 1284x2778 (@3x)
- **iPhone 14/14 Pro** : 1170x2532 (@3x)
- **iPhone 14 Pro Max** : 1284x2778 (@3x)
- **iPhone 15/15 Pro** : 1179x2556 (@3x)
- **iPhone 15 Pro Max** : 1290x2796 (@3x)

### Note

Le `LaunchScreen.storyboard` est utilisé pour le splash screen initial. Les images dans `Splash.imageset/` sont optionnelles et peuvent être utilisées par le plugin Capacitor SplashScreen.

## 🛠️ Outils recommandés

- [App Icon Generator](https://www.appicon.co/) - Génération automatique d'icônes
- [IconKitchen](https://icon.kitchen/) - Création d'icônes adaptatives
- [ImageOptim](https://imageoptim.com/) - Optimisation d'images
- [TinyPNG](https://tinypng.com/) - Compression d'images

## 📝 Notes

- Toutes les icônes doivent être en PNG sans transparence (sauf si nécessaire)
- Les icônes doivent être carrées
- La couleur de fond recommandée est #020617 (couleur de l'app)
- Les icônes doivent être optimisées pour différentes tailles d'écran

