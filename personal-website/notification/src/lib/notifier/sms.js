import twilio from 'twilio';
import { logger } from '../../utils/logger.js';

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
  TWILIO_FROM_NUMBER,
  TARGET_PHONE_NUMBER
} = process.env;

const isConfigured = Boolean(
  TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    (TWILIO_MESSAGING_SERVICE_SID || TWILIO_FROM_NUMBER) &&
    TARGET_PHONE_NUMBER
);

const client = isConfigured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

export async function sendJobAlerts(jobs) {
  if (!isConfigured) {
    logger.warn('Twilio environment variables missing. Skipping SMS send.');
    return;
  }

  if (!jobs.length) {
    logger.info('No new jobs to notify.');
    return;
  }

  for (const job of jobs) {
    const message = formatJobMessage(job);
    await client.messages.create({
      to: TARGET_PHONE_NUMBER,
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID || undefined,
      from: TWILIO_MESSAGING_SERVICE_SID ? undefined : TWILIO_FROM_NUMBER,
      body: message
    });
    logger.info(`Sent SMS alert for ${job.company} - ${job.title}`);
  }
}

function formatJobMessage(job) {
  const pieces = [
    `${job.company}: ${job.title}`,
    job.location ? `📍 ${job.location}` : '',
    job.link ? job.link : '',
    job.visaFriendly ? '✅ H-1B Friendly' : ''
  ].filter(Boolean);

  return pieces.join('\n');
}


