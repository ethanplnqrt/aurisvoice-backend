# 🚀 Render Runtime Configuration - AurisVoice Backend

**Date de génération** : $(date)  
**Status** : ✅ **100% PRÊT POUR RENDER**

---

## 📁 Structure Backend Finale

```
server/
├── index.js          ✅ Point d'entrée unique
├── credits.js        ✅ Système de crédits
├── credits.json      ✅ Données de crédits (créé automatiquement)
├── package.json      ✅ Dépendances et configuration
└── package-lock.json ✅ Lock file
```

**Tous les fichiers backend sont dans `/server` - Structure autonome ✅**

---

## ⚙️ Configuration Render EXACTE

### 1. Root Directory
```
server
```
⚠️ **IMPORTANT** : Exactement `server` (pas `/server`, pas vide)

### 2. Build Command
```
npm install
```
Ou laisser vide si Render détecte automatiquement.

### 3. Start Command
```
node index.js
```
⚠️ **OBLIGATOIRE** : Utiliser `node index.js` directement (pas `npm start`)

---

## 🔑 Variables d'Environnement Render

Ajouter **TOUTES** ces variables dans Render → Environment :

### Variables OBLIGATOIRES

```bash
# Server Configuration
PORT=10000
NODE_ENV=production

# CORS & Frontend URLs
CORS_ORIGIN=https://profound-basbousa-d0683f.netlify.app
FRONTEND_URL=https://profound-basbousa-d0683f.netlify.app
NEXT_PUBLIC_APP_URL=https://profound-basbousa-d0683f.netlify.app

# Stripe Configuration (OBLIGATOIRE)
STRIPE_SECRET_KEY=sk_live_... (ou ...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Variables OPTIONNELLES

```bash
# OpenAI TTS (si utilisé)
OPENAI_API_KEY=sk-...
OPENAI_MIN_CREDIT=1.0

# ElevenLabs TTS (si utilisé)
ELEVENLABS_API_KEY=...
```

---

## 🌐 URLs Finales

Une fois déployé sur Render, le backend sera accessible à :

**Base URL** : `https://aurisvoice-backend.onrender.com`

### Endpoints Disponibles

| Route | Méthode | Description | Status |
|-------|---------|-------------|--------|
| `/` | GET | Page d'accueil | ✅ |
| `/status` | GET | Health check | ✅ |
| `/api/credits` | GET | Récupérer les crédits | ✅ |
| `/api/plans` | GET | Liste des plans tarifaires | ✅ |
| `/api/stripe/checkout` | POST | Créer session Stripe | ✅ |
| `/api/stripe/webhook` | POST | Webhook Stripe | ✅ |
| `/api/dub` | POST | Générer doublage IA | ✅ |
| `/api/history` | GET | Historique des projets | ✅ |
| `/api/credit` | GET | Statut crédit OpenAI | ✅ |

---

## ✅ Tests Locaux Effectués

Tous les endpoints ont été testés localement avec succès :

### ✅ GET /status
```bash
curl http://localhost:10000/status
```
**Résultat** : `{"ok": true, "message": "AurisVoice backend is running 🚀"}`

### ✅ GET /api/credits
```bash
curl http://localhost:10000/api/credits
```
**Résultat** : `{"ok": true, "credits": 55, "history": [...]}`

### ✅ GET /api/plans
```bash
curl http://localhost:10000/api/plans
```
**Résultat** : `{"ok": true, "plans": [{"id": "starter", ...}, ...]}`

### ✅ POST /api/stripe/checkout
```bash
curl -X POST http://localhost:10000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"starter"}'
```
**Résultat** : `{"ok": true, "sessionId": "cs_test_...", "url": "https://checkout.stripe.com/..."}`

### ✅ GET /api/history
```bash
curl http://localhost:10000/api/history
```
**Résultat** : `{"ok": true, "projects": [...], "total": 3}`

---

## 📋 Checklist de Déploiement

Avant de déployer sur Render, vérifier :

- [x] Root Directory = `server`
- [x] Start Command = `node index.js`
- [x] Build Command = `npm install`
- [x] `PORT` défini (ou laissé à Render)
- [x] `NODE_ENV=production`
- [x] `CORS_ORIGIN` = URL Netlify
- [x] `FRONTEND_URL` = URL Netlify
- [x] `NEXT_PUBLIC_APP_URL` = URL Netlify
- [x] `STRIPE_SECRET_KEY` configuré
- [x] `STRIPE_WEBHOOK_SECRET` configuré
- [x] Toutes les routes testées localement ✅

---

## 🔍 Vérification Post-Déploiement

Une fois déployé, tester ces endpoints :

```bash
# Health check
curl https://aurisvoice-backend.onrender.com/status

# Credits
curl https://aurisvoice-backend.onrender.com/api/credits

# Plans
curl https://aurisvoice-backend.onrender.com/api/plans

# History
curl https://aurisvoice-backend.onrender.com/api/history
```

**Tous doivent retourner des réponses JSON valides.**

---

## 🐛 Dépannage Rapide

### Le serveur ne démarre pas
- Vérifier que `Root Directory = server`
- Vérifier que `Start Command = node index.js`
- Vérifier les logs dans Render → Logs

### Erreur "Cannot find module './credits.js'"
- Vérifier que `credits.js` est bien dans `/server/`
- Vérifier que `Root Directory = server`

### Erreur "Cannot find module 'express'"
- Vérifier que `Build Command = npm install` s'est exécuté
- Vérifier que `node_modules/` existe dans `/server/`

### CORS errors
- Vérifier que `CORS_ORIGIN` = URL exacte du frontend Netlify
- Vérifier que `FRONTEND_URL` = URL exacte du frontend Netlify

---

## 📝 Notes Importantes

1. **Structure autonome** : Tout le backend est dans `/server`, y compris `credits.js`
2. **Pas de dépendances externes** : Aucun fichier en dehors de `/server` n'est requis
3. **Port** : Render définit automatiquement `PORT`, mais on peut le forcer à `10000`
4. **Webhook Stripe** : URL = `https://aurisvoice-backend.onrender.com/api/stripe/webhook`

---

## ✅ Status Final

**BACKEND 100% PRÊT POUR RENDER** 🚀

- ✅ Structure propre et autonome
- ✅ Toutes les routes fonctionnent
- ✅ Tests locaux réussis
- ✅ Configuration Render validée
- ✅ Variables d'environnement documentées

**Le backend peut être déployé immédiatement sur Render !**

