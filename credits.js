// AurisVoice - Credits Management System
// Simple JSON-based credit system for AI dubbing

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDITS_FILE = path.join(__dirname, 'credits.json');

// Setup logs directory and file
const logsDir = path.join(__dirname, 'logs');
const creditsLogFile = path.join(logsDir, 'credits.log');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper function to write credit transaction logs
function writeCreditLog(action, amount, newBalance, reason) {
  const timestamp = new Date().toISOString();
  const amountStr = action === 'ADD' ? `+${amount}` : `-${amount}`;
  const logLine = `[${timestamp}] ${action} | ${amountStr} | ${newBalance} | ${reason}\n`;
  
  try {
    fs.appendFileSync(creditsLogFile, logLine, 'utf8');
  } catch (error) {
    console.error('❌ Failed to write to credits log file:', error);
  }
}

// Initialize credits file if it doesn't exist
function initializeCreditsFile() {
  if (!fs.existsSync(CREDITS_FILE)) {
    const initialData = {
      credits: 10,
      history: [
        {
          type: 'initial',
          amount: 10,
          date: new Date().toISOString(),
          description: 'Crédits initiaux'
        }
      ]
    };
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(initialData, null, 2));
    console.log('💰 Credits file initialized with 10 credits');
  }
}

// Get current credit balance
export function getCredits() {
  try {
    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    return {
      ok: true,
      credits: parsed.credits || 0,
      history: parsed.history || []
    };
  } catch (error) {
    console.error('❌ Error reading credits:', error);
    return {
      ok: false,
      credits: 0,
      error: error.message
    };
  }
}

// Add credits (after successful payment)
export function addCredits(amount, description = 'Achat de crédits') {
  try {
    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    const oldBalance = parsed.credits || 0;
    const newBalance = oldBalance + amount;
    
    parsed.credits = newBalance;
    parsed.history = parsed.history || [];
    parsed.history.push({
      type: 'add',
      amount: amount,
      oldBalance: oldBalance,
      newBalance: newBalance,
      date: new Date().toISOString(),
      description: description
    });
    
    // Keep only last 100 transactions
    if (parsed.history.length > 100) {
      parsed.history = parsed.history.slice(-100);
    }
    
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(parsed, null, 2));
    
    // Log transaction
    writeCreditLog('ADD', amount, newBalance, description);
    
    console.log(`💰 Credits added: +${amount} (${oldBalance} → ${newBalance})`);
    
    return {
      ok: true,
      credits: newBalance,
      added: amount,
      message: `${amount} crédits ajoutés avec succès`
    };
  } catch (error) {
    console.error('❌ Error adding credits:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}

// Deduct credits (after AI dubbing)
export function deductCredits(amount, description = 'Génération de doublage') {
  try {
    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    const oldBalance = parsed.credits || 0;
    
    if (oldBalance < amount) {
      return {
        ok: false,
        credits: oldBalance,
        error: 'Crédits insuffisants',
        required: amount
      };
    }
    
    const newBalance = oldBalance - amount;
    
    parsed.credits = newBalance;
    parsed.history = parsed.history || [];
    parsed.history.push({
      type: 'deduct',
      amount: amount,
      oldBalance: oldBalance,
      newBalance: newBalance,
      date: new Date().toISOString(),
      description: description
    });
    
    // Keep only last 100 transactions
    if (parsed.history.length > 100) {
      parsed.history = parsed.history.slice(-100);
    }
    
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(parsed, null, 2));
    
    // Log transaction
    writeCreditLog('DEDUCT', amount, newBalance, description);
    
    console.log(`💸 Credits deducted: -${amount} (${oldBalance} → ${newBalance})`);
    
    return {
      ok: true,
      credits: newBalance,
      deducted: amount,
      message: `${amount} crédit(s) consommé(s)`
    };
  } catch (error) {
    console.error('❌ Error deducting credits:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}

// Check if user has enough credits
export function hasEnoughCredits(required) {
  const result = getCredits();
  if (!result.ok) {
    return false;
  }
  return result.credits >= required;
}

// Calculate credits needed based on duration (1 credit = 10 seconds)
export function calculateCreditsNeeded(durationSeconds) {
  return Math.ceil(durationSeconds / 10);
}

// Reset credits (admin only, for testing)
export function resetCredits(amount = 10) {
  try {
    const data = {
      credits: amount,
      history: [
        {
          type: 'reset',
          amount: amount,
          date: new Date().toISOString(),
          description: 'Reset manuel'
        }
      ]
    };
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(data, null, 2));
    console.log(`🔄 Credits reset to ${amount}`);
    return {
      ok: true,
      credits: amount,
      message: `Crédits réinitialisés à ${amount}`
    };
  } catch (error) {
    console.error('❌ Error resetting credits:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}

// Export for use in server
export default {
  getCredits,
  addCredits,
  deductCredits,
  hasEnoughCredits,
  calculateCreditsNeeded,
  resetCredits
};

