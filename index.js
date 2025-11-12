// AurisVoice Render Entry Point
// Universal entry point compatible with local and Render environments

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Startup banner
console.log('\n🎙️  ═══════════════════════════════════════════════════════');
console.log('   AurisVoice Backend - Starting...');
console.log('   ═══════════════════════════════════════════════════════\n');

// Dynamic import with error handling
(async () => {
  try {
    console.log('📦 Loading server modules...');
    
    // Construct absolute path to server file
    const serverPath = join(__dirname, 'server-stripe.js');
    
    console.log(`📂 Loading from: ${serverPath}`);
    
    // Import the main server file
    await import(serverPath);
    
    console.log('✅ Server modules loaded successfully!');
    console.log('🚀 AurisVoice Backend launched successfully!\n');
    
  } catch (error) {
    // Error banner
    console.error('\n❌ ═══════════════════════════════════════════════════════');
    console.error('   FATAL ERROR: Failed to start AurisVoice Backend');
    console.error('   ═══════════════════════════════════════════════════════\n');
    
    // Error details
    console.error('📋 Détails de l\'erreur:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    
    if (error.stack) {
      console.error(`\n📜 Stack trace:`);
      console.error(error.stack.split('\n').slice(0, 5).map(line => `   ${line}`).join('\n'));
    }
    
    // Specific solutions based on error type
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('\n💡 Solutions possibles:');
      console.error('   1. Exécutez: npm install');
      console.error('   2. Vérifiez que server-stripe.js existe');
      console.error('   3. Vérifiez que toutes les dépendances sont installées');
      console.error('   4. Assurez-vous que package.json contient "type": "module"');
      
      if (error.message.includes('stripe')) {
        console.error('   5. Installez Stripe: npm install stripe');
      }
    }
    
    console.error('\n📚 Pour plus d\'aide, consultez: RENDER_DEPLOYMENT.md');
    console.error('📧 Support: github.com/ethanplnqrt/aurisvoice-backend\n');
    
    // Exit with error code
    console.error('🛑 Le serveur ne peut pas démarrer. Arrêt du processus...\n');
    process.exit(1);
  }
})();

