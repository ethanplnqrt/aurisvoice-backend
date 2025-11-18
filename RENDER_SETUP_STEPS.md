# 📋 Étapes pour configurer Render - Guide pas à pas

## 🎯 Objectif
Configurer Render pour exécuter le backend depuis `/server` avec `server/index.js` comme point d'entrée.

---

## 📍 ÉTAPE 1 : Accéder à Render Dashboard

1. Aller sur [https://dashboard.render.com](https://dashboard.render.com)
2. Se connecter à ton compte
3. Cliquer sur **"New"** → **"Web Service"**

---

## 📍 ÉTAPE 2 : Connecter le Repository GitHub

1. **Connect Repository** :
   - Sélectionner `aurisvoice-backend` (ou le nom de ton repo)
   - Cliquer sur **"Connect"**

2. **Si le repo n'est pas connecté** :
   - Cliquer sur **"Configure account"**
   - Autoriser Render à accéder à GitHub
   - Sélectionner le repository

---

## 📍 ÉTAPE 3 : Configurer le Service

### 3.1 Informations de base

- **Name** : `aurisvoice-backend` (ou le nom que tu veux)
- **Region** : Choisir la région la plus proche (ex: `Frankfurt` pour l'Europe)
- **Branch** : `main` (ou `master` selon ton repo)

### 3.2 ⚠️ CONFIGURATION CRITIQUE - Root Directory

**IMPORTANT** : C'est la configuration la plus importante !

- **Root Directory** : `server`
  - ⚠️ Ne pas laisser vide
  - ⚠️ Ne pas mettre `/server` (pas de slash initial)
  - ✅ Mettre exactement : `server`

**Explication** :
- Render va chercher `package.json` dans `/server/package.json`
- Le `npm install` s'exécutera dans `/server`
- Le `node index.js` s'exécutera depuis `/server`
- L'import `../credits.js` fonctionnera car `credits.js` est à la racine

### 3.3 Build & Start Commands

- **Build Command** : 
  ```
  npm install
  ```
  (Laisser vide si Render détecte automatiquement)

- **Start Command** : 
  ```
  node index.js
  ```
  ⚠️ **OBLIGATOIRE** : Ne pas mettre `npm start` (même si c'est dans package.json)

**Pourquoi `node index.js` directement ?**
- Render exécute depuis `/server`
- `node index.js` = exécute `/server/index.js`
- Plus direct et fiable

### 3.4 Instance Type

- **Instance Type** : `Free` (pour commencer)
  - Ou `Starter` ($7/mois) pour de meilleures performances
  - Ou `Standard` ($25/mois) pour la production

---

## 📍 ÉTAPE 4 : Environment Variables

Cliquer sur **"Advanced"** → **"Add Environment Variable"**

Ajouter **UNE PAR UNE** ces variables :

### Variables obligatoires

```bash
# 1. Server
PORT=10000
NODE_ENV=production

# 2. CORS & Frontend
CORS_ORIGIN=https://profound-basbousa-d0683f.netlify.app
FRONTEND_URL=https://profound-basbousa-d0683f.netlify.app
NEXT_PUBLIC_APP_URL=https://profound-basbousa-d0683f.netlify.app

# 3. Stripe (OBLIGATOIRE)
STRIPE_SECRET_KEY=sk_live_... (ta clé Stripe)
STRIPE_WEBHOOK_SECRET=whsec_... (ta clé webhook Stripe)
```

### Variables optionnelles

```bash
# 4. OpenAI (si tu utilises OpenAI TTS)
OPENAI_API_KEY=sk-...
OPENAI_MIN_CREDIT=1.0

# 5. ElevenLabs (si tu utilises ElevenLabs)
ELEVENLABS_API_KEY=...
```

**⚠️ IMPORTANT** :
- Ne pas définir `PORT` si Render le gère automatiquement
- Si Render définit automatiquement `PORT`, ne pas le redéfinir
- Vérifier dans les logs si `PORT` est déjà défini

---

## 📍 ÉTAPE 5 : Créer le Service

1. Cliquer sur **"Create Web Service"**
2. Render va :
   - Cloner le repo
   - Aller dans `/server`
   - Exécuter `npm install`
   - Exécuter `node index.js`
   - Démarrer le serveur

---

## 📍 ÉTAPE 6 : Vérifier le déploiement

### 6.1 Vérifier les logs

Dans Render → **Logs**, tu dois voir :

```
🚀 ═══════════════════════════════════════════════════════
   AurisVoice Backend LIVE on Render
   ═══════════════════════════════════════════════════════

📡 Server:
   Port: 10000
   Environment: production
   CORS Origin: https://profound-basbousa-d0683f.netlify.app

💳 Stripe Configuration:
   Secret Key: ✅ Configured
   Webhook Secret: ✅ Configured
   Mode: LIVE (ou TEST)

💰 Credits System:
   Current balance: X credits

✅ Server ready to accept requests!
```

### 6.2 Tester les endpoints

Une fois déployé, Render donne une URL : `https://aurisvoice-backend.onrender.com`

Tester :

```bash
# Health check
curl https://aurisvoice-backend.onrender.com/status

# Credits
curl https://aurisvoice-backend.onrender.com/api/credits

# Plans
curl https://aurisvoice-backend.onrender.com/api/plans
```

**Réponse attendue** :
- `/status` → `{"ok": true, "message": "AurisVoice backend is running 🚀"}`
- `/api/credits` → `{"ok": true, "credits": X, "history": [...]}`
- `/api/plans` → `{"ok": true, "plans": [...]}`

---

## 📍 ÉTAPE 7 : Configurer le Webhook Stripe

1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Cliquer sur **"Add endpoint"**
4. **Endpoint URL** : `https://aurisvoice-backend.onrender.com/api/stripe/webhook`
5. **Events to send** : Sélectionner `checkout.session.completed`
6. Cliquer sur **"Add endpoint"**
7. Copier le **"Signing secret"** (commence par `whsec_`)
8. Retourner dans Render → **Environment**
9. Mettre à jour `STRIPE_WEBHOOK_SECRET` avec la valeur copiée
10. **Redeploy** le service dans Render

---

## 🐛 Dépannage

### ❌ Erreur : "Cannot find module '../credits.js'"

**Cause** : Root Directory mal configuré

**Solution** :
1. Render → Settings → **Root Directory**
2. Vérifier que c'est exactement `server` (pas `/server`, pas vide)
3. **Save Changes** → **Manual Deploy**

### ❌ Erreur : "Cannot find module 'express'"

**Cause** : `npm install` ne s'est pas exécuté dans `/server`

**Solution** :
1. Vérifier que **Root Directory = `server`**
2. Vérifier que **Build Command = `npm install`**
3. **Manual Deploy** → Vérifier les logs

### ❌ Erreur : "Port already in use"

**Cause** : `PORT` est défini deux fois

**Solution** :
1. Render → Environment
2. Supprimer la variable `PORT` si elle existe
3. Render définit automatiquement `PORT` (généralement 10000)
4. **Redeploy**

### ❌ Le serveur démarre mais les endpoints retournent 404

**Cause** : Le serveur ne démarre pas correctement

**Solution** :
1. Vérifier les logs dans Render
2. Vérifier que `node index.js` est bien dans **Start Command**
3. Vérifier que `server/index.js` existe dans le repo

### ❌ CORS errors depuis le frontend

**Cause** : `CORS_ORIGIN` mal configuré

**Solution** :
1. Render → Environment
2. Vérifier que `CORS_ORIGIN` = `https://profound-basbousa-d0683f.netlify.app`
3. Vérifier que `FRONTEND_URL` = `https://profound-basbousa-d0683f.netlify.app`
4. **Redeploy**

---

## ✅ Checklist finale

Avant de considérer le déploiement comme terminé :

- [ ] Root Directory = `server`
- [ ] Start Command = `node index.js`
- [ ] Build Command = `npm install` (ou vide)
- [ ] `PORT` non défini dans Environment (ou = 10000)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` = URL Netlify
- [ ] `STRIPE_SECRET_KEY` configuré
- [ ] `STRIPE_WEBHOOK_SECRET` configuré
- [ ] `/status` retourne `{"ok": true}`
- [ ] `/api/credits` retourne les crédits
- [ ] `/api/plans` retourne les plans
- [ ] Webhook Stripe configuré dans Stripe Dashboard

---

## 🎉 C'est prêt !

Une fois tout configuré, le backend est accessible à :
- `https://aurisvoice-backend.onrender.com`

Et le frontend peut appeler :
- `https://aurisvoice-backend.onrender.com/api/credits`
- `https://aurisvoice-backend.onrender.com/api/stripe/checkout`
- etc.

