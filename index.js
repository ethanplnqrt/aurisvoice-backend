// AurisVoice Render Entry Point
// This file ensures Render can find and execute the server

console.log('\n🎙️  ═══════════════════════════════════════════════════════');
console.log('   AurisVoice Backend - Starting...');
console.log('   ═══════════════════════════════════════════════════════\n');

// Dynamic import with error handling
(async () => {
  try {
    console.log('📦 Loading server modules...');
    
    // Import the main server file
    await import('./server-stripe.js');
    
    console.log('✅ Server modules loaded successfully\n');
  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════════════════════');
    console.error('   FATAL ERROR: Failed to start AurisVoice Backend');
    console.error('   ═══════════════════════════════════════════════════════\n');
    console.error('📋 Error Details:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('\n💡 Possible Solutions:');
      console.error('   1. Run: npm install');
      console.error('   2. Check that server-stripe.js exists');
      console.error('   3. Verify all dependencies are installed');
      console.error('   4. Check that package.json has "type": "module"');
    }
    
    console.error('\n📚 For help, see: RENDER_DEPLOYMENT.md\n');
    
    // Exit with error code
    process.exit(1);
  }
})();

