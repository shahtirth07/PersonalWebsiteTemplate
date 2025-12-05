import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

// Cache of seen job IDs (loaded from Telegram on startup)
let seenJobsCache = new Set();
let cacheLoaded = false;

/**
 * Load seen jobs from Telegram chat history
 * Extracts job IDs from previous messages
 */
async function loadFromTelegram() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    logger.warn('Telegram credentials missing, cannot load chat history');
    return;
  }

  try {
    // Get recent updates (last 100 messages)
    const updatesUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=100`;
    const response = await fetch(updatesUrl);
    const data = await response.json();

    if (!data.ok) {
      logger.warn('Could not fetch Telegram updates:', data.description);
      return;
    }

    // Extract job IDs from messages sent by the bot
    const jobIdPattern = /#JOB_ID:([^#\n]+)#/;
    let found = 0;

    if (data.result && Array.isArray(data.result)) {
      for (const update of data.result) {
        if (update.message && update.message.chat?.id?.toString() === TELEGRAM_CHAT_ID) {
          const text = update.message.text || '';
          const match = text.match(jobIdPattern);
          if (match) {
            const jobId = match[1].trim();
            seenJobsCache.add(jobId);
            found++;
          }
        }
      }
    }

    logger.info(`Loaded ${found} job IDs from Telegram chat history`);
    cacheLoaded = true;
  } catch (error) {
    logger.warn(`Error loading from Telegram: ${error.message}`);
    cacheLoaded = true; // Mark as loaded even if failed to avoid retrying
  }
}

/**
 * Telegram-based storage using chat history as database
 */
export const telegramStore = {
  async has(jobId) {
    // Load from Telegram on first check (lazy loading)
    if (!cacheLoaded) {
      await loadFromTelegram();
    }
    return seenJobsCache.has(jobId);
  },

  add(jobId, payload) {
    // Add to cache immediately
    seenJobsCache.add(jobId);
    // Job ID will be included in Telegram message, so chat history becomes the database
  },

  prune(maxAgeMinutes = 1440) {
    // Telegram chat history is the source of truth
    // We just maintain a cache for fast lookups
    // Pruning happens automatically as we reload from Telegram
    return 0;
  },

  async save() {
    // No need to save - Telegram chat is the database
    // Just reload cache from Telegram if needed
    if (!cacheLoaded) {
      await loadFromTelegram();
    }
  },

  getStats() {
    return {
      totalJobs: seenJobsCache.size,
      source: 'Telegram Chat History'
    };
  },

  // Force reload from Telegram
  async reload() {
    seenJobsCache.clear();
    cacheLoaded = false;
    await loadFromTelegram();
  }
};


