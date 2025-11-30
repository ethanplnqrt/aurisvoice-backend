// AurisVoice - Credits Management System
// Simple JSON-based credit system for AI dubbing

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDITS_FILE = path.join(__dirname, 'credits.json');

// Setup logs directory and file (within /server for Render compatibility)
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
      users: {}
    };
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(initialData, null, 2));
    console.log('💰 Credits file initialized with users structure');
  } else {
    // Migrate old format to new format if needed
    try {
      const data = fs.readFileSync(CREDITS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      
      // If old format (has credits at root level), migrate it
      if (parsed.credits !== undefined && !parsed.users) {
        console.log('🔄 Migrating old credits format to user-based format');
        const migratedData = {
          users: {},
          _migrated: true,
          _migrationDate: new Date().toISOString()
        };
        fs.writeFileSync(CREDITS_FILE, JSON.stringify(migratedData, null, 2));
      }
    } catch (error) {
      // If file is corrupted, initialize fresh
      const initialData = { users: {} };
      fs.writeFileSync(CREDITS_FILE, JSON.stringify(initialData, null, 2));
    }
  }
}

// Helper function to migrate old userId (Clerk ID) to stableId (email)
function migrateUserData(creditsData, oldUserId, stableId) {
  if (oldUserId && oldUserId !== stableId && creditsData.users[oldUserId]) {
    console.log(`🔄 Migrating user data from ${oldUserId} to ${stableId}`);
    creditsData.users[stableId] = creditsData.users[oldUserId];
    delete creditsData.users[oldUserId];
    return true;
  }
  return false;
}

// Get current credit balance for a user
export function getCredits(stableId) {
  try {
    if (!stableId) {
      return {
        ok: false,
        credits: 0,
        error: 'stableId is required'
      };
    }

    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure users object exists
    if (!parsed.users) {
      parsed.users = {};
    }
    
    // Initialize user if doesn't exist
    if (!parsed.users[stableId]) {
      parsed.users[stableId] = {
        credits: 0,
        history: []
      };
      fs.writeFileSync(CREDITS_FILE, JSON.stringify(parsed, null, 2));
    }
    
    return {
      ok: true,
      credits: parsed.users[stableId].credits || 0,
      history: parsed.users[stableId].history || []
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
export function addCredits(stableId, amount, description = 'Achat de crédits') {
  try {
    if (!stableId) {
      return {
        ok: false,
        error: 'stableId is required'
      };
    }

    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure users object exists
    if (!parsed.users) {
      parsed.users = {};
    }
    
    // Initialize user if doesn't exist
    if (!parsed.users[stableId]) {
      parsed.users[stableId] = {
        credits: 0,
        history: []
      };
    }
    
    const oldBalance = parsed.users[stableId].credits || 0;
    const newBalance = oldBalance + amount;
    
    parsed.users[stableId].credits = newBalance;
    parsed.users[stableId].history = parsed.users[stableId].history || [];
    parsed.users[stableId].history.push({
      type: 'add',
      amount: amount,
      oldBalance: oldBalance,
      newBalance: newBalance,
      date: new Date().toISOString(),
      description: description
    });
    
    // Keep only last 100 transactions per user
    if (parsed.users[stableId].history.length > 100) {
      parsed.users[stableId].history = parsed.users[stableId].history.slice(-100);
    }
    
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(parsed, null, 2));
    
    // Log transaction
    writeCreditLog('ADD', amount, newBalance, `${description} (${stableId})`);
    
    console.log(`💰 Credits added for ${stableId}: +${amount} (${oldBalance} → ${newBalance})`);
    
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
export function deductCredits(stableId, amount, description = 'Génération de doublage') {
  try {
    if (!stableId) {
      return {
        ok: false,
        credits: 0,
        error: 'stableId is required',
        required: amount
      };
    }

    initializeCreditsFile();
    const data = fs.readFileSync(CREDITS_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure users object exists
    if (!parsed.users) {
      parsed.users = {};
    }
    
    // Initialize user if doesn't exist
    if (!parsed.users[stableId]) {
      parsed.users[stableId] = {
        credits: 0,
        history: []
      };
    }
    
    const oldBalance = parsed.users[stableId].credits || 0;
    
    if (oldBalance < amount) {
      return {
        ok: false,
        credits: oldBalance,
        error: 'Crédits insuffisants',
        required: amount
      };
    }
    
    const newBalance = oldBalance - amount;
    
    parsed.users[stableId].credits = newBalance;
    parsed.users[stableId].history = parsed.users[stableId].history || [];
    parsed.users[stableId].history.push({
      type: 'deduct',
      amount: amount,
      oldBalance: oldBalance,
      newBalance: newBalance,
      date: new Date().toISOString(),
      description: description
    });
    
    // Keep only last 100 transactions per user
    if (parsed.users[stableId].history.length > 100) {
      parsed.users[stableId].history = parsed.users[stableId].history.slice(-100);
    }
    
    fs.writeFileSync(CREDITS_FILE, JSON.stringify(parsed, null, 2));
    
    // Log transaction
    writeCreditLog('DEDUCT', amount, newBalance, `${description} (${stableId})`);
    
    console.log(`💸 Credits deducted for ${stableId}: -${amount} (${oldBalance} → ${newBalance})`);
    
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
export function hasEnoughCredits(stableId, required) {
  if (!stableId) {
    return false;
  }
  const result = getCredits(stableId);
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

