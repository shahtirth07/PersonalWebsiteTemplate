import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

const { DISCORD_WEBHOOK_URL } = process.env;

const isConfigured = Boolean(DISCORD_WEBHOOK_URL);

/**
 * Send job alerts via Discord Webhook
 * 
 * Setup:
 * 1. Go to your Discord server settings
 * 2. Navigate to Integrations > Webhooks
 * 3. Create a new webhook
 * 4. Copy the webhook URL
 * 5. Set DISCORD_WEBHOOK_URL in your .env file
 */
export async function sendJobAlerts(jobs) {
  if (!isConfigured) {
    logger.warn('Discord webhook URL missing. Skipping Discord notifications.');
    return;
  }

  if (!jobs.length) {
    logger.info('No new jobs to notify via Discord.');
    return;
  }

  // Discord webhooks have a 2000 character limit per message
  // Group jobs into batches if needed
  const batches = [];
  let currentBatch = [];
  let currentLength = 0;

  for (const job of jobs) {
    const jobMessage = formatJobMessage(job);
    const jobLength = jobMessage.length;

    // If adding this job would exceed limit, start a new batch
    if (currentLength + jobLength > 1800 && currentBatch.length > 0) {
      batches.push(currentBatch);
      currentBatch = [job];
      currentLength = jobLength;
    } else {
      currentBatch.push(job);
      currentLength += jobLength + 10; // Add some buffer for separators
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  // Send each batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const message = formatBatchMessage(batch, i + 1, batches.length);

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          username: 'Job Tracker Bot',
          embeds: batch.map(job => ({
            title: `${job.company}: ${job.title}`,
            description: job.location || 'Location not specified',
            url: job.link || null,
            color: job.visaFriendly !== false ? 0x28a745 : 0x6c757d,
            fields: [
              {
                name: 'Location',
                value: job.location || 'Not specified',
                inline: true,
              },
              {
                name: 'Visa Friendly',
                value: job.visaFriendly !== false ? '✅ Yes' : '❌ No',
                inline: true,
              },
            ],
            footer: {
              text: 'Job Tracker Notification Service',
            },
            timestamp: new Date().toISOString(),
          })),
        }),
      });

      if (response.ok) {
        logger.info(`Sent Discord alert for batch ${i + 1}/${batches.length} (${batch.length} jobs)`);
      } else {
        const errorText = await response.text();
        logger.error(`Discord webhook error: ${response.status} - ${errorText}`);
      }

      // Rate limiting: Discord allows 5 requests per 5 seconds
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
    } catch (error) {
      logger.error(`Error sending Discord message: ${error.message}`);
    }
  }
}

function formatJobMessage(job) {
  const pieces = [
    `**${job.company}**: ${job.title}`,
    job.location ? `📍 ${job.location}` : '',
    job.link ? `🔗 ${job.link}` : '',
    job.visaFriendly !== false ? '✅ H-1B Friendly' : ''
  ].filter(Boolean);

  return pieces.join('\n');
}

function formatBatchMessage(batch, batchNum, totalBatches) {
  const header = totalBatches > 1 
    ? `🔔 **New Job Alerts (Batch ${batchNum}/${totalBatches})**`
    : `🔔 **New Job Alerts**`;
  
  return `${header}\n\nFound ${batch.length} new job${batch.length > 1 ? 's' : ''}!`;
}


