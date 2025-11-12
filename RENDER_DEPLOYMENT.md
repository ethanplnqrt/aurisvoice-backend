# 🚀 AurisVoice - Render Deployment Guide

## Production-Ready Backend Configuration

Ce guide vous aide à déployer AurisVoice backend sur **Render** en mode production.

---

## ✅ Pré-requis

Avant de déployer:
- [x] Code backend testé localement
- [x] Compte Render créé (https://render.com)
- [x] Compte Stripe configuré
- [x] Clé OpenAI valide
- [x] Frontend déployé sur Vercel (pour CORS)

---

## 📦 Fichiers de Configuration

### 1. server-stripe.js (Principal)
✅ **Mis à jour pour production:**
- Port dynamique: `process.env.PORT || 10000`
- CORS sécurisé: `process.env.CORS_ORIGIN`
- Logs clairs pour Render
- Gestion d'erreurs globale
- Validation des clés API

### 2. .env.render.example
✅ **Template avec toutes les variables:**
- Configuration serveur
- Clés OpenAI
- Clés Stripe (secret, public, webhook)
- CORS et frontend URL
- Documentation complète

### 3. package.json
Vérifiez que vous avez:
```json
{
  "scripts": {
    "start": "node server-stripe.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "stripe": "^14.14.0"
  }
}
```

---

## 🔧 Étape 1: Préparer le Code

### A. Installer les dépendances

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend

# Installer Stripe si pas déjà fait
npm install stripe

# Vérifier que tout est installé
npm install
```

### B. Tester localement

```bash
# Créer .env local pour test
cp .env.render.example .env

# Éditer .env avec vos clés TEST
nano .env

# Démarrer le serveur
node server-stripe.js
```

**Output attendu:**
```
🚀 ═══════════════════════════════════════════════════════
   AurisVoice Backend running locally
   ═══════════════════════════════════════════════════════

📡 Server:
   Port: 10000
   Environment: development
   CORS Origin: *

💳 Stripe Configuration:
   Secret Key: ✅ Configured
   Webhook Secret: ⚠️  Test mode
   Mode: TEST

💰 Credits System:
   Current balance: 10 credits

💶 Pricing Plans:
   Starter: 5€ (15 credits)
   Pro: 15€ (60 credits)
   Premium: 30€ (150 credits)

✅ Server ready to accept requests!
```

### C. Tester les endpoints

```bash
# Health check
curl http://localhost:10000/status

# Credits
curl http://localhost:10000/api/credits

# Plans
curl http://localhost:10000/api/plans
```

---

## 🚀 Étape 2: Déployer sur Render

### A. Créer le Web Service

1. **Aller sur Render Dashboard:**
   - https://dashboard.render.com

2. **New Web Service:**
   - Cliquer sur "New +" → "Web Service"

3. **Connecter GitHub:**
   - Connect repository: `aurisvoice-backend`
   - Ou créer un nouveau repo si nécessaire

4. **Configuration du Service:**
   ```
   Name: aurisvoice-backend
   Region: Oregon (US West) ou Frankfurt (EU)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: node server-stripe.js
   Instance Type: Starter ($7/month) ou Free
   ```

### B. Configurer les Variables d'Environnement

Dans Render dashboard, section "Environment":

**Obligatoires:**
```
PORT=10000
NODE_ENV=production
OPENAI_API_KEY=sk-proj-your-key
STRIPE_SECRET_KEY=your-key (ou sk_live_ en prod)
STRIPE_WEBHOOK_SECRET=whsec_your-secret
CORS_ORIGIN=https://aurisvoice.vercel.app
NEXT_PUBLIC_APP_URL=https://aurisvoice.vercel.app
```

**Optionnels:**
```
OPENAI_MIN_CREDIT=1.0
ELEVENLABS_API_KEY=your-key
STRIPE_PUBLIC_KEY=pk_test_your-key
```

⚠️ **Important:** 
- Utilisez vos **vraies clés** (pas les exemples)
- Pour `CORS_ORIGIN`, utilisez **exactement** votre URL Vercel
- Pas d'espaces avant/après les valeurs

### C. Déployer

1. Cliquer "Create Web Service"
2. Attendre ~5 minutes (premier déploiement)
3. Noter votre URL: `https://aurisvoice-backend.onrender.com`

---

## 🔔 Étape 3: Configurer le Webhook Stripe

### A. Créer l'Endpoint

1. **Aller sur Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

2. **Add Endpoint:**
   - URL: `https://aurisvoice-backend.onrender.com/api/stripe/webhook`
   - Description: "AurisVoice Payment Webhook"

3. **Sélectionner les Events:**
   - Cocher: `checkout.session.completed`
   - (Optionnel) Cocher: `payment_intent.succeeded`

4. **Créer l'Endpoint**

### B. Récupérer le Secret

1. Cliquer sur le webhook créé
2. Section "Signing secret"
3. Cliquer "Reveal" et copier le secret (commence par `whsec_`)

### C. Mettre à Jour Render

1. Retour sur Render dashboard
2. Environment variables
3. Trouver `STRIPE_WEBHOOK_SECRET`
4. Coller le vrai secret
5. Sauvegarder

**Render va automatiquement redéployer avec la nouvelle valeur**

---

## 🔒 Étape 4: Mettre à Jour le Frontend

### Sur Vercel

1. **Aller sur Vercel Dashboard:**
   - https://vercel.com/dashboard

2. **Sélectionner votre projet AurisVoice**

3. **Settings → Environment Variables:**
   - Trouver `NEXT_PUBLIC_API_URL`
   - Changer de `http://localhost:3000` à `https://aurisvoice-backend.onrender.com`
   - Sauvegarder

4. **Redéployer:**
   - Deployments → Latest → Redeploy

---

## ✅ Étape 5: Vérification

### A. Tester le Backend

```bash
# Health check
curl https://aurisvoice-backend.onrender.com/status

# Expected:
# {"ok":true,"message":"AurisVoice Payment API running 🚀",...}
```

### B. Tester le Frontend

1. Visiter: `https://aurisvoice.vercel.app/credits`
2. Vérifier que le solde s'affiche
3. Cliquer "Acheter maintenant" sur un plan
4. Utiliser carte test: `4242 4242 4242 4242`
5. Vérifier que les crédits sont ajoutés

### C. Tester le Webhook

1. Faire un achat test (ci-dessus)
2. Vérifier dans Render logs:
   ```
   💰 Payment successful: cs_test_...
   ✅ Credits added successfully: +15
   ```
3. Vérifier dans Stripe Dashboard → Events
   - Event `checkout.session.completed` devrait avoir un ✅

---

## 📊 Monitoring

### Render Dashboard

**Logs:**
- Onglet "Logs" pour voir les requêtes en temps réel
- Chercher "✅" pour les succès
- Chercher "❌" pour les erreurs

**Metrics:**
- CPU usage
- Memory usage
- Request count
- Response times

### Stripe Dashboard

**Webhooks:**
- Attempts: Nombre de tentatives
- Success rate: Doit être 100%
- Recent events: Liste des événements

**Payments:**
- Liste des paiements réussis
- Montants en EUR
- Status des transactions

---

## 🐛 Troubleshooting

### Problème 1: "STRIPE_SECRET_KEY not configured"

**Symptôme:** Logs Render montrent warning
**Solution:**
1. Vérifier Environment variables dans Render
2. Vérifier que la clé commence par `` ou `sk_live_`
3. Redéployer manuellement

### Problème 2: Webhook ne reçoit pas d'events

**Symptôme:** Paiement réussi mais crédits non ajoutés
**Solution:**
1. Vérifier URL webhook: `https://votre-backend.onrender.com/api/stripe/webhook`
2. Vérifier `STRIPE_WEBHOOK_SECRET` est défini
3. Vérifier event `checkout.session.completed` est sélectionné
4. Tester manuellement depuis Stripe Dashboard

### Problème 3: CORS error

**Symptôme:** Frontend ne peut pas appeler l'API
**Solution:**
1. Vérifier `CORS_ORIGIN` dans Render = exactement URL Vercel
2. Pas de `/` à la fin de l'URL
3. Vérifier `https://` (pas `http://`)
4. Redéployer backend

### Problème 4: "Internal server error"

**Symptôme:** 500 error dans les requêtes
**Solution:**
1. Vérifier logs Render pour stack trace
2. Vérifier que `credits.json` existe
3. Vérifier permissions fichiers
4. Redéployer avec "Clear build cache"

---

## 🔄 Passer en Mode LIVE (Production)

Quand prêt pour accepter de vrais paiements:

### 1. Obtenir les Clés LIVE Stripe

1. Stripe Dashboard → Developers → API keys
2. Toggle "Viewing test data" → OFF
3. Copier:
   - Secret key (sk_live_...)
   - Publishable key (pk_live_...)

### 2. Créer Webhook LIVE

1. Stripe Dashboard → Webhooks
2. Toggle "Viewing test data" → OFF
3. Add endpoint (même URL)
4. Copier nouveau webhook secret (whsec_...)

### 3. Mettre à Jour Render

Environment variables:
```
STRIPE_SECRET_KEY=sk_live_your-real-key
STRIPE_PUBLIC_KEY=pk_live_your-real-key
STRIPE_WEBHOOK_SECRET=whsec_your-live-secret
```

### 4. Tester avec Vraie Carte

⚠️ **Attention:** Ce sera un vrai paiement!
- Utiliser une vraie carte
- Montant réel débité
- Vérifier que crédits sont ajoutés

---

## 💰 Coûts Render

**Plan Starter ($7/month):**
- 512 MB RAM
- Shared CPU
- 100 GB bandwidth
- Auto-deploy
- SSL gratuit
- ✅ Recommandé pour démarrer

**Plan Free:**
- Service s'endort après 15 min d'inactivité
- Premier réveil ~1 minute
- Limites de CPU/RAM
- ⚠️ OK pour tests, pas pour production

---

## 📈 Scalabilité

Quand votre usage augmente:

**Signes de besoin d'upgrade:**
- Response times > 5 secondes
- CPU usage > 80%
- Memory usage > 80%
- Timeouts fréquents

**Solutions:**
1. Upgrade vers plan Pro ($25/month)
2. Optimiser code (cache, async)
3. Ajouter CDN (Cloudflare)
4. Séparer API et webhooks

---

## ✅ Checklist Finale

### Avant le Launch

- [ ] Backend déployé sur Render
- [ ] Tous les env vars configurés
- [ ] Webhook Stripe créé et testé
- [ ] Frontend pointe vers backend Render
- [ ] Test d'achat complet réussi
- [ ] Logs montrent succès
- [ ] Pas d'erreurs CORS
- [ ] Monitoring activé

### Après le Launch

- [ ] Surveiller logs quotidiennement
- [ ] Vérifier webhook success rate
- [ ] Monitorer usage Stripe
- [ ] Vérifier solde OpenAI
- [ ] Backup de credits.json
- [ ] Tester achats régulièrement

---

## 🎉 Déploiement Complet!

**Votre backend est maintenant:**
- ✅ Déployé sur Render
- ✅ CORS sécurisé
- ✅ Stripe configuré (EUR)
- ✅ Webhook fonctionnel
- ✅ Logs clairs
- ✅ Production ready!

**URLs de production:**
```
Backend:  https://aurisvoice-backend.onrender.com
Frontend: https://aurisvoice.vercel.app
Webhook:  https://aurisvoice-backend.onrender.com/api/stripe/webhook
```

---

**🚀 AurisVoice Backend - LIVE on Render! ✨**

**Prêt à accepter des paiements et générer des revenus! 💰💎**

