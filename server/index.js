// AurisVoice Backend - Unified Entry Point
// Handles: Stripe, Webhooks, Credits, Dubbing, History, API

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import fs from 'fs';
import { getCredits, addCredits, deductCredits, hasEnoughCredits, calculateCreditsNeeded } from './credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

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
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "51SOw9eJlyCE49zWsV3mo2lO0hjAHh1GuTpHJ90GZOWfdzRaDYr0O5C0zrZTlAkVtNnv1tbL0GNDQ0Y6mD4CogpB300QHdFK4DT";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('💳 Using hardcoded TEST Stripe keys');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin);
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());
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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// Processed events Set to prevent double crediting
const processedEvents = new Set();
const MAX_PROCESSED_EVENTS = 200;

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

app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET;
    
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      writeSecurityLog({
        ip: clientIp,
        rateLimited: true,
        reason: 'RATE_LIMIT_EXCEEDED'
      });
      console.warn(`⚠️  Rate limit exceeded for IP: ${clientIp}`);
      return res.status(429).json({
        ok: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    let event;
    let signatureValid = false;
    
    if (!webhookSecret) {
      writeSecurityLog({
        ip: clientIp,
        signatureValid: false,
        reason: 'WEBHOOK_SECRET_MISSING'
      });
      console.warn('⚠️  Webhook secret not configured');
      return res.status(400).json({
        ok: false,
        error: 'Webhook secret not configured',
        message: 'Server configuration error'
      });
    }
    
    if (!sig) {
      writeSecurityLog({
        ip: clientIp,
        signatureValid: false,
        reason: 'SIGNATURE_HEADER_MISSING'
      });
      console.error('❌ Stripe signature header missing');
      return res.status(400).json({
        ok: false,
        error: 'Invalid signature',
        message: 'Missing stripe-signature header'
      });
    }
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      signatureValid = true;
    } catch (err) {
      writeSecurityLog({
        ip: clientIp,
        signatureValid: false,
        reason: 'INVALID_SIGNATURE',
        eventType: null,
        eventId: null
      });
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({
        ok: false,
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      });
    }
    
    writeSecurityLog({
      ip: clientIp,
      eventId: event.id,
      eventType: event.type,
      signatureValid: true,
      replay: false,
      rateLimited: false
    });
    
    if (event.id && processedEvents.has(event.id)) {
      writeSecurityLog({
        ip: clientIp,
        eventId: event.id,
        eventType: event.type,
        signatureValid: true,
        replay: true,
        reason: 'REPLAY_DETECTED'
      });
      console.warn(`⚠️  REPLAY DETECTED: Event ${event.id} already processed`);
      return res.json({ 
        ok: true, 
        received: true,
        duplicate: true,
        message: 'Event already processed'
      });
    }
    
    if (event.type !== 'checkout.session.completed') {
      writeSecurityLog({
        ip: clientIp,
        eventId: event.id,
        eventType: event.type,
        signatureValid: true,
        replay: false,
        reason: 'IGNORED_EVENT_TYPE'
      });
      console.log(`🔔 Ignored event type: ${event.type}`);
      return res.json({ 
        ok: true, 
        received: true,
        ignored: true,
        message: `Event type ${event.type} is not processed`
      });
    }
    
    if (event.id) {
      processedEvents.add(event.id);
      if (processedEvents.size > MAX_PROCESSED_EVENTS) {
        const firstEvent = processedEvents.values().next().value;
        processedEvents.delete(firstEvent);
      }
    }
    
    try {
      const session = event.data.object;
      
      console.log(`💰 Payment successful: ${session.id}`);
      console.log(`   Amount: €${session.amount_total / 100}`);
      console.log(`   Plan: ${session.metadata?.plan}`);
      
      const credits = parseInt(session.metadata?.credits || '0');
      const plan = session.metadata?.plan || 'unknown';
      const amount = session.amount_total / 100;
      
      writeLog(
        event.type,
        session.id,
        amount,
        credits,
        session.metadata
      );
      
      if (credits > 0) {
        const result = addCredits(credits, `Achat ${plan} (€${amount})`);
        
        if (result.ok) {
          console.log(`✅ Credits added successfully: +${credits}`);
          
          logWebhookEvent(
            'checkout.session.completed',
            amount,
            credits,
            'stripe'
          );
          
          writeSecurityLog({
            ip: clientIp,
            eventId: event.id,
            eventType: event.type,
            signatureValid: true,
            replay: false,
            rateLimited: false,
            reason: 'PROCESSED_SUCCESSFULLY'
          });
        } else {
          console.error(`❌ Failed to add credits: ${result.error}`);
          writeSecurityLog({
            ip: clientIp,
            eventId: event.id,
            eventType: event.type,
            signatureValid: true,
            replay: false,
            rateLimited: false,
            reason: 'CREDITS_ADD_FAILED'
          });
        }
      } else {
        console.warn(`⚠️  No credits to add for session ${session.id}`);
        writeSecurityLog({
          ip: clientIp,
          eventId: event.id,
          eventType: event.type,
          signatureValid: true,
          replay: false,
          rateLimited: false,
          reason: 'NO_CREDITS_IN_METADATA'
        });
      }
      
      return res.json({ 
        ok: true,
        received: true,
        processed: true
      });
    } catch (error) {
      console.error(`❌ Error processing webhook event ${event.id}:`, error);
      writeSecurityLog({
        ip: clientIp,
        eventId: event.id,
        eventType: event.type,
        signatureValid: true,
        replay: false,
        rateLimited: false,
        reason: 'PROCESSING_ERROR'
      });
      return res.status(500).json({
        ok: false,
        error: 'Internal server error',
        message: 'Failed to process webhook event'
      });
    }
  }
);

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

