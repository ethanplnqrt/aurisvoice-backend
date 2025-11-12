# 🔗 Credits System Integration Guide

## Integration dans server-dub.js

Ce guide explique comment intégrer le système de crédits dans `server-dub.js` existant.

---

## 📝 Modifications à apporter

### 1️⃣ Ajouter l'import des fonctions de crédits

**En haut du fichier `server-dub.js`, après les autres imports:**

```javascript
import { getCredits, deductCredits, hasEnoughCredits, calculateCreditsNeeded } from './credits.js';
```

---

### 2️⃣ Ajouter l'endpoint GET /api/credits

**Ajouter après l'endpoint `/api/credit` existant:**

```javascript
/**
 * GET /api/credits
 * Returns the current AI dubbing credits balance
 */
app.get("/api/credits", (req, res) => {
  try {
    const result = getCredits();
    
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to retrieve credits'
      });
    }
    
    console.log(`💰 Credits retrieved: ${result.credits}`);
    
    res.json({
      ok: true,
      credits: result.credits,
      history: result.history.slice(-10) // Last 10 transactions
    });
  } catch (error) {
    console.error('❌ Credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});
```

---

### 3️⃣ Vérifier les crédits AVANT la génération

**Au début de la route `/api/dub`, après les logs initiaux:**

```javascript
app.post("/api/dub", upload.single("file"), async (req, res) => {
  console.log("🎤 Dubbing request received");
  
  // ✅ AJOUT: Check credits first (1 credit minimum required)
  const creditsCheck = getCredits();
  if (!creditsCheck.ok || creditsCheck.credits < 1) {
    console.log("❌ Insufficient credits");
    return res.status(402).json({
      ok: false,
      error: "Crédits insuffisants",
      message: "Vous n'avez plus assez de crédits. Rechargez votre compte.",
      creditsRemaining: creditsCheck.credits || 0,
      creditsRequired: 1
    });
  }
  
  console.log(`💰 Credits available: ${creditsCheck.credits}`);
  // ✅ FIN AJOUT
  
  const { targetLanguage } = req.body;
  const file = req.file;
  
  // ... reste du code existant ...
});
```

---

### 4️⃣ Décrémenter les crédits APRÈS succès

**À la fin de la route `/api/dub`, juste avant `res.json()` de succès:**

```javascript
// Existing success code...
console.log("✅ Dubbing completed:", outputPath);

// ✅ AJOUT: Deduct credits after successful generation
const estimatedDuration = 10; // seconds (can be actual duration if available)
const creditsToDeduct = calculateCreditsNeeded(estimatedDuration);

const deductResult = deductCredits(creditsToDeduct, `Doublage ${targetLanguage}`);

if (deductResult.ok) {
  console.log(`💸 Credits deducted: -${creditsToDeduct} (${deductResult.credits} remaining)`);
} else {
  console.warn(`⚠️  Credit deduction failed: ${deductResult.error}`);
}
// ✅ FIN AJOUT

res.json({
  ok: true,
  audioUrl: outputPath,
  provider: providerUsed,
  targetLanguage: targetLanguage,
  filename: outputFilename,
  // ✅ AJOUT: Include credit info in response
  creditsUsed: creditsToDeduct,
  creditsRemaining: deductResult.ok ? deductResult.credits : creditsCheck.credits
  // ✅ FIN AJOUT
});
```

---

## 📋 Code complet des modifications

### Modification 1: Imports (ligne ~6)

```javascript
// Existing imports
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// ✅ ADD THIS LINE
import { getCredits, deductCredits, hasEnoughCredits, calculateCreditsNeeded } from './credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### Modification 2: Endpoint crédits (après ligne ~580)

```javascript
/**
 * GET /api/credit
 * Returns the current OpenAI credit balance
 */
app.get("/api/credit", (req, res) => {
  res.json({
    ok: true,
    creditRemaining: creditRemaining,
    lastCheck: lastCreditCheck,
    minCredit: MIN_CREDIT,
    usingMockMode: creditRemaining !== null && creditRemaining < MIN_CREDIT
  });
});

// ✅ ADD THIS ENTIRE BLOCK
/**
 * GET /api/credits
 * Returns the current AI dubbing credits balance
 */
