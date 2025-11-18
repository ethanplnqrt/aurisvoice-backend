# ⚡ Render - Référence Rapide

## 🎯 Configuration en 3 lignes

```
Root Directory: server
Build Command: npm install
Start Command: node index.js
```

## 📁 Structure GitHub attendue

```
aurisvoice-backend/
├── server/
│   ├── index.js          ← Point d'entrée
│   ├── package.json      ← Dépendances
│   └── package-lock.json
├── credits.js            ← Importé depuis server/
└── credits.json          ← Créé automatiquement
```

## 🔑 Variables d'environnement essentielles

```bash
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://profound-basbousa-d0683f.netlify.app
FRONTEND_URL=https://profound-basbousa-d0683f.netlify.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## ✅ Test rapide

```bash
curl https://aurisvoice-backend.onrender.com/status
curl https://aurisvoice-backend.onrender.com/api/credits
curl https://aurisvoice-backend.onrender.com/api/plans
```

## 📚 Documentation complète

- **Configuration détaillée** : `RENDER_CONFIGURATION.md`
- **Étapes pas à pas** : `RENDER_SETUP_STEPS.md`

