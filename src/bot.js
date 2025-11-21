const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const logger = require('./utils/logger');
const { registerCommands } = require('./handlers/commands');

// Создание экземпляра бота
const bot = new TelegramBot(config.telegramToken, { polling: true });

// Регистрация обработчиков команд
registerCommands(bot);

// Обработка ошибок polling
bot.on('polling_error', (error) => {
    logger.error('Ошибка polling', error);
});

// Обработка ошибок webhook (если используется)
bot.on('webhook_error', (error) => {
    logger.error('Ошибка webhook', error);
});

// Логирование всех входящих сообщений (для отладки)
bot.on('message', (msg) => {
    if (!msg.text || !msg.text.startsWith('/')) {
        logger.info('Получено сообщение', {
            from: msg.from.username || msg.from.id,
            chat: msg.chat.id,
            type: msg.chat.type
        });
    }
});

// Запуск бота
logger.success('🤖 Telegram бот успешно запущен!');
logger.info('Ожидание команд...');

// Обработка завершения процесса
process.on('SIGINT', () => {
    logger.info('Получен сигнал SIGINT, завершение работы бота...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Получен сигнал SIGTERM, завершение работы бота...');
    bot.stopPolling();
    process.exit(0);
});

module.exports = bot;
