# Career Tracker Notification Service

This directory contains a comprehensive job-tracking pipeline that monitors **200+ top tech companies** and:

1. Polls career websites across multiple ATS types (Workday, Greenhouse, Lever, and custom portals).
2. Normalizes and filters postings that match your profile (keywords, location, visa-friendly).
3. Sends **free notifications** via Telegram, Email, or Discord (or paid SMS via Twilio) whenever new matching roles appear.
4. Tracks companies organized by priority (1 = highest, checked more frequently).

## Project layout

```
notification/
├── README.md
├── package.json
├── .env.example
└── src
    ├── run.js                 # Orchestrates a single poll + notify cycle
    ├── config
    │   ├── companies.js       # Company-specific metadata (ATS type, keywords, frequency)
    │   └── filters.js         # Global keyword / location filters
    ├── lib
    │   ├── fetchers
    │   │   ├── workday.js     # Workday scraper placeholder
    │   │   ├── greenhouse.js  # Greenhouse scraper placeholder
    │   │   └── custom.js      # Vendor-specific fallbacks (Amazon, Apple, etc.)
    │   ├── notifier
    │   │   ├── index.js       # Unified notification router
    │   │   ├── telegram.js    # Telegram Bot notifications (FREE)
    │   │   ├── email.js       # Email notifications (FREE)
    │   │   ├── discord.js     # Discord webhook notifications (FREE)
    │   │   └── sms.js         # Twilio SMS delivery (PAID)
    │   └── storage
    │       └── memoryStore.js # In-memory dedup (swap for Supabase/Postgres later)
    └── utils
        └── logger.js
```

## Getting started

```bash
cd notification
npm install
cp env.example .env        # configure your preferred notification method
npm start                   # runs one crawl + notification pass
```

### Notification Methods (Choose One)

#### 🟢 **Telegram Bot (Recommended - FREE)**
- **Setup**: Message @BotFather on Telegram → `/newbot` → copy token
- **Get Chat ID**: Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` after messaging your bot
- **Pros**: Free, instant push notifications, works on mobile, no rate limits
- **Variables**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

#### 📧 **Email (FREE)**
- **Options**: Gmail (App Password), SendGrid (100/day free), Mailgun (5K/month free), Resend (3K/month free)
- **Setup**: Configure SMTP settings in `.env`
- **Pros**: Free, reliable, can use existing email
- **Variables**: `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASS`, `EMAIL_FROM`, `EMAIL_TO`
- **Note**: Install `nodemailer` for email: `npm install nodemailer`

#### 💬 **Discord Webhook (FREE)**
- **Setup**: Discord Server → Integrations → Webhooks → Create webhook → Copy URL
- **Pros**: Free, instant notifications, rich embeds, works on mobile
- **Variables**: `DISCORD_WEBHOOK_URL`

#### 📱 **SMS via Twilio (PAID)**
- **Setup**: Create Twilio account, get credentials
- **Pros**: Native SMS, works on any phone
- **Variables**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` or `TWILIO_FROM_NUMBER`, `TARGET_PHONE_NUMBER`

### Configuration

Set `NOTIFICATION_METHOD` in `.env` to one of:
- `telegram` (recommended)
- `email`
- `discord`
- `sms` (requires Twilio account)
- `all` (sends to all configured methods)

See `env.example` for all configuration options.

> **Note:** The current implementation keeps a short-term in-memory cache (`memoryStore.js`). For a production setup replace it with Supabase/Postgres so the crawler can run across multiple nodes and remember past alerts.

## Scheduler options

- **Supabase Edge Function** – deploy `src/run.js` inside an Edge Function and invoke via Scheduled Triggers.
- **Vercel Cron / AWS Lambda** – wrap `run.js` inside a handler and call it via `vercel.json` cron or EventBridge.
- **GitHub Actions** – run `node src/run.js` on a schedule; store state in Supabase/S3.

## Company Coverage

The system monitors **200+ companies** organized by ATS type:

- **Workday** (~60 companies): Google, Meta, Microsoft, Apple, Amazon, Netflix, NVIDIA, etc.
- **Greenhouse** (~120 companies): Stripe, Airbnb, Palantir, Databricks, Anthropic, OpenAI, etc.
- **Lever** (~5 companies): LinkedIn, Snap, Bloomberg, GitHub, Red Hat
- **Custom** (~20 companies): Amazon, Apple, Jane Street, Citadel, Two Sigma, etc.

Companies are prioritized (1-5) with priority 1 companies checked more frequently.

## Extending the collectors

- Start by implementing `fetchWorkdayJobs` / `fetchGreenhouseJobs` / `fetchLeverJobs` to hit official JSON endpoints.
- Add custom scrapers for Amazon, Apple, IBM, NVIDIA, etc. inside `fetchCustomJobs`.
- For each company in `companies.js`, set `ats` property to control which fetcher runs.
- The fetchers should return normalized job objects:

```js
{
  company: 'Netflix',
  title: 'Software Engineer, ML',
  location: 'Los Gatos, CA',
  jobId: 'R-123456',
  postedAt: '2024-12-19T00:00:00Z',
  link: 'https://jobs.netflix.com/...'
}
```

## Notification flow

1. `run.js` loads company configs and filters.
2. For each company, it calls the relevant fetcher and de-duplicates jobs against the in-memory store.
3. Filtered "new" jobs are sent via the configured notification method(s).
4. The unified notifier (`notifier/index.js`) routes to Telegram, Email, Discord, or SMS based on `NOTIFICATION_METHOD`.

## Next steps

- Swap `memoryStore` with Supabase/Postgres.
- Wire collectors to real endpoints (Workday pagination, Greenhouse board API, Amazon Jobs API).
- Add retries/backoff, request throttling, and logging to Supabase/Logflare.
- Hook into your website’s “Career Tracker” section via a REST/GraphQL endpoint.
*** End Patch```} to=functions.apply_patch ***!

