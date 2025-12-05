import 'dotenv/config';
import fetch from 'node-fetch';

const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('❌ Missing Telegram configuration!');
  console.log('\nPlease set in .env file:');
  console.log('  TELEGRAM_BOT_TOKEN=your_bot_token');
  console.log('  TELEGRAM_CHAT_ID=your_chat_id');
  console.log('\nSee TELEGRAM_SETUP.md for instructions.');
  process.exit(1);
}

console.log('🧪 Testing Telegram connection...\n');

const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
const testMessage = `🔔 Test notification from Job Tracker!\n\nIf you see this, your Telegram setup is working correctly! ✅`;

try {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: testMessage,
    }),
  });

  const data = await response.json();

  if (data.ok) {
    console.log('✅ SUCCESS! Check your Telegram - you should have received a test message!');
    console.log(`\nBot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`Chat ID: ${TELEGRAM_CHAT_ID}`);
  } else {
    console.error('❌ FAILED to send message');
    console.error('Error:', data.description);
    
    if (data.description?.includes('chat not found')) {
      console.log('\n💡 Tip: Make sure you\'ve sent at least one message to your bot first!');
    } else if (data.description?.includes('Unauthorized')) {
      console.log('\n💡 Tip: Check that your bot token is correct!');
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Check your internet connection and try again.');
}


