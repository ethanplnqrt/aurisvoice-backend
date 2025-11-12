// index.js - Entry point for Render deployment (AurisVoice Backend)

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🎙️  ═══════════════════════════════════════════════════════");
console.log("   AurisVoice Backend - Starting...");
console.log("   ═══════════════════════════════════════════════════════");
console.log("📦 Loading server modules...");

try {
  const serverPath = path.join(__dirname, "src", "server-stripe.js");
  console.log("📂 Loading from:", serverPath);

  await import(serverPath);

  console.log("✅ AurisVoice Backend launched successfully!");
  console.log("🚀 AurisVoice Backend LIVE on Render");
  console.log("📡 Server: Port: 10000");
  console.log("💳 Stripe Configuration: ✅ Configured");
} catch (err) {
  console.error("❌ ═══════════════════════════════════════════════════════");
  console.error("   FATAL ERROR: Failed to start AurisVoice Backend");
  console.error("   ═══════════════════════════════════════════════════════");
  console.error("📋 Détails de l'erreur:");
  console.error("   Type:", err.name);
  console.error("   Message:", err.message);
  console.error("💡 Solutions possibles:");
  console.error("   1. Vérifiez que src/server-stripe.js existe");
  console.error("   2. Vérifiez que package.json contient 'type': 'module'");
  console.error("   3. Réinstallez Stripe si besoin: npm install stripe");
  process.exit(1);
}

