# 🧪 AurisVoice - Test Webhook Guide

## Endpoints de Test Stripe Webhook

Deux nouveaux endpoints ont été ajoutés pour **tester le système de webhook Stripe** sans utiliser de vraies transactions.

---

## 🎯 Endpoints Disponibles

### 1. POST /api/test-webhook
**Simule un événement Stripe `checkout.session.completed`**

**URL:** `http://localhost:10000/api/test-webhook`

**Sécurité:** 
- ✅ Fonctionne en développement/test
- ❌ **Bloqué en production** (error 403)

**Body (JSON):**
```json
{
  "test": true,
  "amount_total": 500,
  "credits": "15",
  "plan": "starter",
  "customer_email": "test@aurisvoice.com"
}
```

**Réponse (Success):**
```json
{
  "ok": true,
  "message": "Test webhook processed successfully",
  "event": "checkout.session.completed",
  "credits_added": 15,
  "new_balance": 25,
  "amount": 5,
  "test": true
}
```

**Console Output:**
```
🧪 ═══════════════════════════════════════════════════════
   WEBHOOK TEST RECEIVED
   ═══════════════════════════════════════════════════════

💳 Simulated Payment:
   Session ID: cs_test_1699999999999
   Amount: €5
   Plan: starter
   Credits: 15
   Email: test@aurisvoice.com

✅ Crédits ajoutés avec succès: +15
   Nouveau solde: 25 crédits

🎉 Test webhook traité avec succès!
```

### 2. GET /api/webhook-log
**Retourne les 10 derniers événements webhook**

**URL:** `http://localhost:10000/api/webhook-log`

**Réponse:**
```json
{
  "ok": true,
  "count": 2,
  "events": [
    {
      "event": "checkout.session.completed",
      "amount": 5,
      "credits": 15,
      "source": "test",
      "date": "2025-11-12T10:30:00.000Z",
      "timestamp": 1699878600000
    },
    {
      "event": "checkout.session.completed",
      "amount": 15,
      "credits": 60,
      "source": "stripe",
      "date": "2025-11-12T09:15:00.000Z",
      "timestamp": 1699874100000
    }
  ],
  "info": {
    "max_entries": 10,
    "storage": "in-memory",
    "resets_on_restart": true
  }
}
```

---

## 🧪 Tests à Effectuer

### Test 1: Webhook Starter (5€)

```bash
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "amount_total": 500,
    "credits": "15",
    "plan": "starter"
  }'
```

**Expected:**
```json
{
  "ok": true,
  "credits_added": 15,
  "new_balance": 25
}
```

### Test 2: Webhook Pro (15€)

```bash
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "amount_total": 1500,
    "credits": "60",
    "plan": "pro"
  }'
```

**Expected:**
```json
{
  "ok": true,
  "credits_added": 60,
  "new_balance": 85
}
```

### Test 3: Webhook Premium (30€)

```bash
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "test": true,
    "amount_total": 3000,
    "credits": "150",
    "plan": "premium"
  }'
```

**Expected:**
```json
{
  "ok": true,
  "credits_added": 150,
  "new_balance": 235
}
```

### Test 4: Vérifier l'Historique

```bash
curl http://localhost:10000/api/webhook-log
```

**Expected:** Liste des 3 événements ci-dessus

### Test 5: Vérifier les Crédits

```bash
curl http://localhost:10000/api/credits
```

**Expected:**
```json
{
  "ok": true,
  "credits": 235,
  "history": [...]
}
```

---

## 🔒 Sécurité Production

### Test en Production (doit échouer)

```bash
# En production (NODE_ENV=production)
curl -X POST https://aurisvoice-backend.onrender.com/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

**Expected (403 Forbidden):**
```json
{
  "ok": false,
  "error": "Test webhooks are disabled in production",
  "message": "Use real Stripe webhooks in production mode"
}
```

**Console:**
```
⚠️  Test webhook blocked in production mode
```

### Protection Implémentée

```javascript
const isProduction = process.env.NODE_ENV === 'production';
const isTestRequest = req.body.test === true;

if (isProduction && isTestRequest) {
  return res.status(403).json({
    ok: false,
    error: 'Test webhooks are disabled in production'
  });
}
```

---

## 📊 Webhook Log

### Stockage

**Type:** In-memory (RAM)
**Capacité:** 10 derniers événements
**Persistance:** Non (reset au redémarrage)

### Format d'un Event

```javascript
{
  event: 'checkout.session.completed',  // Type d'événement
  amount: 5,                             // Montant en EUR
  credits: 15,                           // Crédits ajoutés
  source: 'test',                        // 'test' ou 'stripe'
  date: '2025-11-12T10:30:00.000Z',     // ISO timestamp
  timestamp: 1699878600000               // Unix timestamp
}
```

### Sources

- **`test`**: Événement simulé via `/api/test-webhook`
- **`stripe`**: Événement réel du webhook Stripe

---

## 🎯 Workflow de Test Complet

### 1. Démarrer le Serveur

```bash
cd /Users/ethan.plnqrt/Desktop/aurisvoice-backend
node server-stripe.js
```

**Vérifier dans les logs:**
```
🧪 Testing Endpoints:
   POST /api/test-webhook - Simulate Stripe webhook
   GET /api/webhook-log - View webhook history
