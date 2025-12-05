import Database from 'better-sqlite3';
import path from 'path';
import { logger } from '../../utils/logger.js';

const DB_PATH = path.resolve(process.cwd(), 'jobs.db');
let db = null;

/**
 * Initialize SQLite database and create tables if needed
 */
function initDB() {
  if (db) return db;

  try {
    db = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    
    // Create jobs table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        job_id TEXT PRIMARY KEY,
        company TEXT NOT NULL,
        title TEXT NOT NULL,
        location TEXT,
        link TEXT,
        posted_at TEXT,
        stored_at INTEGER NOT NULL,
        notified_at INTEGER,
        matched_filters TEXT,
        raw_data TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_company ON jobs(company);
      CREATE INDEX IF NOT EXISTS idx_stored_at ON jobs(stored_at);
      CREATE INDEX IF NOT EXISTS idx_posted_at ON jobs(posted_at);
      CREATE INDEX IF NOT EXISTS idx_notified_at ON jobs(notified_at);
    `);
    
    logger.info(`Database initialized at ${DB_PATH}`);
    return db;
  } catch (error) {
    logger.error(`Error initializing database: ${error.message}`);
    throw error;
  }
}

/**
 * SQLite-based storage for all jobs
 */
export const dbStore = {
  async has(jobId) {
    const database = initDB();
    const stmt = database.prepare('SELECT 1 FROM jobs WHERE job_id = ? LIMIT 1');
    const result = stmt.get(jobId);
    return result !== undefined;
  },

  add(jobId, payload) {
    const database = initDB();
    const now = Date.now();
    
    try {
      const stmt = database.prepare(`
        INSERT OR REPLACE INTO jobs (
          job_id, company, title, location, link, posted_at, 
          stored_at, notified_at, matched_filters, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        jobId,
        payload.company || '',
        payload.title || '',
        payload.location || '',
        payload.link || '',
        payload.postedAt || null,
        now,
        payload.notifiedAt || null,
        JSON.stringify(payload.matchedFilters || {}),
        JSON.stringify(payload)
      );
      
      logger.debug(`Stored job in database: ${jobId}`);
    } catch (error) {
      logger.error(`Error storing job ${jobId}: ${error.message}`);
    }
  },

  /**
   * Mark a job as notified
   */
  markNotified(jobId) {
    const database = initDB();
    const stmt = database.prepare('UPDATE jobs SET notified_at = ? WHERE job_id = ?');
    stmt.run(Date.now(), jobId);
  },

  /**
   * Get all jobs matching criteria
   */
  getJobs(filters = {}) {
    const database = initDB();
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];
    
    if (filters.company) {
      query += ' AND company = ?';
      params.push(filters.company);
    }
    
    if (filters.since) {
      query += ' AND stored_at >= ?';
      params.push(filters.since);
    }
    
    if (filters.notified !== undefined) {
      if (filters.notified) {
        query += ' AND notified_at IS NOT NULL';
      } else {
        query += ' AND notified_at IS NULL';
      }
    }
    
    query += ' ORDER BY stored_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const stmt = database.prepare(query);
    const rows = stmt.all(...params);
    
    return rows.map(row => ({
      jobId: row.job_id,
      company: row.company,
      title: row.title,
      location: row.location,
      link: row.link,
      postedAt: row.posted_at,
      storedAt: row.stored_at,
      notifiedAt: row.notified_at,
      matchedFilters: row.matched_filters ? JSON.parse(row.matched_filters) : {},
      rawData: row.raw_data ? JSON.parse(row.raw_data) : {}
    }));
  },

  /**
   * Get statistics about stored jobs
   */
  getStats() {
    const database = initDB();
    
    const totalJobs = database.prepare('SELECT COUNT(*) as count FROM jobs').get();
    const byCompany = database.prepare(`
      SELECT company, COUNT(*) as count 
      FROM jobs 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 10
    `).all();
    
    const notified = database.prepare('SELECT COUNT(*) as count FROM jobs WHERE notified_at IS NOT NULL').get();
    const notNotified = database.prepare('SELECT COUNT(*) as count FROM jobs WHERE notified_at IS NULL').get();
    
    const oldest = database.prepare('SELECT MIN(stored_at) as oldest FROM jobs').get();
    const newest = database.prepare('SELECT MAX(stored_at) as newest FROM jobs').get();
    
    return {
      totalJobs: totalJobs.count,
      notified: notified.count,
      notNotified: notNotified.count,
      topCompanies: byCompany,
      oldestJob: oldest.oldest ? new Date(oldest.oldest) : null,
      newestJob: newest.newest ? new Date(newest.newest) : null
    };
  },

  prune(maxAgeMinutes = 1440) {
    const database = initDB();
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    
    const stmt = database.prepare('DELETE FROM jobs WHERE stored_at < ?');
    const result = stmt.run(cutoff);
    
    if (result.changes > 0) {
      logger.info(`Pruned ${result.changes} old jobs from database`);
      // Vacuum to reclaim space
      database.exec('VACUUM');
    }
    
    return result.changes;
  },

  /**
   * Close database connection
   */
  close() {
    if (db) {
      db.close();
      db = null;
      logger.info('Database connection closed');
    }
  }
};

// Initialize on module load
initDB();

