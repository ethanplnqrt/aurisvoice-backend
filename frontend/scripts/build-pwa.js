// Build script for PWA export (Capacitor)
// Temporarily replaces next.config.js with export config, builds, then restores

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const configFile = path.join(rootDir, 'next.config.js');
const exportConfigFile = path.join(rootDir, 'next.config.export.js');
const backupConfigFile = path.join(rootDir, 'next.config.js.backup');
const outDir = path.join(rootDir, 'mobile', 'www');

console.log('🚀 Starting PWA build for Capacitor...\n');

// Step 1: Backup current config
console.log('📋 Step 1: Backing up next.config.js...');
if (fs.existsSync(configFile)) {
  fs.copyFileSync(configFile, backupConfigFile);
  console.log('✅ Config backed up\n');
} else {
  console.error('❌ next.config.js not found!');
  process.exit(1);
}

// Step 2: Replace with export config
console.log('📋 Step 2: Using export configuration...');
if (fs.existsSync(exportConfigFile)) {
  fs.copyFileSync(exportConfigFile, configFile);
  console.log('✅ Export config applied\n');
} else {
  console.error('❌ next.config.export.js not found!');
  process.exit(1);
}

// Step 3: Clean output directory
console.log('📋 Step 3: Cleaning output directory...');
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true, force: true });
  console.log('✅ Output directory cleaned\n');
}

// Step 4: Build Next.js
console.log('📋 Step 4: Building Next.js (static export)...');
try {
  execSync('next build', {
    cwd: rootDir,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  console.log('✅ Next.js build complete\n');
} catch (error) {
  console.error('❌ Build failed!');
  // Restore config before exiting
  if (fs.existsSync(backupConfigFile)) {
    fs.copyFileSync(backupConfigFile, configFile);
    fs.unlinkSync(backupConfigFile);
  }
  process.exit(1);
}

// Step 5: Move out directory to mobile/www
console.log('📋 Step 5: Moving build output to mobile/www...');
const nextOutDir = path.join(rootDir, 'out');
if (fs.existsSync(nextOutDir)) {
  if (!fs.existsSync(path.dirname(outDir))) {
    fs.mkdirSync(path.dirname(outDir), { recursive: true });
  }
  fs.renameSync(nextOutDir, outDir);
  console.log('✅ Build output moved to mobile/www\n');
} else {
  console.error('❌ Build output directory not found!');
  // Restore config before exiting
  if (fs.existsSync(backupConfigFile)) {
    fs.copyFileSync(backupConfigFile, configFile);
    fs.unlinkSync(backupConfigFile);
  }
  process.exit(1);
}

// Step 6: Run post-export script
console.log('📋 Step 6: Running post-export script...');
try {
  require('./post-export.js');
  console.log('✅ Post-export complete\n');
} catch (error) {
  console.error('❌ Post-export failed:', error.message);
  // Continue anyway
}

// Step 7: Restore original config
console.log('📋 Step 7: Restoring original configuration...');
if (fs.existsSync(backupConfigFile)) {
  fs.copyFileSync(backupConfigFile, configFile);
  fs.unlinkSync(backupConfigFile);
  console.log('✅ Original config restored\n');
}

console.log('🎉 PWA build complete!');
console.log(`📁 Output: ${outDir}`);
console.log('\n💡 Next steps:');
console.log('   1. cd mobile');
console.log('   2. npx cap sync');
console.log('   3. npx cap open android (or ios)');

