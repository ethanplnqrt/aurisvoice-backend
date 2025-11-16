// Script de vérification des fichiers PWA dans mobile/www

const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, '..', 'mobile', 'www');

console.log('🔍 Vérification des fichiers PWA dans mobile/www...\n');

const requiredFiles = [
  'manifest.json',
  'sw.js',
];

const requiredDirs = [
  'icons',
  'splash',
  'screenshots',
];

let allOk = true;

// Vérifier les fichiers
console.log('📄 Fichiers requis:');
requiredFiles.forEach(file => {
  const filePath = path.join(wwwDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`   ❌ ${file} MANQUANT!`);
    allOk = false;
  }
});

// Vérifier les dossiers
console.log('\n📁 Dossiers requis:');
requiredDirs.forEach(dir => {
  const dirPath = path.join(wwwDir, dir);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    console.log(`   ✅ ${dir}/ (${files.length} fichier(s))`);
    if (files.length === 0) {
      console.log(`      ⚠️  Le dossier est vide`);
    }
  } else {
    console.log(`   ❌ ${dir}/ MANQUANT!`);
    allOk = false;
  }
});

// Vérifier la structure Next.js
console.log('\n📦 Structure Next.js:');
const nextStaticDir = path.join(wwwDir, '_next', 'static');
if (fs.existsSync(nextStaticDir)) {
  console.log('   ✅ _next/static/ existe');
} else {
  console.log('   ❌ _next/static/ MANQUANT!');
  allOk = false;
}

// Vérifier index.html
console.log('\n🌐 Fichiers HTML:');
const indexHtml = path.join(wwwDir, 'index.html');
if (fs.existsSync(indexHtml)) {
  console.log('   ✅ index.html existe');
} else {
  console.log('   ❌ index.html MANQUANT!');
  allOk = false;
}

console.log('\n' + '='.repeat(50));
if (allOk) {
  console.log('✅ Tous les fichiers PWA sont présents!');
  process.exit(0);
} else {
  console.log('❌ Certains fichiers sont manquants!');
  console.log('\n💡 Exécutez: npm run build:pwa');
  process.exit(1);
}

