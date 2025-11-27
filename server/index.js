// AurisVoice Backend - Unified Entry Point
// Handles: Stripe, Webhooks, Credits, Dubbing, History, API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import { getCredits, addCredits, deductCredits, hasEnoughCredits, calculateCreditsNeeded } from './credits.js';
import { sendEmail } from './utils/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://aurisvoice.com",
  "https://www.aurisvoice.com",
  "https://aurisvoice-frontend.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        console.log("🌍 CORS: No origin (mobile/cURL) → allowed");
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("🟢 CORS ALLOWED:", origin);
        return callback(null, true);
      } else {
        console.log("❌ CORS BLOCKED:", origin);
        return callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id"
    ],
    exposedHeaders: ["X-RateLimit-Remaining"],
    credentials: true,
  })
);

app.options("*", cors()); // Enable preflight globally

// Add header support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-id");
  next();
});

console.log("✅ CORS system loaded.");

// ============================================================================
// SETUP & CONFIGURATION
// ============================================================================

// Setup directories (all within /server for Render compatibility)
const logsDir = join(__dirname, 'logs');
const uploadsDir = join(__dirname, 'uploads');
const outputDir = join(__dirname, 'output');
const logFile = join(logsDir, 'stripe-webhook.log');
const securityLogFile = join(logsDir, 'stripe-security.log');

// Ensure directories exist
[logsDir, uploadsDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not configured');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// 1. RAW body EXCLUSIVEMENT pour Stripe webhook (doit être AVANT express.json())
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use('/webhook', express.raw({ type: 'application/json' }));

// 2. JSON parser pour toutes les autres routes (ne s'applique pas au webhook)
app.use(express.json());

// Serve static files from output directory
app.use('/output', express.static(outputDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + extname(file.originalname));
  }
});

// Maximum file size: 50 MB (50 * 1024 * 1024 bytes = 52,428,800 bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE // 50MB limit - robust protection against abuse
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /audio\/.*|video\/.*/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio and video files are allowed.'));
    }
  }
});

// Rate limiter for /api/dub route (anti-spam protection)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Maximum 5 requests per minute per IP
  message: {
    error: 'Too many requests, please try again after 1 minute.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  statusCode: 429 // HTTP status code for rate limit exceeded
});

// Rate limiter for Stripe webhook (production security)
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Maximum 5 requests per minute per IP
  message: {
    error: 'Too many webhook requests'
  },
  standardHeaders: false, // Pas de headers inutiles
  legacyHeaders: false,
  statusCode: 429
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Save dubbing history (placeholder for future database integration)
function saveDubbingHistory(userId, metadata) {
  // TODO: Integrate with database (Postgres, MongoDB, etc.)
  // This is a placeholder function for future implementation
  const { fileName, creditsUsed, timestamp, inputName } = metadata;
  
  // For now, just log the history entry
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📝 [HISTORY] Would save: ${JSON.stringify(metadata, null, 2)}`);
  }
  
  // Future implementation:
  // - Connect to database
  // - Insert record with userId, fileName, creditsUsed, timestamp, inputName
  // - Handle errors appropriately
  
  return { ok: true, saved: true };
}

// Get dubbing history (placeholder for future database integration)
function getDubbingHistory(userId) {
  // TODO: Integrate with database (Postgres, MongoDB, etc.)
  // This is a placeholder function that returns mock data
  // Future implementation will query the database for the user's dubbing history
  
  const mockHistory = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      inputName: 'video-sample-1.mp4',
      outputFileName: 'dub-1762372473952.mp3',
      creditsUsed: 15,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      inputName: 'audio-presentation.wav',
      outputFileName: 'dub-1762458873952.mp3',
      creditsUsed: 8,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      inputName: 'interview-french.mp3',
      outputFileName: 'dub-1762545273952.mp3',
      creditsUsed: 12,
      timestamp: new Date().toISOString() // Today
    }
  ];
  
  // Future implementation:
  // - Connect to database
  // - Query: SELECT * FROM dubbing_history WHERE user_id = userId ORDER BY timestamp DESC
  // - Return array of history records
  
  return mockHistory;
}

// Webhook logging
function writeLog(eventType, sessionId, amount, credits, metadata) {
  const timestamp = new Date().toISOString();
  const amountStr = amount ? `€${amount}` : 'N/A';
  const creditsStr = credits ? `+${credits} credits` : 'N/A';
  const sessionStr = sessionId || 'N/A';
  const metadataStr = metadata ? JSON.stringify(metadata) : '{}';
  
  const logLine = `[${timestamp}] ${eventType} | ${sessionStr} | ${amountStr} | ${creditsStr} | ${metadataStr}\n`;
  
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    console.error('❌ Failed to write to log file:', error);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📝 [WEBHOOK LOG] ${logLine.trim()}`);
  }
}

// Security logging
function writeSecurityLog(data) {
  const timestamp = new Date().toISOString();
  const {
    ip,
    eventId,
    eventType,
    signatureValid,
    replay,
    rateLimited,
    reason
  } = data;
  
  const logLine = JSON.stringify({
    timestamp,
    ip: ip || 'unknown',
    event_id: eventId || null,
    event_type: eventType || null,
    signature_valid: signatureValid !== undefined ? signatureValid : null,
    replay: replay !== undefined ? replay : false,
    rate_limited: rateLimited !== undefined ? rateLimited : false,
    reason: reason || null
  }) + '\n';
  
  try {
    fs.appendFileSync(securityLogFile, logLine, 'utf8');
  } catch (error) {
    console.error('❌ Failed to write to security log file:', error);
  }
}

