import { logger } from '../../utils/logger.js';
import { sendJobAlerts as sendTelegram } from './telegram.js';
import { sendJobAlerts as sendEmail } from './email.js';
import { sendJobAlerts as sendDiscord } from './discord.js';
import { sendJobAlerts as sendSMS } from './sms.js';

const { NOTIFICATION_METHOD } = process.env;

/**
 * Unified notification system supporting multiple backends
 * 
 * Set NOTIFICATION_METHOD to one of:
 * - 'telegram' (recommended - free, instant, mobile notifications)
 * - 'email' (free with Gmail/SMTP)
 * - 'discord' (free webhook notifications)
 * - 'sms' (Twilio - requires paid account)
 * - 'all' (send to all configured methods)
 */
export async function sendJobAlerts(jobs) {
  if (!jobs || jobs.length === 0) {
    logger.info('No jobs to notify.');
    return;
  }

  const method = (NOTIFICATION_METHOD || 'telegram').toLowerCase();
  const methods = method === 'all' 
    ? ['telegram', 'email', 'discord', 'sms']
    : [method];

  logger.info(`Sending notifications via: ${methods.join(', ')}`);

  const promises = [];

  if (methods.includes('telegram')) {
    promises.push(sendTelegram(jobs).catch(err => 
      logger.error(`Telegram notification failed: ${err.message}`)
    ));
  }

  if (methods.includes('email')) {
    promises.push(sendEmail(jobs).catch(err => 
      logger.error(`Email notification failed: ${err.message}`)
    ));
  }

  if (methods.includes('discord')) {
    promises.push(sendDiscord(jobs).catch(err => 
      logger.error(`Discord notification failed: ${err.message}`)
    ));
  }

  if (methods.includes('sms')) {
    promises.push(sendSMS(jobs).catch(err => 
      logger.error(`SMS notification failed: ${err.message}`)
    ));
  }

  await Promise.allSettled(promises);
  logger.info('Notification round complete.');
}


