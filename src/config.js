require('dotenv').config();

const config = {
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  defaultChatId: process.env.DEFAULT_CHAT_ID || null,
};

// Validate required configuration
if (!config.telegramToken) {
  console.error('❌ ОШИБКА: TELEGRAM_BOT_TOKEN не установлен в файле .env');
  console.error('Пожалуйста, создайте файл .env на основе .env.example и добавьте токен бота');
  process.exit(1);
}

module.exports = config;
