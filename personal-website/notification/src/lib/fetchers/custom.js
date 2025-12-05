import { logger } from '../../utils/logger.js';

const fetcherMap = {
  amazon: async () => {
    logger.info('(stub) Amazon jobs');
    return [];
  },
  nvidia: async () => {
    logger.info('(stub) NVIDIA jobs');
    return [];
  },
  ibm: async () => {
    logger.info('(stub) IBM jobs');
    return [];
  }
};

export async function fetchCustomJobs(companyConfig) {
  const handler = fetcherMap[companyConfig.customFetcher];
  if (!handler) {
    logger.warn(`No custom fetcher registered for ${companyConfig.name}`);
    return [];
  }
  return handler(companyConfig);
}

