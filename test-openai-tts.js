#!/usr/bin/env node

/**
 * OpenAI TTS Integration Test
 * Tests the OpenAI Text-to-Speech API integration
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 OpenAI TTS Integration Test');
console.log('================================\n');

// Check API key
const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.log('❌ Error: OPENAI_API_KEY not found in .env file');
  console.log('\nTo fix this:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Add your OpenAI API key');
  console.log('3. Get key from: https://platform.openai.com/api-keys\n');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY found');
console.log(`🔑 Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);

// Test parameters
const testText = 'Welcome to AurisVoice, the AI-powered voice dubbing platform.';
const testVoice = 'nova'; // Female voice
const testModel = 'tts-1'; // Standard quality model

console.log('📋 Test Configuration:');
console.log(`   Text: "${testText}"`);
console.log(`   Voice: ${testVoice}`);
console.log(`   Model: ${testModel}\n`);

console.log('🎙️ Calling OpenAI TTS API...\n');

async function testOpenAITTS() {
  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: testModel,
        input: testText,
        voice: testVoice,
        response_format: 'mp3'
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API error (${response.status}): ${errorData}`);
    }

    console.log('✅ API call successful!');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}\n`);

    // Save audio file
    const audioBuffer = await response.arrayBuffer();
    const outputDir = path.join(__dirname, 'output');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'test-openai-tts.mp3');
    fs.writeFileSync(outputPath, Buffer.from(audioBuffer));

    const fileSizeKB = (audioBuffer.byteLength / 1024).toFixed(2);
    console.log('✅ Audio file saved!');
    console.log(`   Path: ${outputPath}`);
    console.log(`   Size: ${fileSizeKB} KB\n`);

    // Success summary
    console.log('🎉 Integration Test PASSED!');
    console.log('================================\n');
    console.log('✅ OpenAI API key is valid');
    console.log('✅ TTS API is working correctly');
    console.log('✅ Audio file generated successfully');
    console.log('✅ Ready to use in production\n');

    console.log('Next steps:');
    console.log('1. Start backend: node server-dub.js');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Test at: http://localhost:3001\n');

    return true;

  } catch (error) {
    console.log('❌ Integration Test FAILED!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n⚠️  Authentication error:');
      console.log('   - Check your API key is correct');
      console.log('   - Verify key at: https://platform.openai.com/api-keys');
    } else if (error.message.includes('429')) {
      console.log('\n⚠️  Rate limit or quota exceeded:');
      console.log('   - Check your usage at: https://platform.openai.com/usage');
      console.log('   - Ensure you have credits available');
    } else if (error.message.includes('network')) {
      console.log('\n⚠️  Network error:');
      console.log('   - Check your internet connection');
      console.log('   - Verify firewall settings');
    }
    
    console.log('');
    return false;
  }
}

// Run test
testOpenAITTS()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

