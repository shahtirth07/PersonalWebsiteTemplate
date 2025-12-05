import fetch from 'node-fetch';
import { logger } from '../../utils/logger.js';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

const isConfigured = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

/**
 * Send job alerts via Telegram Bot
 * 
 * Setup:
 * 1. Message @BotFather on Telegram
 * 2. Send /newbot and follow instructions
 * 3. Copy the bot token
 * 4. Start a chat with your bot
 * 5. Get your chat ID: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
 * 6. Send a message to your bot, then check the response - your chat ID is in "chat":{"id":123456789}
 */
export async function sendJobAlerts(jobs) {
  if (!isConfigured) {
    logger.warn('Telegram environment variables missing. Skipping Telegram notifications.');
    return;
  }

  if (!jobs.length) {
    logger.info('No new jobs to notify via Telegram.');
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  // Send individual messages for each job (Telegram allows up to 4096 chars per message)
  for (const job of jobs) {
    try {
      const message = formatJobMessage(job);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML', // Allows basic HTML formatting
          disable_web_page_preview: false, // Show link previews
        }),
      });

      const data = await response.json();

      if (data.ok) {
        logger.info(`Sent Telegram alert for ${job.company} - ${job.title}`);
      } else {
        logger.error(`Telegram API error: ${data.description}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      logger.error(`Error sending Telegram message: ${error.message}`);
    }
  }
}

function formatJobMessage(job) {
  const pieces = [
    `🔔 <b>New Job Alert</b>`,
    ``,
    `<b>${job.company}</b>`,
    `📋 ${job.title}`,
    job.location ? `📍 ${job.location}` : '',
    job.link ? `🔗 <a href="${job.link}">Apply Here</a>` : '',
    job.visaFriendly !== false ? '✅ H-1B Friendly' : '',
    ``,
    `<code>#JOB_ID:${job.jobId}#</code>` // Hidden job ID for tracking
  ].filter(Boolean);

  return pieces.join('\n');
}

