# 🚀 Configuration Render - Backend AurisVoice

## ✅ Structure attendue

```
aurisvoice-backend/
├── server/
│   ├── index.js          ← Point d'entrée unique
│   ├── package.json      ← Dépendances backend
│   └── package-lock.json
├── credits.js            ← Système de crédits (importé depuis server/)
├── credits.json          ← Fichier de données (créé automatiquement)
├── logs/                 ← Logs (créé automatiquement)
├── uploads/             ← Fichiers uploadés (créé automatiquement)
└── output/               ← Fichiers générés (créé automatiquement)
```

## 📋 Configuration Render (à appliquer manuellement)

### 1. Root Directory
```
server
```

### 2. Build Command
```
npm install
```

### 3. Start Command
```
node index.js
```

### 4. Environment Variables

Ajouter ces variables dans Render → Environment :

```bash
# Server Configuration
PORT=10000
NODE_ENV=production

# CORS & Frontend
CORS_ORIGIN=https://profound-basbousa-d0683f.netlify.app
FRONTEND_URL=https://profound-basbousa-d0683f.netlify.app
NEXT_PUBLIC_APP_URL=https://profound-basbousa-d0683f.netlify.app

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... (ou ...)
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (optionnel)
OPENAI_API_KEY=sk-...
OPENAI_MIN_CREDIT=1.0

# ElevenLabs (optionnel)
ELEVENLABS_API_KEY=...
```

## 🔍 Vérifications

### ✅ Avant le déploiement

1. **Structure des fichiers** :
   - ✅ `server/index.js` existe
   - ✅ `server/package.json` existe
   - ✅ `credits.js` est à la racine (accessible via `../credits.js`)

2. **Package.json** :
   ```json
   {
     "name": "aurisvoice-backend",
     "type": "module",
     "main": "index.js",
     "scripts": {
       "start": "node index.js"
     },
     "dependencies": {
       "express": "^4.21.2",
       "cors": "^2.8.5",
       "dotenv": "^17.2.3",
       "stripe": "^19.3.1",
       "multer": "^1.4.5-lts.1"
     }
   }
   ```

3. **Port** :
   - Le code utilise `process.env.PORT || 10000`
   - Render définit automatiquement `PORT` (généralement 10000)
   - ✅ Pas besoin de modifier le code

## 🎯 Endpoints disponibles

Une fois déployé, le backend expose :

- `GET /` → Page d'accueil
- `GET /status` → Health check
- `GET /api/credits` → Récupérer les crédits
- `GET /api/plans` → Liste des plans tarifaires
- `POST /api/stripe/checkout` → Créer une session Stripe
- `POST /api/stripe/webhook` → Webhook Stripe
- `POST /api/dub` → Générer un doublage
- `GET /api/history` → Historique des projets
- `GET /api/credit` → Statut crédit OpenAI

## 📝 Notes importantes

1. **Root Directory = `server`** :
   - Render va chercher `package.json` dans `/server`
   - Le `npm install` s'exécute dans `/server`
   - Le `node index.js` s'exécute depuis `/server`
   - L'import `../credits.js` fonctionne car `credits.js` est à la racine

2. **Fichiers créés automatiquement** :
   - `credits.json` (si n'existe pas)
   - `logs/` (stripe-webhook.log, stripe-security.log, credits.log)
   - `uploads/` (fichiers uploadés)
   - `output/` (fichiers générés)

3. **Webhook Stripe** :
   - URL webhook : `https://aurisvoice-backend.onrender.com/api/stripe/webhook`
   - Configurer dans Stripe Dashboard → Webhooks

4. **CORS** :
   - Le backend accepte les requêtes depuis `CORS_ORIGIN`
   - Si `CORS_ORIGIN` n'est pas défini, accepte toutes les origines (`*`)

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifier que `Root Directory = server`
- Vérifier que `Start Command = node index.js`
- Vérifier les logs dans Render → Logs

### Erreur "Cannot find module '../credits.js'"
- Vérifier que `credits.js` est bien à la racine du repo
- Vérifier que `Root Directory = server` (pas vide)

### Erreur "Port already in use"
- Render définit automatiquement `PORT`
- Ne pas définir `PORT` manuellement dans les variables d'environnement

### Les endpoints retournent 404
- Vérifier que le serveur démarre correctement
- Vérifier les logs : `GET /status` doit retourner `{"ok": true}`

