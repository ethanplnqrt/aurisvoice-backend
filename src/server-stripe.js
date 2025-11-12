// AurisVoice Backend - Stripe Payment & Credits Management
// Handles Stripe Checkout, Webhooks, and Credit System

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getCredits, addCredits, deductCredits, hasEnoughCredits } from '../credits.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2024-11-20.acacia',
});

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));

// Webhook event log (in-memory storage)
const webhookLog = [];
const MAX_LOG_ENTRIES = 10;

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
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💰 Credits retrieved: ${result.credits}`);
    }
    
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

/**
 * POST /api/checkout
 * Creates a Stripe Checkout session
 */
app.post('/api/checkout', express.json(), async (req, res) => {
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/credits?canceled=true`,
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
 * This endpoint must use raw body for signature verification
 */
app.post('/api/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('⚠️  Webhook secret not configured - using test mode');
      // In test mode, manually process the event
      try {
        const event = JSON.parse(req.body);
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const credits = parseInt(session.metadata?.credits || '0');
          const plan = session.metadata?.plan || 'unknown';
          
          if (credits > 0) {
            const result = addCredits(credits, `Achat ${plan} (€${session.amount_total / 100})`);
            
            if (result.ok) {
              console.log(`✅ Credits added successfully: +${credits}`);
            } else {
              console.error(`❌ Failed to add credits: ${result.error}`);
            }
          }
        }
        
        return res.json({ received: true });
      } catch (err) {
        console.error('❌ Test webhook error:', err);
        return res.status(400).send(`Test Webhook Error: ${err.message}`);
      }
    }
    
    let event;
    
    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        console.log(`💰 Payment successful: ${session.id}`);
        console.log(`   Amount: €${session.amount_total / 100}`);
        console.log(`   Plan: ${session.metadata?.plan}`);
        
        // Add credits to user account
        const credits = parseInt(session.metadata?.credits || '0');
        const plan = session.metadata?.plan || 'unknown';
        
        if (credits > 0) {
          const result = addCredits(credits, `Achat ${plan} (€${session.amount_total / 100})`);
          
          if (result.ok) {
            console.log(`✅ Credits added successfully: +${credits}`);
            
            // Log the event
            logWebhookEvent(
              'checkout.session.completed',
              session.amount_total / 100,
              credits,
              'stripe'
            );
          } else {
            console.error(`❌ Failed to add credits: ${result.error}`);
          }
        }
        
        break;
        
      case 'payment_intent.succeeded':
        console.log('💳 Payment intent succeeded');
        break;
        
      case 'payment_intent.payment_failed':
        console.log('❌ Payment intent failed');
        break;
        
      default:
        console.log(`🔔 Unhandled event type: ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
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
    
    // Add credits using the same logic as real webhook
    if (credits > 0) {
      const result = addCredits(credits, `Test achat ${plan} (€${amount})`);
      
      if (result.ok) {
        console.log(`\n✅ Crédits ajoutés avec succès: +${credits}`);
        console.log(`   Nouveau solde: ${result.credits} crédits`);
        
        // Log the event
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
      checkout: 'POST /api/checkout',
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

const PORT = process.env.PORT || 10000;
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
