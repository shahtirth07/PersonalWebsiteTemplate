export const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => {
    // Only log debug messages if DEBUG env var is set
    if (process.env.DEBUG === 'true') {
      console.log('[DEBUG]', ...args);
    }
  }
};

