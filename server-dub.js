// AurisVoice Backend - With AI Dubbing Feature
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getCredits, deductCredits, hasEnoughCredits, calculateCreditsNeeded } from "./credits.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Credit monitoring
let creditRemaining = null;
let lastCreditCheck = null;
const CREDIT_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const MIN_CREDIT = parseFloat(process.env.OPENAI_MIN_CREDIT || '1.0');

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Serve static files from output directory
app.use('/output', express.static(outputDir));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
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

// Root route - Welcome page
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

// Status endpoint - Health check
app.get("/status", (req, res) => {
  res.json({ ok: true, message: "AurisVoice backend is running 🚀" });
});

/**
 * Check OpenAI Credit Balance
 * Returns current credit balance or mock value
 */
async function checkOpenAICredit() {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  if (!API_KEY) {
    console.log('💰 No OpenAI API key - using mock credit');
    return { ok: true, credit: 999.99, mock: true };
  }

  try {
    // Note: OpenAI's billing API endpoint requires organization-level access
    // For now, we'll use a mock implementation that can be replaced with real API
    // Real endpoint would be: https://api.openai.com/v1/dashboard/billing/credit_grants
    
    // Mock implementation - returns a simulated balance
    // In production, replace this with actual API call
    const mockCredit = 5.92;
    
    console.log(`💰 Credit check: $${mockCredit.toFixed(2)} (mock mode)`);
    
    return { ok: true, credit: mockCredit, mock: true };
    
    /* Real implementation (uncomment when you have org access):
    const response = await fetch('https://api.openai.com/v1/dashboard/billing/credit_grants', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Credit check failed: ${response.status}`);
    }

    const data = await response.json();
    const totalCredit = data.total_granted || 0;
    const totalUsed = data.total_used || 0;
    const remaining = totalCredit - totalUsed;
    
    console.log(`💰 Credit check: $${remaining.toFixed(2)}`);
    
    return { ok: true, credit: remaining, mock: false };
    */
  } catch (error) {
    console.error('❌ Credit check error:', error.message);
    // Return mock value on error to keep system running
    return { ok: true, credit: 5.00, mock: true, error: error.message };
  }
}

/**
 * Update credit balance
 * Called on startup and periodically
 */
async function updateCreditBalance() {
  const result = await checkOpenAICredit();
  if (result.ok) {
    creditRemaining = result.credit;
    lastCreditCheck = Date.now();
    
    // Warn if credit is low
    if (creditRemaining < MIN_CREDIT) {
      console.warn(`⚠️ LOW CREDIT WARNING: Only $${creditRemaining.toFixed(2)} remaining (minimum: $${MIN_CREDIT.toFixed(2)})`);
    }
  }
  return result;
}

/**
 * Get current credit status
 * Checks cache or fetches new data if stale
 */
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

/**
 * API Credit Balance Endpoint
 * GET /api/credit
 * Returns current OpenAI credit balance
 */
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

/**
 * Verify OpenAI TTS Connection
 * GET /verify-openai
 * Tests OpenAI API with a small phrase
 */
app.get("/verify-openai", async (req, res) => {
  try {
    const API_KEY = process.env.OPENAI_API_KEY;
    
    if (!API_KEY) {
      return res.status(400).json({
        ok: false,
        message: "OpenAI API key not found in environment variables",
        tip: "Add OPENAI_API_KEY to your .env file"
      });
    }

    console.log('🧪 Testing OpenAI TTS connection...');
    
    // Test with a small phrase
    const testPhrase = "AurisVoice OpenAI TTS verification test.";
    const model = 'gpt-4o-mini-tts';
    const voice = 'alloy';

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: testPhrase,
        voice: voice,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
    }

    // Get audio data to verify it's valid
    const audioBuffer = await response.arrayBuffer();
    const audioSizeKB = (audioBuffer.byteLength / 1024).toFixed(2);

    console.log(`✅ OpenAI TTS verified successfully! Audio size: ${audioSizeKB} KB`);

    res.json({
      ok: true,
      message: "OpenAI TTS verified ✅",
      details: {
        model: model,
        voice: voice,
        testPhrase: testPhrase,
        audioSizeKB: audioSizeKB,
        status: "Connection successful"
      }
    });

  } catch (error) {
    console.error('❌ OpenAI verification failed:', error.message);
    
    res.status(500).json({
      ok: false,
      message: "OpenAI TTS verification failed",
      error: error.message,
      tip: "Check your API key and internet connection"
    });
  }
});

/**
 * AI Dubbing Endpoint
 * POST /api/dub
 * Accepts: multipart/form-data with 'file' and 'targetLanguage'
 * Returns: { ok: true, audioUrl, jobId, message }
 */
