#!/usr/bin/env node
/**
 * Query the jobs database
 * Usage: node src/utils/queryDB.js [options]
 * 
 * Examples:
 *   node src/utils/queryDB.js --stats
 *   node src/utils/queryDB.js --company "Google"
 *   node src/utils/queryDB.js --recent 10
 *   node src/utils/queryDB.js --not-notified
 */

import { dbStore } from '../lib/storage/dbStore.js';
import { logger } from './logger.js';

const args = process.argv.slice(2);

async function main() {
  if (args.includes('--stats')) {
    const stats = dbStore.getStats();
    console.log('\n📊 Database Statistics:');
    console.log(`Total Jobs: ${stats.totalJobs}`);
    console.log(`Notified: ${stats.notified}`);
    console.log(`Not Notified: ${stats.notNotified}`);
    console.log(`Oldest Job: ${stats.oldestJob ? stats.oldestJob.toLocaleString() : 'N/A'}`);
    console.log(`Newest Job: ${stats.newestJob ? stats.newestJob.toLocaleString() : 'N/A'}`);
    
    if (stats.topCompanies && stats.topCompanies.length > 0) {
      console.log('\n🏢 Top Companies:');
      stats.topCompanies.forEach(({ company, count }) => {
        console.log(`  ${company}: ${count} jobs`);
      });
    }
  } else if (args.includes('--company')) {
    const companyIndex = args.indexOf('--company');
    const company = args[companyIndex + 1];
    if (!company) {
      console.error('Error: --company requires a company name');
      process.exit(1);
    }
    
    const jobs = dbStore.getJobs({ company });
    console.log(`\n📋 Jobs for ${company}: ${jobs.length}`);
    jobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.title}`);
      console.log(`   Location: ${job.location || 'N/A'}`);
      console.log(`   Link: ${job.link || 'N/A'}`);
      console.log(`   Stored: ${new Date(job.storedAt).toLocaleString()}`);
      console.log(`   Notified: ${job.notifiedAt ? new Date(job.notifiedAt).toLocaleString() : 'No'}`);
    });
  } else if (args.includes('--recent')) {
    const recentIndex = args.indexOf('--recent');
    const limit = parseInt(args[recentIndex + 1]) || 10;
    
    const jobs = dbStore.getJobs({ limit });
    console.log(`\n📋 Recent ${limit} Jobs:`);
    jobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.company} - ${job.title}`);
      console.log(`   Location: ${job.location || 'N/A'}`);
      console.log(`   Stored: ${new Date(job.storedAt).toLocaleString()}`);
    });
  } else if (args.includes('--not-notified')) {
    const jobs = dbStore.getJobs({ notified: false });
    console.log(`\n📋 Jobs Not Yet Notified: ${jobs.length}`);
    jobs.forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.company} - ${job.title}`);
      console.log(`   Location: ${job.location || 'N/A'}`);
      console.log(`   Link: ${job.link || 'N/A'}`);
    });
  } else {
    console.log(`
Usage: node src/utils/queryDB.js [options]

Options:
  --stats              Show database statistics
  --company <name>     Show jobs for a specific company
  --recent <n>         Show recent N jobs (default: 10)
  --not-notified       Show jobs that haven't been notified yet

Examples:
  node src/utils/queryDB.js --stats
  node src/utils/queryDB.js --company "Google"
  node src/utils/queryDB.js --recent 20
  node src/utils/queryDB.js --not-notified
    `);
  }
  
  dbStore.close();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});