app.get("/api/credits", (req, res) => {
  try {
    const result = getCredits();
    
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to retrieve credits'
      });
    }
    
    console.log(`💰 Credits retrieved: ${result.credits}`);
    
    res.json({
      ok: true,
      credits: result.credits,
      history: result.history.slice(-10)
    });
  } catch (error) {
    console.error('❌ Credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});
// ✅ END OF ADDITION
```

### Modification 3: Vérification crédits (début de /api/dub, ligne ~180)

```javascript
app.post("/api/dub", upload.single("file"), async (req, res) => {
  console.log("🎤 Dubbing request received");
  
  // ✅ ADD THIS BLOCK
  // Check credits first (1 credit minimum required)
  const creditsCheck = getCredits();
  if (!creditsCheck.ok || creditsCheck.credits < 1) {
    console.log("❌ Insufficient credits");
    return res.status(402).json({
      ok: false,
      error: "Crédits insuffisants",
      message: "Vous n'avez plus assez de crédits. Rechargez votre compte.",
      creditsRemaining: creditsCheck.credits || 0,
      creditsRequired: 1
    });
  }
  
  console.log(`💰 Credits available: ${creditsCheck.credits}`);
  // ✅ END OF ADDITION
  
  const { targetLanguage } = req.body;
  const file = req.file;
  
  // ... rest of existing code ...
});
```

### Modification 4: Déduction crédits (fin de /api/dub, avant res.json, ligne ~560)

```javascript
// Existing code...
if (providerUsed === "mock") {
  // Mock mode success
  console.log("✅ Dubbing completed (mock):", outputPath);
  
  // ✅ ADD THIS BLOCK
  const estimatedDuration = 10;
  const creditsToDeduct = calculateCreditsNeeded(estimatedDuration);
  const deductResult = deductCredits(creditsToDeduct, `Doublage ${targetLanguage} (mock)`);
  
  if (deductResult.ok) {
    console.log(`💸 Credits deducted: -${creditsToDeduct} (${deductResult.credits} remaining)`);
  }
  // ✅ END OF ADDITION
  
  res.json({
    ok: true,
    audioUrl: outputPath,
    provider: "mock",
    targetLanguage: targetLanguage,
    filename: outputFilename,
    // ✅ ADD THESE FIELDS
    creditsUsed: creditsToDeduct,
    creditsRemaining: deductResult.ok ? deductResult.credits : creditsCheck.credits
    // ✅ END OF ADDITION
  });
  return;
}

// Similar for OpenAI and ElevenLabs success blocks...
```

---

## 🧪 Testing After Integration

### 1. Test Credits Endpoint

```bash
curl http://localhost:3000/api/credits
```

**Expected:**
```json
{
  "ok": true,
  "credits": 10,
  "history": [...]
}
```

### 2. Test Dubbing with Sufficient Credits

```bash
curl -X POST http://localhost:3000/api/dub \
  -F "file=@test.mp3" \
  -F "targetLanguage=en"
```

**Expected:**
```json
{
  "ok": true,
  "audioUrl": "/output/...",
  "creditsUsed": 1,
  "creditsRemaining": 9
}
```

### 3. Test Insufficient Credits

Manually edit `credits.json`:
```json
{
  "credits": 0,
  "history": []
}
```

Then test dubbing:
```bash
curl -X POST http://localhost:3000/api/dub \
  -F "file=@test.mp3" \
  -F "targetLanguage=en"
```

**Expected (402 error):**
```json
{
  "ok": false,
  "error": "Crédits insuffisants",
  "message": "Vous n'avez plus assez de crédits. Rechargez votre compte.",
  "creditsRemaining": 0,
  "creditsRequired": 1
}
```

---

## 🔄 Alternative: Separate Servers

Si vous préférez ne pas modifier `server-dub.js`:

**Option 1: Run Both Servers**
```bash
# Terminal 1: Main dubbing API
PORT=3000 node server-dub.js

# Terminal 2: Payment API
PORT=3003 node server-stripe.js

# Frontend connects to both:
# - Dubbing: http://localhost:3000
# - Credits: http://localhost:3003
```

**Option 2: Proxy/Load Balancer**
- Use nginx or similar to route:
  - `/api/dub` → server-dub.js
  - `/api/credits` → server-stripe.js
  - `/api/checkout` → server-stripe.js

---

## ✅ Verification Checklist

After integration:

- [ ] `credits.js` imported successfully
- [ ] `GET /api/credits` returns balance
- [ ] Credits checked before dubbing
- [ ] Error 402 when insufficient
- [ ] Credits deducted after success
- [ ] Response includes `creditsUsed` and `creditsRemaining`
- [ ] No TypeScript/lint errors
- [ ] Server starts without issues

---

## 🎯 Final Structure

```
server-dub.js (Modified)
├── Import credits.js
├── GET /api/credit (existing - OpenAI)
├── GET /api/credits (NEW - Dubbing credits)
└── POST /api/dub
    ├── Check credits (NEW)
    ├── Generate dubbing (existing)
    └── Deduct credits (NEW)

server-stripe.js (Separate)
├── POST /api/checkout
├── POST /api/stripe/webhook
└── GET /api/plans

credits.js (Utility)
├── getCredits()
├── addCredits()
├── deductCredits()
├── hasEnoughCredits()
└── calculateCreditsNeeded()

credits.json (Storage)
└── { credits: 10, history: [...] }
```

---

**🔗 Integration Complete! Ready to track and monetize! 💰✨**

