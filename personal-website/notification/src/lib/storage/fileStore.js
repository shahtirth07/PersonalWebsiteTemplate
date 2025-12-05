import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_FILE = path.join(__dirname, '../../../.job-cache.json');

let seenJobs = new Map();

// Load existing cache on startup
function loadCache() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      const cache = JSON.parse(data);
      
      // Convert array back to Map
      seenJobs = new Map(cache);
      
      // Clean up old entries (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      for (const [jobId, payload] of seenJobs.entries()) {
        if (payload.storedAt < thirtyDaysAgo) {
          seenJobs.delete(jobId);
        }
      }
    }
  } catch (error) {
    console.warn('[WARN] Could not load job cache:', error.message);
    seenJobs = new Map();
  }
}

// Save cache to file
function saveCache() {
  try {
    // Convert Map to array for JSON serialization
    const cache = Array.from(seenJobs.entries());
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.warn('[WARN] Could not save job cache:', error.message);
  }
}

// Load cache on module import
loadCache();

export const fileStore = {
  has(jobId) {
    return seenJobs.has(jobId);
  },

  add(jobId, payload) {
    seenJobs.set(jobId, { ...payload, storedAt: Date.now() });
    // Auto-save after each addition (debounced in practice)
    saveCache();
  },

  prune(maxAgeMinutes = 1440) {
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    let pruned = 0;
    for (const [jobId, payload] of seenJobs.entries()) {
      if (payload.storedAt < cutoff) {
        seenJobs.delete(jobId);
        pruned++;
      }
    }
    if (pruned > 0) {
      saveCache();
    }
    return pruned;
  },

  // Force save (call this at end of script)
  save() {
    saveCache();
  },

  // Get stats
  getStats() {
    return {
      totalJobs: seenJobs.size,
      oldestJob: seenJobs.size > 0 
        ? new Date(Math.min(...Array.from(seenJobs.values()).map(j => j.storedAt)))
        : null
    };
  }
};


