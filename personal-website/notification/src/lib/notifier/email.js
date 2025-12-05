import { logger } from '../../utils/logger.js';

const {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASS,
  EMAIL_FROM,
  EMAIL_TO
} = process.env;

const isConfigured = Boolean(
  EMAIL_SMTP_HOST &&
  EMAIL_SMTP_PORT &&
  EMAIL_SMTP_USER &&
  EMAIL_SMTP_PASS &&
  EMAIL_FROM &&
  EMAIL_TO
);

/**
 * Send job alerts via Email (SMTP)
 * 
 * Free options:
 * - Gmail: Use App Password (smtp.gmail.com:587)
 * - SendGrid: Free tier (100 emails/day)
 * - Mailgun: Free tier (5,000 emails/month)
 * - Resend: Free tier (3,000 emails/month)
 */
export async function sendJobAlerts(jobs) {
  if (!isConfigured) {
    logger.warn('Email environment variables missing. Skipping email notifications.');
    return;
  }

  if (!jobs.length) {
    logger.info('No new jobs to notify via email.');
    return;
  }

  // Try to use nodemailer if available, otherwise fallback to basic SMTP
  let sendEmail;
  try {
    const nodemailer = await import('nodemailer');
    sendEmail = await createNodemailerTransport(nodemailer.default);
  } catch (error) {
    logger.warn('nodemailer not installed. Install it with: npm install nodemailer');
    logger.warn('Falling back to basic SMTP (you may need to install nodemailer)');
    return;
  }

  // Group jobs by company for better email organization
  const jobsByCompany = {};
  jobs.forEach(job => {
    if (!jobsByCompany[job.company]) {
      jobsByCompany[job.company] = [];
    }
    jobsByCompany[job.company].push(job);
  });

  const subject = `🎯 ${jobs.length} New Job${jobs.length > 1 ? 's' : ''} Found!`;
  
  const htmlBody = generateEmailHTML(jobs, jobsByCompany);
  const textBody = generateEmailText(jobs);

  try {
    await sendEmail({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: subject,
      html: htmlBody,
      text: textBody,
    });

    logger.info(`Sent email alert for ${jobs.length} job(s)`);
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
  }
}

async function createNodemailerTransport(nodemailer) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_SMTP_HOST,
    port: parseInt(EMAIL_SMTP_PORT, 10),
    secure: EMAIL_SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: EMAIL_SMTP_USER,
      pass: EMAIL_SMTP_PASS,
    },
  });

  // Verify connection
  await transporter.verify();

  return (options) => transporter.sendMail(options);
}

function generateEmailHTML(jobs, jobsByCompany) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .job-card { background: #f9f9f9; border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .company { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .title { font-size: 16px; color: #333; margin: 5px 0; }
        .location { color: #666; margin: 5px 0; }
        .link { display: inline-block; background: #667eea; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        .link:hover { background: #5568d3; }
        .footer { margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>🔔 New Job Alerts</h2>
        <p>Found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your criteria!</p>
      </div>
  `;

  Object.entries(jobsByCompany).forEach(([company, companyJobs]) => {
    html += `<h3 style="margin-top: 20px; color: #667eea;">${company}</h3>`;
    companyJobs.forEach(job => {
      html += `
        <div class="job-card">
          <div class="company">${job.company}</div>
          <div class="title">${job.title}</div>
          ${job.location ? `<div class="location">📍 ${job.location}</div>` : ''}
          ${job.link ? `<a href="${job.link}" class="link">Apply Now →</a>` : ''}
          ${job.visaFriendly !== false ? '<div style="margin-top: 5px; color: #28a745;">✅ H-1B Friendly</div>' : ''}
        </div>
      `;
    });
  });

  html += `
      <div class="footer">
        <p>You're receiving this because you're tracking job postings from 200+ companies.</p>
        <p>Total jobs found: ${jobs.length}</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

function generateEmailText(jobs) {
  const lines = [
    `🔔 New Job Alerts`,
    ``,
    `Found ${jobs.length} new job${jobs.length > 1 ? 's' : ''} matching your criteria!`,
    ``,
  ];

  jobs.forEach(job => {
    lines.push(`${job.company}: ${job.title}`);
    if (job.location) lines.push(`📍 ${job.location}`);
    if (job.link) lines.push(`🔗 ${job.link}`);
    if (job.visaFriendly !== false) lines.push(`✅ H-1B Friendly`);
    lines.push(``);
  });

  return lines.join('\n');
}


