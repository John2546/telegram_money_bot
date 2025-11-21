const logger = require('../utils/logger');
const messageStore = require('../utils/messageStore');

/**
 * Публикация сообщения в канал или группу
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {string} text - Текст сообщения
 * @param {object} options - Дополнительные опции (parse_mode, reply_markup и т.д.)
 * @returns {Promise<object>} - Информация об отправленном сообщении
 */
async function postMessage(bot, chatId, text, options = {}) {
    try {
        logger.info(`Публикация сообщения в чат ${chatId}`);

        const message = await bot.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            ...options
        });

        // Сохранить информацию о сообщении
        const key = `${chatId}:${message.message_id}`;
        messageStore.store(key, {
            chatId: chatId.toString(),
            messageId: message.message_id,
            text: text,
            type: 'text'
        });

        logger.success(`Сообщение успешно опубликовано`, {
            chatId,
            messageId: message.message_id
        });

        return message;
    } catch (error) {
        logger.error(`Ошибка публикации сообщения в чат ${chatId}`, error);
        throw error;
    }
}

/**
 * Публикация фото в канал или группу
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {string} photo - URL или file_id фото
 * @param {object} options - Дополнительные опции (caption, parse_mode и т.д.)
 * @returns {Promise<object>} - Информация об отправленном сообщении
 */
async function postPhoto(bot, chatId, photo, options = {}) {
    try {
        logger.info(`Публикация фото в чат ${chatId}`);

        const message = await bot.sendPhoto(chatId, photo, {
            parse_mode: 'HTML',
            ...options
        });

        const key = `${chatId}:${message.message_id}`;
        messageStore.store(key, {
            chatId: chatId.toString(),
            messageId: message.message_id,
            photo: photo,
            caption: options.caption || '',
            type: 'photo'
        });

        logger.success(`Фото успешно опубликовано`, {
            chatId,
            messageId: message.message_id
        });

        return message;
    } catch (error) {
        logger.error(`Ошибка публикации фото в чат ${chatId}`, error);
        throw error;
    }
}

/**
 * Публикация видео в канал или группу
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {string} video - URL или file_id видео
 * @param {object} options - Дополнительные опции
 * @returns {Promise<object>} - Информация об отправленном сообщении
 */
async function postVideo(bot, chatId, video, options = {}) {
    try {
        logger.info(`Публикация видео в чат ${chatId}`);

        const message = await bot.sendVideo(chatId, video, {
            parse_mode: 'HTML',
            ...options
        });

        const key = `${chatId}:${message.message_id}`;
        messageStore.store(key, {
            chatId: chatId.toString(),
            messageId: message.message_id,
            video: video,
            caption: options.caption || '',
            type: 'video'
        });

        logger.success(`Видео успешно опубликовано`, {
            chatId,
            messageId: message.message_id
        });

        return message;
    } catch (error) {
        logger.error(`Ошибка публикации видео в чат ${chatId}`, error);
        throw error;
    }
}

module.exports = {
    postMessage,
    postPhoto,
    postVideo
};
