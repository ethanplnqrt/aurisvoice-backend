// AurisVoice Backend - Stripe Payment & Credits Management
// Handles Stripe Checkout, Webhooks, and Credit System

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { getCredits, addCredits, deductCredits, hasEnoughCredits } from '../credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Setup logs directory
const logsDir = join(__dirname, '..', 'logs');
const logFile = join(logsDir, 'stripe-webhook.log');
const securityLogFile = join(logsDir, 'stripe-security.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to write webhook logs
function writeLog(eventType, sessionId, amount, credits, metadata) {
  const timestamp = new Date().toISOString();
  const amountStr = amount ? `€${amount}` : 'N/A';
  const creditsStr = credits ? `+${credits} credits` : 'N/A';
  const sessionStr = sessionId || 'N/A';
  const metadataStr = metadata ? JSON.stringify(metadata) : '{}';
  
  const logLine = `[${timestamp}] ${eventType} | ${sessionStr} | ${amountStr} | ${creditsStr} | ${metadataStr}\n`;
  
  // Write to file (append mode)
  try {
    fs.appendFileSync(logFile, logLine, 'utf8');
  } catch (error) {
    console.error('❌ Failed to write to log file:', error);
  }
  
  // Print to console in DEV mode only
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📝 [WEBHOOK LOG] ${logLine.trim()}`);
  }
}

// Initialize Stripe with secret key (PHASE 4.0 - TEST MODE)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "51SOw9eJlyCE49zWsV3mo2lO0hjAHh1GuTpHJ90GZOWfdzRaDYr0O5C0zrZTlAkVtNnv1tbL0GNDQ0Y6mD4CogpB300QHdFK4DT";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('💳 Using hardcoded TEST Stripe keys (PHASE 4.0)');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Webhook event log (in-memory storage)
const webhookLog = [];
const MAX_LOG_ENTRIES = 10;

// Processed events Set to prevent double crediting
const processedEvents = new Set();
const MAX_PROCESSED_EVENTS = 200;

// Rate limiting for webhook endpoint
const webhookRateLimit = {
  requests: new Map(), // IP -> { count, resetTime }
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

// Helper function to write security logs
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

// Helper function to check rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const record = webhookRateLimit.requests.get(ip);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
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

// Helper function to log webhook events
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
  
  // Keep only last 10 entries
  if (webhookLog.length > MAX_LOG_ENTRIES) {
    webhookLog.pop();
  }
  
  return logEntry;
}

// Stripe Pricing Plans (EUR)
const PRICING_PLANS = {
  starter: {
    priceInCents: 500, // 5€
    credits: 15,
    name: 'Starter Pack',
    description: '15 crédits de doublage IA'
  },
  pro: {
    priceInCents: 1500, // 15€
    credits: 60,
    name: 'Pro Pack',
    description: '60 crédits de doublage IA'
  },
  premium: {
    priceInCents: 3000, // 30€
    credits: 150,
    name: 'Premium Pack',
    description: '150 crédits de doublage IA'
  }
};

/**
 * GET /api/credits
 * Returns current credit balance
 */
app.get('/api/credits', (req, res) => {
  try {
    const result = getCredits();
    
    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        error: 'Failed to retrieve credits'
      });
    }
    
    // Ensure credits is a number and history is an array
    const credits = typeof result.credits === 'number' ? result.credits : 0;
    const history = Array.isArray(result.history) ? result.history : [];
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💰 Credits retrieved: ${credits}`);
    }
    
    // Return JSON response with correct format
    res.json({
      ok: true,
      credits: credits,
      history: history.slice(-10) // Last 10 transactions
    });
  } catch (error) {
    console.error('❌ Credits error:', error);
    res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session
 */
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
    
    // Create Stripe Checkout Session
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
              images: ['https://aurisvoice.vercel.app/logo.png'], // Optional: Add your logo
            },
            unit_amount: planDetails.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
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

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events (payment success)
 * 
 * SECURITY FEATURES:
 * - Signature verification using raw body
 * - Anti-replay protection (event.id tracking)
 * - Event type filtering (only checkout.session.completed)
 * - Rate limiting (10 requests/minute per IP)
 * - Security logging (stripe-security.log)
 * 
 * This endpoint must use raw body for signature verification
 */
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET_TEST || STRIPE_WEBHOOK_SECRET;
    
    // Rate limiting check
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
    
    // Verify webhook signature
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
      // Verify webhook signature using raw body (Buffer)
      // IMPORTANT: req.body is a Buffer when using express.raw()
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      signatureValid = true;
    } catch (err) {
      // Invalid signature - log and reject
      writeSecurityLog({
        ip: clientIp,
        signatureValid: false,
        reason: 'INVALID_SIGNATURE',
        eventType: null,
        eventId: null
      });
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      console.error(`   IP: ${clientIp}`);
      return res.status(400).json({
        ok: false,
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      });
    }
    
    // Log successful signature verification
    writeSecurityLog({
      ip: clientIp,
      eventId: event.id,
      eventType: event.type,
      signatureValid: true,
      replay: false,
      rateLimited: false
    });
    
    // ANTI-REPLAY: Check for duplicate event
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
      // Return 200 to keep Stripe happy, but don't process
      return res.json({ 
        ok: true, 
        received: true,
        duplicate: true,
        message: 'Event already processed'
      });
    }
    
    // FILTER: Only allow checkout.session.completed
    if (event.type !== 'checkout.session.completed') {
      writeSecurityLog({
        ip: clientIp,
        eventId: event.id,
        eventType: event.type,
        signatureValid: true,
        replay: false,
        reason: 'IGNORED_EVENT_TYPE'
      });
      console.log(`🔔 Ignored event type: ${event.type} (only checkout.session.completed is processed)`);
      // Return 200 to keep Stripe happy, but don't process
      return res.json({ 
        ok: true, 
        received: true,
        ignored: true,
        message: `Event type ${event.type} is not processed`
      });
    }
    
    // Add event ID to processed set (after validation)
    if (event.id) {
      processedEvents.add(event.id);
      // Keep only last 200 event IDs
      if (processedEvents.size > MAX_PROCESSED_EVENTS) {
        const firstEvent = processedEvents.values().next().value;
        processedEvents.delete(firstEvent);
      }
    }
    
    // Handle checkout.session.completed event
    try {
      const session = event.data.object;
      
      console.log(`💰 Payment successful: ${session.id}`);
      console.log(`   Amount: €${session.amount_total / 100}`);
      console.log(`   Plan: ${session.metadata?.plan}`);
      
      // Add credits to user account
      const credits = parseInt(session.metadata?.credits || '0');
      const plan = session.metadata?.plan || 'unknown';
      const amount = session.amount_total / 100;
      
      // Log webhook event
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
          
          // Log the event (in-memory)
          logWebhookEvent(
            'checkout.session.completed',
            amount,
            credits,
            'stripe'
          );
          
          // Update security log with success
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
      
      // Return a response to acknowledge receipt of the event
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

/**
 * GET /api/plans
 * Returns available pricing plans
 */
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

/**
 * POST /api/test-webhook
 * Test endpoint to simulate Stripe webhook events
 * Only works in development/test mode
 */
app.post('/api/test-webhook', express.json(), async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isTestRequest = req.body.test === true;
    
    // Security: Block test webhooks in production
    if (isProduction && isTestRequest) {
      console.warn('⚠️  Test webhook blocked in production mode');
      return res.status(403).json({
        ok: false,
        error: 'Test webhooks are disabled in production',
        message: 'Use real Stripe webhooks in production mode'
      });
    }
    
    console.log('\n🧪 ═══════════════════════════════════════════════════════');
    console.log('   WEBHOOK TEST RECEIVED');
    console.log('   ═══════════════════════════════════════════════════════');
    
    // Simulate checkout.session.completed event
    const testEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          amount_total: req.body.amount_total || 500, // 5€ default
          customer_email: req.body.customer_email || 'test@aurisvoice.com',
          metadata: {
            plan: req.body.plan || 'starter',
            credits: req.body.credits || '15'
          }
        }
      }
    };
    
    const session = testEvent.data.object;
    const credits = parseInt(session.metadata.credits);
    const plan = session.metadata.plan;
    const amount = session.amount_total / 100;
    
    console.log(`\n💳 Simulated Payment:`);
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Amount: €${amount}`);
    console.log(`   Plan: ${plan}`);
    console.log(`   Credits: ${credits}`);
    console.log(`   Email: ${session.customer_email}`);
    
    // Log test webhook event
    writeLog(
      'checkout.session.completed',
      session.id,
      amount,
      credits,
      session.metadata
    );
    
    // Add credits using the same logic as real webhook
    if (credits > 0) {
      const result = addCredits(credits, `Test achat ${plan} (€${amount})`);
      
      if (result.ok) {
        console.log(`\n✅ Crédits ajoutés avec succès: +${credits}`);
        console.log(`   Nouveau solde: ${result.credits} crédits`);
        
        // Log the event (in-memory)
        logWebhookEvent(
          'checkout.session.completed',
          amount,
          credits,
          'test'
        );
        
        console.log('\n🎉 Test webhook traité avec succès!\n');
        
        return res.json({
          ok: true,
          message: 'Test webhook processed successfully',
          event: testEvent.type,
          credits_added: credits,
          new_balance: result.credits,
          amount: amount,
          test: true
        });
      } else {
        console.error(`\n❌ Échec ajout crédits: ${result.error}\n`);
        
        return res.status(500).json({
          ok: false,
          error: 'Failed to add credits',
          details: result.error
        });
      }
    } else {
      console.warn('\n⚠️  Aucun crédit à ajouter\n');
      
      return res.status(400).json({
        ok: false,
        error: 'Invalid credits amount',
        message: 'Credits must be greater than 0'
      });
    }
  } catch (error) {
    console.error('\n❌ Test webhook error:', error, '\n');
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * GET /api/webhook-log
 * Returns the last 10 webhook events (in-memory log)
 */
app.get('/api/webhook-log', (req, res) => {
  try {
    console.log(`📋 Webhook log requested (${webhookLog.length} entries)`);
    
    res.json({
      ok: true,
      count: webhookLog.length,
      events: webhookLog,
      info: {
        max_entries: MAX_LOG_ENTRIES,
        storage: 'in-memory',
        resets_on_restart: true
      }
    });
  } catch (error) {
    console.error('❌ Webhook log error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * GET /api/debug/stripe
 * Debug endpoint for Stripe configuration and webhook events
 * Only available in development mode
 */
app.get('/api/debug/stripe', (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        ok: false,
        error: 'Debug endpoint is only available in development mode'
      });
    }
    
    // Read last 10 lines from stripe-webhook.log
    let lastWebhookEvents = [];
    try {
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8');
        const lines = logContent.trim().split('\n').filter(line => line.trim());
        lastWebhookEvents = lines.slice(-10);
      }
    } catch (error) {
      console.error('❌ Error reading webhook log file:', error);
    }
    
    // Get current credits balance
    const creditsResult = getCredits();
    const credits = creditsResult.ok ? creditsResult.credits : 0;
    
    // Count processed events
    const processedEventCount = processedEvents.size;
    
    // Check Stripe configuration
    const hasSecretKey = !!STRIPE_SECRET_KEY && STRIPE_SECRET_KEY !== 'dummy';
    const hasWebhookSecret = !!STRIPE_WEBHOOK_SECRET;
    const mode = STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test';
    
    res.json({
      ok: true,
      stripe: {
        hasSecretKey: hasSecretKey,
        hasWebhookSecret: hasWebhookSecret,
        mode: mode
      },
      lastWebhookEvents: lastWebhookEvents,
      credits: credits,
      processedEventCount: processedEventCount
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * Health check
 */
app.get('/status', (req, res) => {
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
  const webhookConfigured = !!process.env.STRIPE_WEBHOOK_SECRET;
  
  res.json({ 
    ok: true, 
    message: "AurisVoice Payment API running 🚀",
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
      test_webhook: 'POST /api/test-webhook',
      webhook_log: 'GET /api/webhook-log'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
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
  
  if (!isProduction) {
    console.log(`\n🧪 Testing Endpoints:`);
    console.log(`   POST /api/test-webhook - Simulate Stripe webhook`);
    console.log(`   GET /api/webhook-log - View webhook history`);
  }
  
  console.log('\n✅ Server ready to accept requests!\n');
});
