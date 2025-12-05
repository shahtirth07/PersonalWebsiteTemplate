import 'dotenv/config';

import { getAllCompanies, getCompaniesByPriority } from './config/companies.js';
import { globalFilters } from './config/filters.js';
import { fetchWorkdayJobs } from './lib/fetchers/workday.js';
import { fetchGreenhouseJobs } from './lib/fetchers/greenhouse.js';
import { fetchLeverJobs } from './lib/fetchers/lever.js';
import { fetchCustomJobs } from './lib/fetchers/custom.js';
import { sendJobAlerts } from './lib/notifier/index.js';
import { logger } from './utils/logger.js';

// Choose storage: 'db' (SQLite), 'telegram' (chat history), or 'file' (JSON file)
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'db'; // Default to SQLite database

// Will be initialized in main()
let jobStore;

// Configuration for parallel processing
const PARALLEL_BATCH_SIZE = 20; // Process 20 companies at once
const BATCH_DELAY_MS = 500; // Delay between batches to avoid overwhelming APIs

async function main() {
  // Initialize storage based on type
  if (!jobStore) {
    if (STORAGE_TYPE === 'db') {
      const dbModule = await import('./lib/storage/dbStore.js');
      jobStore = dbModule.dbStore;
    } else if (STORAGE_TYPE === 'telegram') {
      const telegramModule = await import('./lib/storage/telegramStore.js');
      jobStore = telegramModule.telegramStore;
    } else {
      const fileModule = await import('./lib/storage/fileStore.js');
      jobStore = fileModule.fileStore;
    }
  }

  const startTime = Date.now();
  logger.info(`Starting parallel job poll for 200+ companies... (Storage: ${STORAGE_TYPE})`);

  let allCompanies = getAllCompanies();
  
  // Apply minPriority filter if set
  if (globalFilters.minPriority !== null) {
    allCompanies = allCompanies.filter(c => c.priority <= globalFilters.minPriority);
  }
  
  // Limit companies for testing if set
  if (globalFilters.maxCompanies !== null) {
    allCompanies = allCompanies.slice(0, globalFilters.maxCompanies);
    logger.info(`Limited to first ${globalFilters.maxCompanies} companies for testing`);
  }
  
  logger.info(`Total companies to check: ${allCompanies.length}`);
  
  // Prioritize high-priority companies (priority 1) first
  const priority1Companies = allCompanies.filter(c => c.priority === 1);
  const otherCompanies = allCompanies.filter(c => c.priority > 1);
  
  const allNewJobs = [];
  let processed = 0;
  let errors = 0;

  // Process priority 1 companies in parallel batches
  if (priority1Companies.length > 0) {
    logger.info(`Processing ${priority1Companies.length} priority 1 companies in parallel batches of ${PARALLEL_BATCH_SIZE}...`);
    const results = await processCompaniesInBatches(priority1Companies, PARALLEL_BATCH_SIZE);
    allNewJobs.push(...results.jobs);
    processed += results.processed;
    errors += results.errors;
  }

  // Process other companies in parallel batches
  if (otherCompanies.length > 0) {
    logger.info(`Processing ${otherCompanies.length} other companies in parallel batches of ${PARALLEL_BATCH_SIZE}...`);
    const results = await processCompaniesInBatches(otherCompanies, PARALLEL_BATCH_SIZE);
    allNewJobs.push(...results.jobs);
    processed += results.processed;
    errors += results.errors;
  }

  if (allNewJobs.length > 0) {
    logger.info(`Found ${allNewJobs.length} new matching jobs. Sending notifications...`);
    await sendJobAlerts(allNewJobs);
  } else {
    logger.info('No new matching jobs found.');
  }

  const pruned = jobStore.prune(globalFilters.maxJobAgeDays * 24 * 60); // Prune entries older than maxJobAgeDays
  
  // Save if method exists (for file-based storage)
  if (jobStore.save) {
    jobStore.save();
  }
  
  // Log database stats if available
  if (jobStore.getStats) {
    const stats = jobStore.getStats();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info(`Job poll complete in ${duration}s. Processed ${processed} companies (${errors} errors), found ${allNewJobs.length} new jobs.`);
    logger.info(`Database: ${stats.totalJobs} total jobs, ${stats.notified || 0} notified, ${pruned} old entries pruned.`);
  } else {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.info(`Job poll complete in ${duration}s. Processed ${processed} companies (${errors} errors), found ${allNewJobs.length} new jobs.`);
  }
  
  // Close database connection if using db storage
  if (STORAGE_TYPE === 'db' && jobStore.close) {
    jobStore.close();
  }
}

/**
 * Process companies in parallel batches
 */
