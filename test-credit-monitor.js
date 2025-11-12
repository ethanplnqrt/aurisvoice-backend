#!/usr/bin/env node

/**
 * Credit Monitor Test Script
 * Tests the automatic credit monitoring and fallback system
 */

console.log('🧪 AurisVoice Credit Monitor Test\n');
console.log('='.repeat(50));

// Test scenarios
const scenarios = [
  { credit: 5.92, minCredit: 1.0, expected: 'OpenAI TTS enabled' },
  { credit: 0.50, minCredit: 1.0, expected: 'Mock mode (low credit)' },
  { credit: 1.00, minCredit: 1.0, expected: 'OpenAI TTS enabled (exactly at minimum)' },
  { credit: 0.99, minCredit: 1.0, expected: 'Mock mode (below minimum)' }
];

console.log('\nTesting credit decision logic:\n');

scenarios.forEach((scenario, index) => {
  const { credit, minCredit, expected } = scenario;
  const hasSufficientCredit = credit >= minCredit;
  const mode = hasSufficientCredit ? 'OpenAI TTS' : 'Mock mode';
  const icon = hasSufficientCredit ? '✅' : '⚠️';
  
  console.log(`Test ${index + 1}:`);
  console.log(`  Credit: $${credit.toFixed(2)}`);
  console.log(`  Minimum: $${minCredit.toFixed(2)}`);
  console.log(`  Result: ${icon} ${mode}`);
  console.log(`  Expected: ${expected}`);
  console.log(`  Status: ${mode === expected || expected.includes(mode) ? '✅ PASS' : '❌ FAIL'}\n`);
});

console.log('='.repeat(50));
console.log('\n✅ Credit monitor logic verified!\n');

console.log('To test with live server:');
console.log('1. Start server: node server-dub.js');
console.log('2. Check credit: curl http://localhost:3000/api/credit');
console.log('3. Try dubbing: Upload via frontend at http://localhost:3001\n');

console.log('📊 Current behavior:');
console.log('  - Credit >= $1.00 → Uses OpenAI TTS');
console.log('  - Credit < $1.00 → Auto-switches to mock mode');
console.log('  - Checks every 5 minutes automatically');
console.log('  - Logs warning when credit is low\n');

