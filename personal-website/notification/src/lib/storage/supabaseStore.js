/**
 * Supabase/PostgreSQL storage for jobs
 * 
 * Setup:
 * 1. Create a free Supabase project at https://supabase.com
 * 2. Get your project URL and anon key from Settings > API
 * 3. Run this SQL in the SQL Editor to create the table:
 * 
 * CREATE TABLE jobs (
 *   job_id TEXT PRIMARY KEY,
 *   company TEXT NOT NULL,
 *   title TEXT NOT NULL,
 *   location TEXT,
 *   link TEXT,
 *   posted_at TEXT,
 *   stored_at BIGINT NOT NULL,
 *   notified_at BIGINT,
 *   matched_filters JSONB,
 *   raw_data JSONB
 * );
 * 
 * CREATE INDEX idx_company ON jobs(company);
 * CREATE INDEX idx_stored_at ON jobs(stored_at);
 * CREATE INDEX idx_posted_at ON jobs(posted_at);
 * CREATE INDEX idx_notified_at ON jobs(notified_at);
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger.js';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

let supabase = null;

function initSupabase() {
  if (supabase) return supabase;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase credentials missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment variables.');
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  logger.info('Supabase client initialized');
  return supabase;
}

/**
 * Supabase/PostgreSQL storage for jobs
 */
export const supabaseStore = {
  async has(jobId) {
    const client = initSupabase();
    const { data, error } = await client
      .from('jobs')
      .select('job_id')
      .eq('job_id', jobId)
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error(`Error checking job ${jobId}: ${error.message}`);
      return false;
    }
    
    return data !== null;
  },

  async add(jobId, payload) {
    const client = initSupabase();
    const now = Date.now();
    
    try {
      const { error } = await client
        .from('jobs')
        .upsert({
          job_id: jobId,
          company: payload.company || '',
          title: payload.title || '',
          location: payload.location || '',
          link: payload.link || '',
          posted_at: payload.postedAt || null,
          stored_at: now,
          notified_at: payload.notifiedAt || null,
          matched_filters: payload.matchedFilters || {},
          raw_data: payload
        }, {
          onConflict: 'job_id'
        });
      
      if (error) {
        logger.error(`Error storing job ${jobId}: ${error.message}`);
      } else {
        logger.debug(`Stored job in Supabase: ${jobId}`);
      }
    } catch (error) {
      logger.error(`Error storing job ${jobId}: ${error.message}`);
    }
  },

  async markNotified(jobId) {
    const client = initSupabase();
    const { error } = await client
      .from('jobs')
      .update({ notified_at: Date.now() })
      .eq('job_id', jobId);
    
    if (error) {
      logger.error(`Error marking job as notified ${jobId}: ${error.message}`);
    }
  },

  async getJobs(filters = {}) {
    const client = initSupabase();
    let query = client.from('jobs').select('*');
    
    if (filters.company) {
      query = query.eq('company', filters.company);
    }
    
    if (filters.since) {
      query = query.gte('stored_at', filters.since);
    }
    
    if (filters.notified !== undefined) {
      if (filters.notified) {
        query = query.not('notified_at', 'is', null);
      } else {
        query = query.is('notified_at', null);
      }
    }
    
    query = query.order('stored_at', { ascending: false });
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error(`Error fetching jobs: ${error.message}`);
      return [];
    }
    
    return data.map(row => ({
      jobId: row.job_id,
      company: row.company,
      title: row.title,
      location: row.location,
      link: row.link,
      postedAt: row.posted_at,
      storedAt: row.stored_at,
      notifiedAt: row.notified_at,
      matchedFilters: row.matched_filters || {},
      rawData: row.raw_data || {}
    }));
  },

  async getStats() {
    const client = initSupabase();
    
    const { count: totalJobs } = await client
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    
    const { count: notified } = await client
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .not('notified_at', 'is', null);
    
    const { count: notNotified } = await client
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .is('notified_at', null);
    
    // Get all companies and group client-side
    const { data: allJobs } = await client
      .from('jobs')
      .select('company');
    
    const counts = {};
    allJobs?.forEach(job => {
      counts[job.company] = (counts[job.company] || 0) + 1;
    });
    const byCompany = Object.entries(counts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const { data: oldestData } = await client
      .from('jobs')
      .select('stored_at')
      .order('stored_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    const { data: newestData } = await client
      .from('jobs')
      .select('stored_at')
      .order('stored_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    return {
      totalJobs: totalJobs || 0,
      notified: notified || 0,
      notNotified: notNotified || 0,
      topCompanies: byCompany || [],
      oldestJob: oldestData?.stored_at ? new Date(oldestData.stored_at) : null,
      newestJob: newestData?.stored_at ? new Date(newestData.stored_at) : null
    };
  },

  async prune(maxAgeMinutes = 1440) {
    const client = initSupabase();
    const cutoff = Date.now() - maxAgeMinutes * 60 * 1000;
    
    const { data, error } = await client
      .from('jobs')
      .delete()
      .lt('stored_at', cutoff)
      .select();
    
    if (error) {
      logger.error(`Error pruning jobs: ${error.message}`);
      return 0;
    }
    
    const pruned = data?.length || 0;
    if (pruned > 0) {
      logger.info(`Pruned ${pruned} old jobs from Supabase`);
    }
    
    return pruned;
  }
};

