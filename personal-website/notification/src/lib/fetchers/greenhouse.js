import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

/**
 * Fetch jobs from Greenhouse ATS
 * 
 * Greenhouse API: https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs
 * 
 * @param {Object} companyConfig - Company configuration object
 * @returns {Promise<Array>} Array of job postings
 */
export async function fetchGreenhouseJobs(companyConfig) {
  try {
    // Extract company slug from apiEndpoint
    // apiEndpoint format: "https://boards.greenhouse.io/companyname"
    let companySlug = null;
    
    if (companyConfig.apiEndpoint) {
      // Extract slug from URL like "https://boards.greenhouse.io/shopify"
      const match = companyConfig.apiEndpoint.match(/boards\.greenhouse\.io\/([^/?]+)/);
      if (match) {
        companySlug = match[1];
      }
    }
    
    if (!companySlug) {
      logger.warn(`Could not determine Greenhouse slug for ${companyConfig.name}`);
      return [];
    }

    const url = `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs`;
    logger.debug(`Fetching Greenhouse jobs for ${companyConfig.name} from ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTracker/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        logger.debug(`No Greenhouse board found for ${companyConfig.name} (404)`);
        return [];
      }
      logger.warn(`Greenhouse API returned ${response.status} for ${companyConfig.name}`);
      return [];
    }

    const data = await response.json();
    
    if (!data.jobs || !Array.isArray(data.jobs)) {
      logger.warn(`Unexpected Greenhouse API response format for ${companyConfig.name}`);
      return [];
    }

    const jobs = data.jobs.map(job => ({
      title: job.title || 'Unknown Position',
      location: job.location?.name || job.locations?.[0]?.name || '',
      jobId: job.id?.toString() || `${companyConfig.name}-${job.title || ''}`,
      link: job.absolute_url || job.url || companyConfig.careerUrl,
      postedAt: job.updated_at || job.created_at || new Date().toISOString(),
      department: job.departments?.[0]?.name || '',
      office: job.offices?.[0]?.name || ''
    }));

    logger.info(`Found ${jobs.length} jobs for ${companyConfig.name} via Greenhouse`);
    return jobs;

  } catch (error) {
    logger.error(`Error fetching Greenhouse jobs for ${companyConfig.name}: ${error.message}`);
    return [];
  }
}