app.post("/api/dub", upload.single('file'), async (req, res) => {
  try {
    // Validate request
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

    // Generate unique job ID
    const jobId = Date.now().toString();
    
    // Calculate required credits (1 credit = 10 seconds)
    // For now, estimate based on file size (rough approximation)
    // In production, you'd get actual duration from audio/video metadata
    const estimatedDurationSeconds = Math.max(10, Math.ceil(req.file.size / (1024 * 100))); // Rough estimate
    const requiredCredits = calculateCreditsNeeded(estimatedDurationSeconds);
    
    console.log(`💰 Estimated duration: ${estimatedDurationSeconds}s → ${requiredCredits} credits required`);
    
    // Check if user has enough credits BEFORE processing
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
    
    // Check if API keys are available
    const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    // Check credit balance before using OpenAI
    const creditStatus = await getCreditStatus();
    const hasSufficientCredit = creditRemaining >= MIN_CREDIT;

    if (!hasElevenLabs && !hasOpenAI) {
      console.warn('⚠️ No AI API keys configured. Using mock mode.');
      console.log('💡 Tip: Add OPENAI_API_KEY to .env to enable real AI dubbing');
      
      // Generate mock audio response
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

    // Check if we should use mock mode due to low credit
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

    // Generate dub using available API
    let audioUrl;
    let provider;

    if (hasElevenLabs) {
      console.log('🎙️ Using ElevenLabs for dubbing...');
      audioUrl = await generateDubWithElevenLabs(req.file, targetLanguage, jobId);
      provider = "elevenlabs";
    } else if (hasOpenAI && hasSufficientCredit) {
      console.log('🤖 Using OpenAI TTS for dubbing...');
      console.log(`🔊 Model: gpt-4o-mini-tts, Voice: alloy, Language: ${targetLanguage}`);
      console.log(`💰 Credit balance: $${creditRemaining.toFixed(2)}`);
      audioUrl = await generateDubWithOpenAI(req.file, targetLanguage, jobId);
      provider = "openai";
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    // Deduct credits AFTER successful generation
    const deductResult = deductCredits(requiredCredits, `Doublage ${targetLanguage} (${estimatedDurationSeconds}s)`);
    if (!deductResult.ok) {
      console.error(`⚠️  Failed to deduct credits: ${deductResult.error}`);
      // Don't fail the request, but log the error
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
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // If error is 402 (payment required), return it as-is
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

/**
 * Generate mock dub for testing without API keys
 */
async function generateMockDub(file, targetLanguage, jobId) {
  console.log('🎭 Generating mock dub...');
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return a public domain audio URL for testing
  // In production, this would generate actual dubbed audio
  const mockAudioFiles = {
    'fr': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'en': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'es': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  };
  
  return mockAudioFiles[targetLanguage] || mockAudioFiles['en'];
}

/**
 * Generate dub using ElevenLabs API
 */
async function generateDubWithElevenLabs(file, targetLanguage, jobId) {
  const API_KEY = process.env.ELEVENLABS_API_KEY;
  
  // Language to voice ID mapping (ElevenLabs voices)
  const voiceMap = {
    'en': '21m00Tcm4TlvDq8ikWAM', // Rachel (English)
    'fr': 'ZQe5CZNOzWyzPSCn5a3c', // Bella (French)
    'es': 'yoZ06aMxZJJ28mfd3POQ', // Sam (Spanish)
    'de': 'pNInz6obpgDQGcFmaJgB', // Adam (German)
    'it': 'EXAVITQu4vr4xnSDxMaL', // Elli (Italian)
  };

  const voiceId = voiceMap[targetLanguage] || voiceMap['en'];
  
  // Sample text for dubbing (in production, you'd extract and translate the audio)
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

    // Save audio file
    const audioBuffer = await response.arrayBuffer();
    const outputPath = path.join(outputDir, `dub-${jobId}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    // Return public URL
    const audioUrl = `/output/dub-${jobId}.mp3`;
    console.log(`✅ Dub saved: ${audioUrl}`);
    
    return audioUrl;

  } catch (error) {
    console.error('ElevenLabs API error:', error);
    throw new Error('Failed to generate dub with ElevenLabs');
  }
}

/**
 * Generate dub using OpenAI TTS API
 */
async function generateDubWithOpenAI(file, targetLanguage, jobId) {
  const API_KEY = process.env.OPENAI_API_KEY;
  
  // Sample text for dubbing
  const sampleText = {
    'fr': 'Bienvenue sur AurisVoice, la plateforme de doublage vocal par intelligence artificielle.',
    'en': 'Welcome to AurisVoice, the AI-powered voice dubbing platform.',
    'es': 'Bienvenido a AurisVoice, la plataforma de doblaje de voz con inteligencia artificial.',
    'de': 'Willkommen bei AurisVoice, der KI-gestützten Sprachsynchronisationsplattform.',
    'it': 'Benvenuti su AurisVoice, la piattaforma di doppiaggio vocale basata su intelligenza artificiale.'
  };

  const text = sampleText[targetLanguage] || sampleText['en'];
  
  // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
  const voice = 'alloy'; // Neutral voice, works well for multiple languages
  const model = 'gpt-4o-mini-tts'; // Using gpt-4o-mini-tts model

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

    // Save audio file
    const audioBuffer = await response.arrayBuffer();
    const outputPath = path.join(outputDir, `dub-${jobId}.mp3`);
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    // Return public URL
    const audioUrl = `/output/dub-${jobId}.mp3`;
    console.log(`✅ Dub saved: ${audioUrl}`);
    
    return audioUrl;

  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate dub with OpenAI');
  }
}

// Error handling middleware
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

const PORT = process.env.DUB_PORT || 10000;
app.listen(PORT, async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`✅ AurisVoice backend is ${isProduction ? 'LIVE' : 'running'} on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🎵 Output directory: ${outputDir}`);
  console.log(`🔑 ElevenLabs API: ${process.env.ELEVENLABS_API_KEY ? '✅' : '❌'}`);
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
  
  // Initialize credit monitoring
  if (process.env.OPENAI_API_KEY) {
    console.log(`🧭 Credit monitor active (minimum: $${MIN_CREDIT.toFixed(2)})`);
    await updateCreditBalance();
    
    // Set up periodic credit checks
    setInterval(async () => {
      await updateCreditBalance();
    }, CREDIT_CHECK_INTERVAL);
  } else {
    console.log(`🧭 Credit monitor inactive (no OpenAI API key)`);
  }
  
  if (isProduction) {
    console.log(`🚀 Production mode: Console logs minimized`);
    console.log(`📡 Ready to serve dubbing requests!`);
  }
});