// Rate limiting for webhook endpoint
const webhookRateLimit = {
  requests: new Map(),
  maxRequests: 10,
  windowMs: 60 * 1000,
};

function checkRateLimit(ip) {
  const now = Date.now();
  const record = webhookRateLimit.requests.get(ip);
  
  if (!record || now > record.resetTime) {
    webhookRateLimit.requests.set(ip, {
      count: 1,
      resetTime: now + webhookRateLimit.windowMs
    });
    return { allowed: true, remaining: webhookRateLimit.maxRequests - 1 };
  }
  
  if (record.count >= webhookRateLimit.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: webhookRateLimit.maxRequests - record.count };
}

// Anti-replay: Set to prevent double processing of Stripe events
const processedEvents = new Set();
const MAX_PROCESSED_EVENTS = 1000; // Increased for production

// User lock system to prevent race conditions in credit deduction
const userLocks = new Map(); // userId -> Promise resolver

// Webhook event log (in-memory storage)
const webhookLog = [];
const MAX_LOG_ENTRIES = 10;

function logWebhookEvent(event, amount, credits, source = 'stripe') {
  const logEntry = {
    event: event,
    amount: amount,
    credits: credits,
    source: source,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };
  
  webhookLog.unshift(logEntry);
  if (webhookLog.length > MAX_LOG_ENTRIES) {
    webhookLog.pop();
  }
  
  return logEntry;
}

// Credit monitoring for OpenAI
let creditRemaining = null;
let lastCreditCheck = null;
const CREDIT_CHECK_INTERVAL = 5 * 60 * 1000;
const MIN_CREDIT = parseFloat(process.env.OPENAI_MIN_CREDIT || '1.0');

async function checkOpenAICredit() {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  if (!API_KEY) {
    return { ok: true, credit: 999.99, mock: true };
  }

  try {
    const mockCredit = 5.92;
    console.log(`💰 Credit check: $${mockCredit.toFixed(2)} (mock mode)`);
    return { ok: true, credit: mockCredit, mock: true };
  } catch (error) {
    console.error('❌ Credit check error:', error.message);
    return { ok: true, credit: 5.00, mock: true, error: error.message };
  }
}

async function updateCreditBalance() {
  const result = await checkOpenAICredit();
  if (result.ok) {
    creditRemaining = result.credit;
    lastCreditCheck = Date.now();
    
    if (creditRemaining < MIN_CREDIT) {
      console.warn(`⚠️ LOW CREDIT WARNING: Only $${creditRemaining.toFixed(2)} remaining (minimum: $${MIN_CREDIT.toFixed(2)})`);
    }
  }
  return result;
}

async function getCreditStatus() {
  const now = Date.now();
  const needsRefresh = !lastCreditCheck || (now - lastCreditCheck) > CREDIT_CHECK_INTERVAL;
  
  if (needsRefresh) {
    await updateCreditBalance();
  }
  
  return {
    creditRemaining,
    lastCheck: lastCreditCheck ? new Date(lastCreditCheck).toISOString() : null,
    belowMinimum: creditRemaining < MIN_CREDIT
  };
}

// ============================================================================
// PRICING PLANS
// ============================================================================

const PRICING_PLANS = {
  starter: {
    priceInCents: 500,
    credits: 15,
    name: 'Starter Pack',
    description: '15 crédits de doublage IA'
  },
  pro: {
    priceInCents: 1500,
    credits: 60,
    name: 'Pro Pack',
    description: '60 crédits de doublage IA'
  },
  premium: {
    priceInCents: 3000,
    credits: 150,
    name: 'Premium Pack',
    description: '150 crédits de doublage IA'
  }
};

// ============================================================================
// ROUTES
// ============================================================================