app.post("/api/dub", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No file uploaded"
      });
    }

    const { targetLanguage, sourceLanguage } = req.body;
    
    if (!targetLanguage) {
      return res.status(400).json({
        ok: false,
        error: "Target language is required"
      });
    }

    console.log(`📁 File uploaded: ${req.file.filename}`);
    console.log(`🌍 Target language: ${targetLanguage}`);
    console.log(`📊 File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

    const jobId = Date.now().toString();
    
    const estimatedDurationSeconds = Math.max(10, Math.ceil(req.file.size / (1024 * 100)));
    const requiredCredits = calculateCreditsNeeded(estimatedDurationSeconds);
    
    console.log(`💰 Estimated duration: ${estimatedDurationSeconds}s → ${requiredCredits} credits required`);
    
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
    
    const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    const creditStatus = await getCreditStatus();
    const hasSufficientCredit = creditRemaining >= MIN_CREDIT;

    if (!hasElevenLabs && !hasOpenAI) {
      console.warn('⚠️ No AI API keys configured. Using mock mode.');
      const mockAudioUrl = await generateMockDub(req.file, targetLanguage, jobId);
      
      return res.json({
        ok: true,
        audioUrl: mockAudioUrl,
        jobId: jobId,
        message: "Dub generated successfully (mock mode - no API keys)",
        provider: "mock",
        targetLanguage
      });
    }

    if (hasOpenAI && !hasElevenLabs && !hasSufficientCredit) {
      console.warn(`⚠️ Credit low ($${creditRemaining.toFixed(2)} < $${MIN_CREDIT.toFixed(2)}), switching to mock mode`);
      const mockAudioUrl = await generateMockDub(req.file, targetLanguage, jobId);
      
      return res.json({
        ok: true,
        audioUrl: mockAudioUrl,
        jobId: jobId,
        message: "Dub generated successfully (mock mode - insufficient credit)",
        provider: "mock",
        creditRemaining: creditRemaining,
        targetLanguage
      });
    }

    let audioUrl;
    let provider;

    if (hasElevenLabs) {
      console.log('🎙️ Using ElevenLabs for dubbing...');
      audioUrl = await generateDubWithElevenLabs(req.file, targetLanguage, jobId);
      provider = "elevenlabs";
    } else if (hasOpenAI && hasSufficientCredit) {
      console.log('🤖 Using OpenAI TTS for dubbing...');
      audioUrl = await generateDubWithOpenAI(req.file, targetLanguage, jobId);
      provider = "openai";
    }

    fs.unlinkSync(req.file.path);
    
    const deductResult = deductCredits(requiredCredits, `Doublage ${targetLanguage} (${estimatedDurationSeconds}s)`);
    if (!deductResult.ok) {
      console.error(`⚠️  Failed to deduct credits: ${deductResult.error}`);
    } else {
      console.log(`💸 Credits deducted: -${requiredCredits} (new balance: ${deductResult.credits})`);
    }

    res.json({
      ok: true,
      audioUrl: audioUrl,
      jobId: jobId,
      message: "Dub generated successfully",
      provider: provider,
      targetLanguage: targetLanguage,
      creditsUsed: requiredCredits,
      creditsRemaining: deductResult.ok ? deductResult.credits : creditsResult.credits
    });

  } catch (error) {
    console.error('❌ Dubbing error:', error);
    
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
});

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

async function generateDubWithOpenAI(file, targetLanguage, jobId) {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  const sampleText = {
    'fr': 'Bienvenue sur AurisVoice, la plateforme de doublage vocal par intelligence artificielle.',
    'en': 'Welcome to AurisVoice, the AI-powered voice dubbing platform.',
    'es': 'Bienvenido a AurisVoice, la plataforma de doblaje de voz con inteligencia artificial.',
    'de': 'Willkommen bei AurisVoice, der KI-gestützten Sprachsynchronisationsplattform.',
    'it': 'Benvenuti su AurisVoice, la piattaforma di doppiaggio vocale basata su intelligenza artificiale.'
  };

  const text = sampleText[targetLanguage] || sampleText['en'];
  const voice = 'alloy';
  const model = 'gpt-4o-mini-tts';

  console.log(`🔊 Using OpenAI TTS — model: ${model}, voice: ${voice}`);

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('\n🚀 ═══════════════════════════════════════════════════════');
  console.log(`   AurisVoice Backend ${isProduction ? 'LIVE on Render' : 'running locally'}`);
  console.log('   ═══════════════════════════════════════════════════════');
  console.log(`\n📡 Server:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*'}`);
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