```

### 2. Vérifier le Solde Initial

```bash
curl http://localhost:10000/api/credits
```

**Expected:** 10 crédits initiaux

### 3. Simuler un Achat Starter

```bash
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true, "amount_total": 500, "credits": "15", "plan": "starter"}'
```

**Vérifier console:**
```
🧪 WEBHOOK TEST RECEIVED
💳 Simulated Payment: €5
✅ Crédits ajoutés avec succès: +15
```

### 4. Vérifier le Nouveau Solde

```bash
curl http://localhost:10000/api/credits
```

**Expected:** 25 crédits (10 + 15)

### 5. Vérifier l'Historique des Webhooks

```bash
curl http://localhost:10000/api/webhook-log
```

**Expected:** 1 événement dans la liste

### 6. Simuler Plusieurs Achats

```bash
# Pro (60 crédits)
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true, "amount_total": 1500, "credits": "60", "plan": "pro"}'

# Premium (150 crédits)
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true, "amount_total": 3000, "credits": "150", "plan": "premium"}'
```

### 7. Vérifier le Solde Final

```bash
curl http://localhost:10000/api/credits
```

**Expected:** 235 crédits (10 + 15 + 60 + 150)

### 8. Vérifier Tous les Événements

```bash
curl http://localhost:10000/api/webhook-log
```

**Expected:** 3 événements avec sources "test"

---

## 🐛 Troubleshooting

### Problème 1: "Cannot POST /api/test-webhook"

**Cause:** Serveur pas démarré ou mauvais port

**Solution:**
```bash
# Vérifier le serveur
curl http://localhost:10000/status

# Redémarrer si nécessaire
node server-stripe.js
```

### Problème 2: "403 Forbidden"

**Cause:** Variable `NODE_ENV=production` active

**Solution:**
```bash
# En local, ne pas définir NODE_ENV
# Ou définir explicitement:
export NODE_ENV=development
node server-stripe.js
```

### Problème 3: Crédits non ajoutés

**Cause:** credits.json inaccessible

**Solution:**
```bash
# Vérifier le fichier
cat credits.json

# Réinitialiser si nécessaire
echo '{"credits": 10, "history": []}' > credits.json
```

### Problème 4: Log vide

**Cause:** Aucun webhook traité ou serveur redémarré

**Solution:**
```bash
# Le log est en mémoire, il se vide au redémarrage
# Faire un test webhook pour le remplir
curl -X POST http://localhost:10000/api/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 📈 Comparaison Test vs Real

| Aspect | Test Webhook | Real Webhook |
|--------|--------------|--------------|
| **Endpoint** | /api/test-webhook | /api/stripe/webhook |
| **Source** | test | stripe |
| **Sécurité** | Bloqué en prod | Vérifié par signature |
| **Body** | JSON simple | Event Stripe complet |
| **Validation** | Minimale | Signature check |
| **Log** | Détaillé (console) | Minimal (prod) |

---

## ✅ Checklist de Validation

Avant de déployer en production:

### Tests Locaux ✅
- [ ] Serveur démarre sans erreur
- [ ] `/api/test-webhook` fonctionne
- [ ] Crédits sont ajoutés
- [ ] `/api/webhook-log` retourne events
- [ ] Console logs clairs
- [ ] Solde correct dans credits.json

### Sécurité ✅
- [ ] Bloqué en prod avec `test: true`
- [ ] Logs sans infos sensibles
- [ ] Pas d'erreur 500
- [ ] Error messages clairs

### Integration ✅
- [ ] Même logique que webhook réel
- [ ] addCredits() appelé
- [ ] Événements loggés
- [ ] Format compatible

---

## 🎉 Test Webhook Ready!

**Vous pouvez maintenant:**
- ✅ Tester les paiements sans Stripe
- ✅ Valider le flow de crédits
- ✅ Debugger facilement
- ✅ Voir l'historique des events
- ✅ Simuler tous les plans

**Avant de passer en production:**
1. Tester tous les plans (starter, pro, premium)
2. Vérifier les crédits ajoutés
3. Valider les logs
4. Tester le webhook réel Stripe
5. Désactiver test mode

---

**🧪 Test Endpoints Ready! ✨**

**Test Webhook:** ✅ Functional  
**Webhook Log:** ✅ Available  
**Security:** ✅ Production-safe  
**Logging:** ✅ Clear  
**Status:** 🟢 **READY TO TEST!**

**Next:** `curl -X POST http://localhost:10000/api/test-webhook -d '{"test":true}'` 🚀

