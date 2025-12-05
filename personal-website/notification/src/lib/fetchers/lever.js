import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

/**
 * Fetch jobs from Lever ATS
 * Lever API: https://api.lever.co/v0/postings/{company}
 * 
 * @param {Object} companyConfig - Company configuration object
 * @returns {Promise<Array>} Array of job postings
 */
export async function fetchLeverJobs(companyConfig) {
  logger.info(`Fetching Lever jobs for ${companyConfig.name}`);

  try {
    // Extract company slug from API endpoint or career URL
    let companySlug = null;
    
    if (companyConfig.apiEndpoint) {
      // Extract from endpoint like: https://api.lever.co/v0/postings/linkedin
      const match = companyConfig.apiEndpoint.match(/postings\/([^/?]+)/);
      if (match) {
        companySlug = match[1];
      }
    }
    
    // Fallback: try to extract from career URL
    if (!companySlug && companyConfig.careerUrl) {
      const urlMatch = companyConfig.careerUrl.match(/lever\.co\/v0\/postings\/([^/?]+)/);
      if (urlMatch) {
        companySlug = urlMatch[1];
      } else {
        // Try common patterns
        const domainMatch = companyConfig.careerUrl.match(/https?:\/\/(?:www\.)?([^./]+)/);
        if (domainMatch) {
          companySlug = domainMatch[1].toLowerCase();
        }
      }
    }

    if (!companySlug) {
      logger.warn(`Could not determine Lever slug for ${companyConfig.name}`);
      return [];
    }

    const url = `https://api.lever.co/v0/postings/${companySlug}`;
    logger.debug(`Fetching from: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobTracker/1.0)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      logger.warn(`Lever API returned ${response.status} for ${companyConfig.name}`);
      return [];
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      logger.warn(`Unexpected Lever API response format for ${companyConfig.name}`);
      return [];
    }

    return data.map(job => ({
      title: job.text || job.title || 'Unknown',
      location: job.categories?.location || job.location || '',
      jobId: job.id || `${companyConfig.name}-${job.text || ''}`,
      link: job.hostedUrl || job.applyUrl || `${companyConfig.careerUrl}/${job.id}`,
      postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
      description: job.descriptionPlain || job.description || '',
      team: job.categories?.team || '',
      commitment: job.categories?.commitment || ''
    }));

  } catch (error) {
    logger.error(`Error fetching Lever jobs for ${companyConfig.name}: ${error.message}`);
    return [];
  }
}