async function processCompaniesInBatches(companies, batchSize) {
  const allNewJobs = [];
  let processed = 0;
  let errors = 0;

  // Split companies into batches
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(companies.length / batchSize);
    
    logger.info(`Processing batch ${batchNum}/${totalBatches} (${batch.length} companies)...`);

    // Process all companies in this batch in parallel
    const batchPromises = batch.map(company => 
      processCompany(company).catch(error => {
        logger.error(`Error processing ${company.name}: ${error.message}`);
        return { jobs: [], error: true };
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    
    // Collect results
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { jobs, error } = result.value;
        allNewJobs.push(...jobs);
        processed++;
        if (error) errors++;
      } else {
        errors++;
        processed++;
      }
    });

    // Small delay between batches to avoid overwhelming APIs
    if (i + batchSize < companies.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return { jobs: allNewJobs, processed, errors };
}

/**
 * Process a single company and return matching jobs
 */
async function processCompany(company) {
  try {
    const jobs = await fetchJobsForCompany(company);
    
    if (jobs.length > 0) {
      logger.debug(`Found ${jobs.length} jobs for ${company.name}`);
    }
    
    const normalized = jobs.map((job) => normalizeJob(job, company.name));
    const freshJobs = [];
    for (const job of normalized) {
      if (await isNewJob(job)) {
        freshJobs.push(job);
      }
    }
    const filteredJobs = freshJobs.filter(job => matchesFilters(job, company));

    // Store all processed jobs (not just new ones) to avoid re-processing
    normalized.forEach((job) => jobStore.add(job.jobId, job));
    
    // Mark filtered jobs as notified (they will be sent)
    if (filteredJobs.length > 0 && jobStore.markNotified) {
      filteredJobs.forEach((job) => jobStore.markNotified(job.jobId));
    }

    if (filteredJobs.length > 0) {
      logger.info(`✓ ${company.name}: ${filteredJobs.length} new matching jobs`);
    }

    return { jobs: filteredJobs, error: false };
  } catch (error) {
    logger.error(`Error fetching jobs for ${company.name}: ${error.message}`);
    return { jobs: [], error: true };
  }
}

async function fetchJobsForCompany(company) {
  // Determine ATS type from company object structure
  let atsType = 'custom';
  
  // Check if company has explicit ATS type (from companies.js structure)
  if (company.ats) {
    atsType = company.ats;
  } else if (company.apiEndpoint) {
    // Infer from API endpoint
    if (company.apiEndpoint.includes('workday') || company.careerUrl?.includes('workday')) {
      atsType = 'workday';
    } else if (company.apiEndpoint.includes('greenhouse') || company.apiEndpoint.includes('boards.greenhouse.io')) {
      atsType = 'greenhouse';
    } else if (company.apiEndpoint.includes('lever') || company.apiEndpoint.includes('api.lever.co')) {
      atsType = 'lever';
    }
  } else if (company.scraper) {
    atsType = 'custom';
  }

  switch (atsType) {
    case 'workday':
      return fetchWorkdayJobs(company);
    case 'greenhouse':
      return fetchGreenhouseJobs(company);
    case 'lever':
      return fetchLeverJobs(company);
    case 'custom':
      return fetchCustomJobs(company);
    default:
      logger.warn(`Unknown ATS type for ${company.name}, using custom scraper`);
      return fetchCustomJobs(company);
  }
}

function normalizeJob(job, companyName) {
  return {
    company: companyName,
    title: job.title ?? 'Unknown Role',
    location: job.location ?? '',
    link: job.link ?? '',
    jobId: job.jobId ?? `${companyName}-${job.title ?? ''}-${job.location ?? ''}`,
    postedAt: job.postedAt ?? null
  };
}

async function isNewJob(job) {
  if (await jobStore.has(job.jobId)) return false;
  return true;
}

function matchesFilters(job, company) {
  const jobTitleLower = job.title.toLowerCase();
  const jobLocationLower = job.location.toLowerCase();
  
  // Check keyword match
  const keywordMatch = globalFilters.keywords.some((kw) =>
    jobTitleLower.includes(kw.toLowerCase())
  );
  
  // Check location match - must be in USA
  const locationMatch = globalFilters.locations.some((loc) =>
    jobLocationLower.includes(loc.toLowerCase())
  );
  
  // Exclude non-USA locations
  const hasExcludedLocation = globalFilters.excludeLocations.some((loc) =>
    jobLocationLower.includes(loc.toLowerCase())
  );

  if (!keywordMatch || !locationMatch || hasExcludedLocation) return false;

  // Check if job is an intern/entry level role (always include these)
  const isEntryLevel = globalFilters.alwaysIncludeKeywords.some((kw) =>
    jobTitleLower.includes(kw.toLowerCase())
  );

  // Check experience level - exclude senior roles unless it's an entry-level position
  if (!isEntryLevel) {
    const hasExcludedExperience = globalFilters.excludeExperienceKeywords.some((kw) =>
      jobTitleLower.includes(kw.toLowerCase())
    );
    
    if (hasExcludedExperience) {
      return false; // Exclude senior/lead/principal roles
    }
    
    // Check for experience years in title (e.g., "3+ years", "4 years")
    const experienceYearPattern = /(\d+)\+?\s*(?:years?|yrs?|yr)/i;
    const match = jobTitleLower.match(experienceYearPattern);
    if (match) {
      const years = parseInt(match[1], 10);
      if (years > globalFilters.maxExperienceYears) {
        return false; // Exclude jobs requiring more than maxExperienceYears
      }
    }
  }

  // Check job posting date - only include recent postings
  if (job.postedAt) {
    const postedDate = new Date(job.postedAt);
    const now = new Date();
    const daysSincePosted = (now - postedDate) / (1000 * 60 * 60 * 24);
    
    if (daysSincePosted > globalFilters.maxJobAgeDays) {
      return false; // Job is too old
    }
  }

  // Check visa-friendly (use company config if available, otherwise check filter list)
  const isVisaFriendly = company.visaFriendly !== undefined 
    ? company.visaFriendly 
    : globalFilters.visaFriendlyCompanies.includes(job.company);
  
  // Only return jobs from visa-friendly companies if filter is enabled
  if (globalFilters.requireVisaFriendly && !isVisaFriendly) {
    return false;
  }

  return true;
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