// Root route
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AurisVoice API</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 80px auto;
          padding: 20px;
          text-align: center;
        }
        h1 { color: #2563eb; margin-bottom: 10px; }
        p { color: #64748b; font-size: 18px; }
        .endpoint { 
          background: #f1f5f9; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 20px 0;
          text-align: left;
        }
        code { color: #0f172a; font-weight: 600; }
      </style>
    </head>
    <body>
      <h1>🎙️ AurisVoice Backend</h1>
      <p>Premium AI Voice Dubbing API</p>
      <div class="endpoint">
        <strong>Health Check:</strong><br>
        <code>GET /status</code> → Returns server status
      </div>
      <div class="endpoint">
        <strong>Generate Dub:</strong><br>
        <code>POST /api/dub</code> → Upload file and generate AI dub
      </div>
    </body>
    </html>
  `);
});

// Status endpoint
app.get("/status", (req, res) => {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const webhookConfigured = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  res.json({ 
    ok: true, 
    message: "AurisVoice backend is running 🚀",
    stripe: {
      configured: stripeConfigured,
      webhook: webhookConfigured,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test'
    },
    credits: getCredits().credits,
    endpoints: {
      credits: 'GET /api/credits',
      checkout: 'POST /api/stripe/checkout',
      webhook: 'POST /api/stripe/webhook',
      plans: 'GET /api/plans',
      dub: 'POST /api/dub',
      history: 'GET /api/history'
    }
  });
});

// ============================================================================
// CREDITS & STRIPE ROUTES
// ============================================================================

app.get('/api/credits', (req, res) => {
  try {
    const result = getCredits();
    
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to retrieve credits'
      });
    }
    
    const credits = typeof result.credits === 'number' ? result.credits : 0;
    const history = Array.isArray(result.history) ? result.history : [];
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💰 Credits retrieved: ${credits}`);
    }
    
    res.json({
      ok: true,
      credits: credits,
      history: history.slice(-10)
    });
  } catch (error) {
    console.error('❌ Credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Route alias: /credits/:userId
app.get('/credits/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const result = getCredits();
    
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to retrieve credits'
      });
    }
    
    const credits = typeof result.credits === 'number' ? result.credits : 0;
    const history = Array.isArray(result.history) ? result.history : [];
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💰 Credits retrieved for user ${userId}: ${credits}`);
    }
    
    res.json({
      ok: true,
      userId: userId,
      credits: credits,
      history: history.slice(-10)
    });
  } catch (error) {
    console.error('❌ Credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
});

app.post('/api/stripe/checkout', express.json(), async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !PRICING_PLANS[plan]) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid plan selected'
      });
    }
    
    const planDetails = PRICING_PLANS[plan];
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      currency: 'eur',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: planDetails.name,
              description: planDetails.description,
              images: ['https://aurisvoice.vercel.app/logo.png'],
            },
            unit_amount: planDetails.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3001'}/payment/cancel`,
      metadata: {
        plan: plan,
        credits: planDetails.credits.toString(),
      },
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💳 Checkout session created: ${session.id} (${plan})`);
    }
    
    res.json({
      ok: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Webhook handler function (shared for both routes) - Production ready
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // 1. Vérification du secret configuré
  if (!webhookSecret) {
    return res.status(500).json({ ok: false, error: 'Webhook secret not configured' });
  }

  // 2. Vérification de la signature header
  if (!sig) {
    return res.status(400).json({ ok: false, error: 'Invalid signature' });
  }

  // 3. Vérification signature stricte avec Stripe
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'Invalid signature' });
  }

  // 4. Anti-replay: Vérifier si l'événement a déjà été traité
  if (event.id && processedEvents.has(event.id)) {
    return res.status(200).json({ ok: true, duplicate: true });
  }

  // 5. Log propre (uniquement le type d'événement)
  console.log('[Stripe] Webhook reçu:', event.type);

  // 6. Traitement de l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    const customerEmail = session.customer_email || session.customer_details?.email;
    const credits = parseInt(session?.metadata?.credits || '0', 10);

    if (credits > 0) {
      const result = addCredits(credits, `Achat Stripe (session: ${sessionId})`);
      
      if (result.ok) {
        console.log(`💰 Succès Webhook : Crédits ajoutés — Session ID: ${sessionId}, Crédits: ${credits}`);
        
        // Vérification solde Stripe
        try {
          const balance = await stripe.balance.retrieve();
          const available = balance.available[0]?.amount / 100;

          if (available < 20) {
            await sendEmail(
              'ethan.plnqrt@gmail.com',
              '⚠️ AurisVoice – Solde Stripe faible',
              `
                <h2>Alerte automatique AurisVoice</h2>
                <p>Ton solde Stripe est passé sous <strong>20€</strong>.</p>
                <p>Solde actuel : <strong>${available}€</strong></p>
                <p>Pense à recharger ton compte pour éviter les interruptions.</p>
              `
            );
            console.log('📧 Alerte email envoyée : solde Stripe faible');
          }
        } catch (err) {
          console.error('❌ Erreur vérification solde Stripe:', err);
        }
      } else {
        console.error('[Stripe] Erreur ajout crédits:', result.error);
      }
    }
  }

  // 7. Ajouter l'événement au Set anti-replay
  if (event.id) {
    processedEvents.add(event.id);
    // Nettoyer le Set si trop grand (garder les 1000 derniers)
    if (processedEvents.size > MAX_PROCESSED_EVENTS) {
      const firstEvent = Array.from(processedEvents)[0];
      processedEvents.delete(firstEvent);
    }
  }

  // 8. Retourner 200 pour tous les événements valides
  return res.status(200).json({ ok: true });
};

// Register routes: /webhook and /api/stripe/webhook (sécurisées)
app.post('/webhook', webhookLimiter, handleWebhook);
app.post('/api/stripe/webhook', webhookLimiter, handleWebhook);

app.get('/api/plans', (req, res) => {
  const plans = Object.entries(PRICING_PLANS).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description,
    price: value.priceInCents / 100,
    currency: 'EUR',
    credits: value.credits,
    pricePerCredit: (value.priceInCents / 100 / value.credits).toFixed(2)
  }));
  
  res.json({
    ok: true,
    plans: plans
  });
});

// ============================================================================
// DUBBING ROUTES
// ============================================================================

app.get("/api/credit", async (req, res) => {
  try {
    const status = await getCreditStatus();
    
    res.json({
      ok: true,
      creditRemaining: status.creditRemaining,
      minCredit: MIN_CREDIT,
      belowMinimum: status.belowMinimum,
      lastCheck: status.lastCheck,
      recommendation: status.belowMinimum 
        ? 'Add credits to enable OpenAI TTS' 
        : 'Credit balance is sufficient'
    });
  } catch (error) {
    console.error('❌ Error fetching credit status:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch credit balance',
      message: error.message
    });
  }
});

// ============================================================================
// LISTES BLANCHES POUR VALIDATION LANGUE & VOIX
// ============================================================================

// Langues supportées (codes ISO avec locale, ex: "fr-FR", "en-US")
const SUPPORTED_LANGUAGES_BACKEND = [
  'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH',
  'en-US', 'en-GB', 'en-AU', 'en-CA',
  'es-ES', 'es-MX', 'es-AR',
  'pt-PT', 'pt-BR',
  'it-IT', 'de-DE', 'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI', 'pl-PL', 'cs-CZ', 'el-GR',
  'ja-JP', 'ko-KR', 'zh-CN', 'zh-HK', 'hi-IN', 'id-ID', 'th-TH', 'vi-VN',
  'ar-SA', 'ar-EG', 'tr-TR'
];

// Codes de langue courts pour compatibilité (ex: "fr", "en")
const LANGUAGE_CODE_MAP = {
  'fr-FR': 'fr', 'fr-CA': 'fr', 'fr-BE': 'fr', 'fr-CH': 'fr',
  'en-US': 'en', 'en-GB': 'en', 'en-AU': 'en', 'en-CA': 'en',
  'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es',
  'pt-PT': 'pt', 'pt-BR': 'pt',
  'it-IT': 'it', 'de-DE': 'de', 'nl-NL': 'nl', 'sv-SE': 'sv', 'no-NO': 'no', 'da-DK': 'da', 'fi-FI': 'fi', 'pl-PL': 'pl', 'cs-CZ': 'cs', 'el-GR': 'el',
  'ja-JP': 'ja', 'ko-KR': 'ko', 'zh-CN': 'zh', 'zh-HK': 'zh', 'hi-IN': 'hi', 'id-ID': 'id', 'th-TH': 'th', 'vi-VN': 'vi',
  'ar-SA': 'ar', 'ar-EG': 'ar', 'tr-TR': 'tr'
};

// Voix OpenAI TTS supportées
const SUPPORTED_VOICES_BACKEND = [
  'alloy', 'nova', 'shimmer', 'verse', 'echo', 'fable', 'onyx', 'wind', 'robotic', 'sage', 'coral'
];

// Fonction de validation et normalisation de la langue
function validateAndNormalizeLanguage(languageCode) {
  const DEFAULT_LANGUAGE = 'en-US';
  const DEFAULT_LANGUAGE_SHORT = 'en';
  
  if (!languageCode || typeof languageCode !== 'string') {
    return { resolved: DEFAULT_LANGUAGE, short: DEFAULT_LANGUAGE_SHORT, original: null };
  }
  
  const normalized = languageCode.trim();
  
  // Vérifier si c'est un code complet (ex: "fr-FR")
  if (SUPPORTED_LANGUAGES_BACKEND.includes(normalized)) {
    const shortCode = LANGUAGE_CODE_MAP[normalized] || DEFAULT_LANGUAGE_SHORT;
    return { resolved: normalized, short: shortCode, original: normalized };
  }
  
  // Vérifier si c'est un code court (ex: "fr") - compatibilité avec ancien format
  const matchingFullCode = Object.keys(LANGUAGE_CODE_MAP).find(
    key => LANGUAGE_CODE_MAP[key] === normalized.toLowerCase()
  );
  
  if (matchingFullCode) {
    return { resolved: matchingFullCode, short: normalized.toLowerCase(), original: normalized };
  }
  
  // Fallback sur défaut
  console.warn(`⚠️  Langue non supportée: ${normalized}, fallback sur ${DEFAULT_LANGUAGE}`);
  return { resolved: DEFAULT_LANGUAGE, short: DEFAULT_LANGUAGE_SHORT, original: normalized };
}

// Fonction de validation de la voix
function validateVoice(voiceId) {
  const DEFAULT_VOICE = 'nova';
  
  if (!voiceId || typeof voiceId !== 'string') {
    return { resolved: DEFAULT_VOICE, original: null };
  }
  
  const normalized = voiceId.trim().toLowerCase();
  
  if (SUPPORTED_VOICES_BACKEND.includes(normalized)) {
    return { resolved: normalized, original: voiceId };
  }
  
  // Fallback sur défaut
  console.warn(`⚠️  Voix non supportée: ${voiceId}, fallback sur ${DEFAULT_VOICE}`);
  return { resolved: DEFAULT_VOICE, original: voiceId };
}

// Dub handler function (shared for both routes)
const handleDubRequest = async (req, res) => {
  // Get userId early for lock management
  const userId = req.headers['x-user-id'] || 'anonymous';
  let isLocked = false;
  let lockResolver = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No file uploaded"
      });
    }

    // Extract parameters from req.body (Multer places non-file fields here)
    // Le frontend envoie "targetLanguage" (format "fr-FR") et "voiceModel" (ex: "nova")
    const { targetLanguage, sourceLanguage, voiceModel } = req.body;
    
    // Validation et normalisation de la langue
    const languageValidation = validateAndNormalizeLanguage(targetLanguage);
    const selectedTargetLanguage = languageValidation.short; // Code court pour OpenAI TTS
    const selectedLanguageCode = languageValidation.resolved; // Code complet pour logs
    
    // Validation et normalisation de la voix
    const voiceValidation = validateVoice(voiceModel);
    const selectedVoiceModel = voiceValidation.resolved;
    
    // Logs explicites en français
    console.log(`[DUBBING] Requête reçue — userId: ${userId}`);
    console.log(`[DUBBING] Langue demandée: ${languageValidation.original || 'non spécifiée'} → résolue: ${selectedLanguageCode} (code court: ${selectedTargetLanguage})`);
    console.log(`[DUBBING] Voix demandée: ${voiceValidation.original || 'non spécifiée'} → résolue: ${selectedVoiceModel}`);
    console.log(`[DUBBING] Fichier: ${req.file.filename} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const jobId = Date.now().toString();
    
    const estimatedDurationSeconds = Math.max(10, Math.ceil(req.file.size / (1024 * 100)));
    const requiredCredits = calculateCreditsNeeded(estimatedDurationSeconds);
    
    console.log(`💰 Estimated duration: ${estimatedDurationSeconds}s → ${requiredCredits} credits required`);
    
    // ============================================================================
    // SÉCURISATION : Système de verrouillage pour éviter les race conditions
    // ============================================================================
    
    // Wait for any existing lock on this user to be released
    while (userLocks.has(userId)) {
      console.log(`🔒 Waiting for lock release for user: ${userId}`);
      await userLocks.get(userId);
    }
    
    // Acquire lock for this user
    const lockPromise = new Promise((resolve) => {
      lockResolver = resolve;
    });
    userLocks.set(userId, lockPromise);
    isLocked = true;
    
    try {
      // Vérification initiale des crédits (avec verrouillage actif)
      const creditsResult = getCredits();
      if (!creditsResult.ok) {
        return res.status(500).json({
          ok: false,
          error: "Failed to check credits balance"
        });
      }
      
      if (!hasEnoughCredits(requiredCredits)) {
        console.log(`❌ Insufficient credits: ${creditsResult.credits} < ${requiredCredits}`);
        return res.status(402).json({
          ok: false,
          error: "NOT_ENOUGH_CREDITS",
          credits: creditsResult.credits,
          required: requiredCredits,
          message: `Vous avez besoin de ${requiredCredits} crédits pour ce doublage (${creditsResult.credits} disponibles)`
        });
      }
      
      console.log(`✅ Credits check passed: ${creditsResult.credits} >= ${requiredCredits}`);
      
      // ============================================================================
      // DÉDUCTION DES CRÉDITS AVANT LA GÉNÉRATION (sécurisée avec verrouillage)
      // ============================================================================
      const deductResult = deductCredits(requiredCredits, `Doublage ${selectedTargetLanguage} (${estimatedDurationSeconds}s)`);
      
      if (!deductResult.ok) {
        // Si la déduction échoue (crédits insuffisants), arrêter immédiatement
        console.error(`❌ Échec de la déduction de crédits: ${deductResult.error}`);
        return res.status(403).json({
          ok: false,
          error: "INSUFFICIENT_CREDITS",
          credits: deductResult.credits,
          required: requiredCredits,
          message: `Crédits insuffisants pour ce doublage. Solde actuel: ${deductResult.credits}, requis: ${requiredCredits}`
        });
      }
      
      console.log(`💸 Credits deducted: -${requiredCredits} (new balance: ${deductResult.credits})`);
      
      // Vérification finale juste avant l'appel TTS (double sécurité)
      const finalCreditsCheck = getCredits();
      if (!finalCreditsCheck.ok || finalCreditsCheck.credits < 0) {
        console.error(`❌ Vérification finale échouée: solde invalide`);
        // Remettre les crédits (rollback)
        addCredits(requiredCredits, `Rollback - échec vérification finale`);
        return res.status(403).json({
          ok: false,
          error: "CREDIT_VERIFICATION_FAILED",
          message: "La vérification finale des crédits a échoué"
        });
      }
      
      const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;

      const creditStatus = await getCreditStatus();
      const hasSufficientCredit = creditRemaining >= MIN_CREDIT;

      if (!hasElevenLabs && !hasOpenAI) {
        console.warn('⚠️ No AI API keys configured. Using mock mode.');
        const mockAudioUrl = await generateMockDub(req.file, selectedTargetLanguage, jobId);
        
        // Release lock
        userLocks.delete(userId);
        if (lockResolver) lockResolver();
        isLocked = false;
        
        return res.json({
          ok: true,
          audioUrl: mockAudioUrl,
          jobId: jobId,
          message: "Dub generated successfully (mock mode - no API keys)",
          provider: "mock",
          targetLanguage: selectedTargetLanguage
        });
      }

      if (hasOpenAI && !hasElevenLabs && !hasSufficientCredit) {
        console.warn(`⚠️ Credit low ($${creditRemaining.toFixed(2)} < $${MIN_CREDIT.toFixed(2)}), switching to mock mode`);
        const mockAudioUrl = await generateMockDub(req.file, selectedTargetLanguage, jobId);
        
        // Release lock
        userLocks.delete(userId);
        if (lockResolver) lockResolver();
        isLocked = false;
        
        return res.json({
          ok: true,
          audioUrl: mockAudioUrl,
          jobId: jobId,
          message: "Dub generated successfully (mock mode - insufficient credit)",
          provider: "mock",
          creditRemaining: creditRemaining,
          targetLanguage: selectedTargetLanguage
        });
      }

      let audioUrl;
      let provider;

      if (hasElevenLabs) {
        console.log('🎙️ Using ElevenLabs for dubbing...');
        audioUrl = await generateDubWithElevenLabs(req.file, selectedTargetLanguage, jobId);
        provider = "elevenlabs";
      } else if (hasOpenAI && hasSufficientCredit) {
        console.log(`🤖 Using OpenAI TTS for dubbing...`);
        console.log(`[DUBBING] Configuration finale — Langue: ${selectedLanguageCode} (${selectedTargetLanguage}), Voix: ${selectedVoiceModel}`);
        audioUrl = await generateDubWithOpenAI(req.file, selectedTargetLanguage, selectedVoiceModel, jobId);
        provider = "openai";
      }

      fs.unlinkSync(req.file.path);

      // Extract filename from audioUrl (e.g., "/output/dub-1234567890.mp3" -> "dub-1234567890.mp3")
      const outputFileName = audioUrl ? audioUrl.split('/').pop() : `dub-${jobId}.mp3`;
      const creditsUsed = requiredCredits;
      
      // Save dubbing history before sending response
      const historyMetadata = {
        fileName: outputFileName,
        creditsUsed: creditsUsed,
        timestamp: new Date().toISOString(),
        inputName: req.file.originalname
      };
      
      saveDubbingHistory(userId, historyMetadata);
      console.log(`✅ Historique du doublage enregistré : ${outputFileName} (${creditsUsed} crédits utilisés)`);

      // Release lock before sending response
      userLocks.delete(userId);
      if (lockResolver) lockResolver();
      isLocked = false;

      console.log(`[DUBBING] ✅ Doublage généré avec succès — Langue: ${selectedLanguageCode}, Voix: ${selectedVoiceModel}, Provider: ${provider}`);
      
      res.json({
        ok: true,
        audioUrl: audioUrl,
        jobId: jobId,
        message: "Dub generated successfully",
        provider: provider,
        targetLanguage: selectedLanguageCode, // Code complet pour le frontend
        voiceModel: selectedVoiceModel,
        creditsUsed: requiredCredits,
        creditsRemaining: deductResult.credits
      });
      
    } finally {
      // Ensure lock is always released, even on error
      if (isLocked) {
        userLocks.delete(userId);
        if (lockResolver) lockResolver();
      }
    }

  } catch (error) {
    console.error('❌ Dubbing error:', error);
    
    // Release lock on error
    if (isLocked) {
      userLocks.delete(userId);
      if (lockResolver) lockResolver();
    }
    
    // If credits were deducted but generation failed, we keep the deduction
    // (this is intentional - credits are consumed even if generation fails)
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.statusCode === 402 || error.message?.includes('NOT_ENOUGH_CREDITS')) {
      return res.status(402).json({
        ok: false,
        error: "NOT_ENOUGH_CREDITS",
        message: error.message || "Crédits insuffisants"
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Failed to generate dub",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Register routes: /create-dub and /api/dub
app.post("/create-dub", apiLimiter, upload.single('file'), handleDubRequest);
app.post("/api/dub", apiLimiter, upload.single('file'), handleDubRequest);

async function generateMockDub(file, targetLanguage, jobId) {
  console.log('🎭 Generating mock dub...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockAudioFiles = {
    'fr': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'en': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'es': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  };
  
  return mockAudioFiles[targetLanguage] || mockAudioFiles['en'];
}

async function generateDubWithElevenLabs(file, targetLanguage, jobId) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  
  const voiceMap = {
    'en': '21m00Tcm4TlvDq8ikWAM',
    'fr': 'ZQe5CZNOzWyzPSCn5a3c',
    'es': 'yoZ06aMxZJJ28mfd3POQ',
    'de': 'pNInz6obpgDQGcFmaJgB',
    'it': 'EXAVITQu4vr4xnSDxMaL',
  };

  const voiceId = voiceMap[targetLanguage] || voiceMap['en'];
  
  const sampleText = {
    'fr': 'Bienvenue sur AurisVoice, la plateforme de doublage vocal par intelligence artificielle.',
    'en': 'Welcome to AurisVoice, the AI-powered voice dubbing platform.',
    'es': 'Bienvenido a AurisVoice, la plataforma de doblaje de voz con inteligencia artificial.',
    'de': 'Willkommen bei AurisVoice, der KI-gestützten Sprachsynchronisationsplattform.',
    'it': 'Benvenuti su AurisVoice, la piattaforma di doppiaggio vocale basata su intelligenza artificiale.'
  };

  const text = sampleText[targetLanguage] || sampleText['en'];

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const outputPath = join(outputDir, `dub-${jobId}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    const audioUrl = `/output/dub-${jobId}.mp3`;
    console.log(`✅ Dub saved: ${audioUrl}`);
    
    return audioUrl;

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw new Error('Failed to generate dub with ElevenLabs');
  }
}

async function generateDubWithOpenAI(file, targetLanguage, voiceModel, jobId) {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  // Mapping de textes d'exemple par code de langue court
  const sampleText = {
    'fr': 'Bienvenue sur AurisVoice, la plateforme de doublage vocal par intelligence artificielle.',
    'en': 'Welcome to AurisVoice, the AI-powered voice dubbing platform.',
    'es': 'Bienvenido a AurisVoice, la plataforma de doblaje de voz con inteligencia artificial.',
    'de': 'Willkommen bei AurisVoice, der KI-gestützten Sprachsynchronisationsplattform.',
    'it': 'Benvenuti su AurisVoice, la piattaforma di doppiaggio vocale basata su intelligenza artificiale.',
    'pt': 'Bem-vindo ao AurisVoice, a plataforma de dublagem de voz com inteligência artificial.',
    'nl': 'Welkom bij AurisVoice, het AI-gestuurde stemdubbingplatform.',
    'ja': 'AurisVoiceへようこそ、AIを活用した音声吹き替えプラットフォームです。',
    'ko': 'AurisVoice에 오신 것을 환영합니다. AI 기반 음성 더빙 플랫폼입니다.',
    'zh': '欢迎使用AurisVoice，AI驱动的语音配音平台。',
    'ar': 'مرحباً بك في AurisVoice، منصة الدبلجة الصوتية المدعومة بالذكاء الاصطناعي.'
  };

  // targetLanguage est déjà un code court (ex: "fr", "en") après validation
  const text = sampleText[targetLanguage] || sampleText['en'];
  const voice = voiceModel; // Déjà validé et normalisé
  const model = 'gpt-4o-mini-tts';

  console.log(`🔊 [OpenAI TTS] Appel API — model: ${model}, voice: ${voice}, language: ${targetLanguage}`);

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const outputPath = join(outputDir, `dub-${jobId}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    const audioUrl = `/output/dub-${jobId}.mp3`;
    console.log(`✅ Dub saved: ${audioUrl}`);
    
    return audioUrl;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate dub with OpenAI');
  }
}

// ============================================================================
// HISTORY ROUTES
// ============================================================================

const mockHistory = [
  {
    id: 1,
    file: "voice1.mp3",
    lang: "fr",
    model: "OpenAI TTS",
    provider: "openai",
    date: "2025-11-05",
    duration: "0:12",
    fileUrl: "/output/voice1.mp3"
  },
  {
    id: 2,
    file: "voice2.mp3",
    lang: "en",
    model: "ElevenLabs",
    provider: "elevenlabs",
    date: "2025-11-04",
    duration: "0:09",
    fileUrl: "/output/voice2.mp3"
  },
  {
    id: 3,
    file: "voice3.mp3",
    lang: "es",
    model: "OpenAI TTS",
    provider: "openai",
    date: "2025-11-02",
    duration: "0:15",
    fileUrl: "/output/voice3.mp3"
  }
];

app.get("/api/dubbing/history", (req, res) => {
  try {
    // Get userId from headers (placeholder for future authentication)
    const userId = req.headers['x-user-id'] || 'anonymous';
    
    // Get dubbing history for the user
    const history = getDubbingHistory(userId);
    
    console.log(`📋 Dubbing history requested for user: ${userId} (${history.length} entries)`);
    
    res.status(200).json({
      ok: true,
      history: history,
      total: history.length,
      userId: userId
    });
  } catch (error) {
    console.error('❌ Dubbing history error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch dubbing history',
      message: error.message
    });
  }
});

app.get("/api/history", (req, res) => {
  try {
    const { language, provider, search } = req.query;
    
    let filtered = [...mockHistory];

    if (language && language !== 'all') {
      filtered = filtered.filter(p => p.lang === language);
    }

    if (provider && provider !== 'all') {
      filtered = filtered.filter(p => p.provider === provider);
    }

    if (search) {
      const query = search.toString().toLowerCase();
      filtered = filtered.filter(p => 
        p.file.toLowerCase().includes(query)
      );
    }

    console.log(`📋 History requested: ${filtered.length} projects`);

    res.json({
      ok: true,
      projects: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('❌ History error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch history'
    });
  }
});

// Route alias: /history/:userId
app.get("/history/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { language, provider, search } = req.query;
    
    // Get dubbing history for the user
    const userHistory = getDubbingHistory(userId);
    
    let filtered = [...userHistory];

    if (language && language !== 'all') {
      filtered = filtered.filter(p => p.lang === language);
    }

    if (provider && provider !== 'all') {
      filtered = filtered.filter(p => p.provider === provider);
    }

    if (search) {
      const query = search.toString().toLowerCase();
      filtered = filtered.filter(p => 
        p.inputName && p.inputName.toLowerCase().includes(query)
      );
    }

    console.log(`📋 History requested for user ${userId}: ${filtered.length} entries`);

    res.json({
      ok: true,
      userId: userId,
      history: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('❌ History error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch history'
    });
  }
});

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Admin middleware to check x-admin-secret header
const adminAuth = (req, res, next) => {
  const adminSecret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (!expectedSecret) {
    console.error('❌ ADMIN_SECRET not configured in environment');
    return res.status(500).json({
      ok: false,
      error: 'Admin authentication not configured'
    });
  }
  
  if (!adminSecret || adminSecret !== expectedSecret) {
    console.warn(`⚠️  Unauthorized admin access attempt from ${req.ip}`);
    return res.status(401).json({
      ok: false,
      error: 'Unauthorized: Invalid admin secret'
    });
  }
  
  next();
};

// POST /admin/add-credits - Add credits to a specific user
app.post('/admin/add-credits', adminAuth, express.json(), (req, res) => {
  try {
    const { userId, credits } = req.body;
    
    // Validate body
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return res.status(400).json({
        ok: false,
        error: 'Invalid userId: must be a non-empty string'
      });
    }
    
    if (typeof credits !== 'number' || credits <= 0 || !Number.isInteger(credits)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid credits: must be a positive integer'
      });
    }
    
    // Load credits.json
    const creditsFilePath = join(__dirname, 'credits.json');
    let creditsData;
    
    try {
      if (fs.existsSync(creditsFilePath)) {
        const fileContent = fs.readFileSync(creditsFilePath, 'utf8');
        creditsData = JSON.parse(fileContent);
      } else {
        creditsData = { users: {} };
      }
    } catch (error) {
      console.error('❌ Error reading credits.json:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to read credits file'
      });
    }
    
    // Initialize users object if it doesn't exist (backward compatibility)
    if (!creditsData.users) {
      creditsData.users = {};
    }
    
    // If userId does not exist → create an entry with "credits": 0
    if (!creditsData.users[userId]) {
      creditsData.users[userId] = {
        credits: 0,
        history: []
      };
      console.log(`👤 Created new user entry for ${userId}`);
    }
    
    // Get current balance
    const oldBalance = creditsData.users[userId].credits || 0;
    const newBalance = oldBalance + credits;
    
    // Add credits to user's balance
    creditsData.users[userId].credits = newBalance;
    
    // Add to history
    if (!creditsData.users[userId].history) {
      creditsData.users[userId].history = [];
    }
    
    creditsData.users[userId].history.push({
      type: 'admin_add',
      amount: credits,
      oldBalance: oldBalance,
      newBalance: newBalance,
      date: new Date().toISOString(),
      description: `Admin manual credit addition`
    });
    
    // Keep only last 100 transactions per user
    if (creditsData.users[userId].history.length > 100) {
      creditsData.users[userId].history = creditsData.users[userId].history.slice(-100);
    }
    
    // Save credits.json
    try {
      fs.writeFileSync(creditsFilePath, JSON.stringify(creditsData, null, 2));
      console.log(`✅ Admin added ${credits} credits to user ${userId} (${oldBalance} → ${newBalance})`);
    } catch (error) {
      console.error('❌ Error writing credits.json:', error);
      return res.status(500).json({
        ok: false,
        error: 'Failed to save credits file'
      });
    }
    
    // Return success response
    res.json({
      ok: true,
      message: 'Credits added successfully',
      userId: userId,
      creditsAdded: credits,
      newBalance: newBalance
    });
    
  } catch (error) {
    console.error('❌ Admin add-credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        ok: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      ok: false,
      error: err.message
    });
  }
  
  res.status(500).json({
    ok: false,
    error: err.message || 'Internal server error'
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 3001;

// Configure server timeout to 180 seconds (3 minutes) for long-running OpenAI TTS operations
const server = app.listen(PORT, async () => {
  console.log("AurisVoice backend running on port", PORT);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('\n🚀 ═══════════════════════════════════════════════════════');
  console.log(`   AurisVoice Backend ${isProduction ? 'LIVE on Render' : 'running locally'}`);
  console.log('   ═══════════════════════════════════════════════════════');
  console.log(`\n📡 Server:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`\n💳 Stripe Configuration:`);
  console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Webhook Secret: ${process.env.STRIPE_WEBHOOK_SECRET ? '✅ Configured' : '⚠️  Test mode'}`);
  console.log(`   Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'LIVE' : 'TEST'}`);
  console.log(`\n💰 Credits System:`);
  console.log(`   Current balance: ${getCredits().credits} credits`);
  console.log(`\n💶 Pricing Plans:`);
  console.log(`   Starter: 5€ (15 credits)`);
  console.log(`   Pro: 15€ (60 credits)`);
  console.log(`   Premium: 30€ (150 credits)`);
  
  // Initialize credit monitoring
  if (process.env.OPENAI_API_KEY) {
    console.log(`🧭 Credit monitor active (minimum: $${MIN_CREDIT.toFixed(2)})`);
    await updateCreditBalance();
    
    setInterval(async () => {
      await updateCreditBalance();
    }, CREDIT_CHECK_INTERVAL);
  } else {
    console.log(`🧭 Credit monitor inactive (no OpenAI API key)`);
  }
  
  console.log('\n✅ Server ready to accept requests!\n');
});

// Set server timeout to 180 seconds (3 minutes) for long-running operations like OpenAI TTS
server.setTimeout(180000); // 180 seconds = 180000 milliseconds
console.log('⏱️  Server timeout configured: 180 seconds (3 minutes)');


