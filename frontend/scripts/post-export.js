// Post-export script for Capacitor
// Copies PWA files to mobile/www after Next.js export

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..');
const targetDir = path.join(__dirname, '..', 'mobile', 'www');

console.log('📦 Post-export: Copying PWA files to mobile/www...');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Files to copy from public/
const filesToCopy = [
  { from: 'public/manifest.json', to: 'manifest.json' },
  { from: 'public/sw.js', to: 'sw.js' },
];

// Directories to copy from public/
const dirsToCopy = [
  { from: 'public/icons', to: 'icons' },
  { from: 'public/splash', to: 'splash' },
  { from: 'public/screenshots', to: 'screenshots' },
];

// Copy files
filesToCopy.forEach(({ from, to }) => {
  const sourcePath = path.join(sourceDir, from);
  const targetPath = path.join(targetDir, to);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied: ${from} → ${to}`);
  } else {
    console.warn(`⚠️  File not found: ${from}`);
  }
});

// Copy directories
dirsToCopy.forEach(({ from, to }) => {
  const sourcePath = path.join(sourceDir, from);
  const targetPath = path.join(targetDir, to);
  
  if (fs.existsSync(sourcePath)) {
    // Create target directory
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
    
    // Copy all files in directory
    const files = fs.readdirSync(sourcePath);
    files.forEach(file => {
      const sourceFile = path.join(sourcePath, file);
      const targetFile = path.join(targetPath, file);
      
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, targetFile);
        console.log(`✅ Copied: ${from}/${file} → ${to}/${file}`);
      }
    });
  } else {
    console.warn(`⚠️  Directory not found: ${from}`);
  }
});

// Verify critical files
const criticalFiles = [
  'manifest.json',
  'sw.js',
  'icons',
];

console.log('\n📋 Verification:');
let allFilesExist = true;
criticalFiles.forEach(file => {
  const filePath = path.join(targetDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ ${file} missing!`);
    allFilesExist = false;
  }
});

// Verify Next.js build output structure
const nextStaticDir = path.join(targetDir, '_next', 'static');
if (fs.existsSync(nextStaticDir)) {
  console.log('✅ Next.js static assets found');
} else {
  console.warn('⚠️  Next.js static assets directory not found');
}

console.log('\n✅ Post-export complete!');
console.log(`📁 Output directory: ${targetDir}`);

if (!allFilesExist) {
  console.warn('\n⚠️  Some critical files are missing. Please check the build output.');
  process.exit(1);
}

