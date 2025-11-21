const logger = require('../utils/logger');
const messageStore = require('../utils/messageStore');

/**
 * Редактирование текстового сообщения
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {number} messageId - ID сообщения для редактирования
 * @param {string} newText - Новый текст
 * @param {object} options - Дополнительные опции
 * @returns {Promise<object>} - Информация об отредактированном сообщении
 */
async function editMessageText(bot, chatId, messageId, newText, options = {}) {
    try {
        logger.info(`Редактирование сообщения ${messageId} в чате ${chatId}`);

        const message = await bot.editMessageText(newText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        });

        // Обновить информацию в хранилище
        const key = `${chatId}:${messageId}`;
        const stored = messageStore.get(key);
        if (stored) {
            messageStore.store(key, {
                ...stored,
                text: newText,
                lastEdited: new Date().toISOString()
            });
        }

        logger.success(`Сообщение успешно отредактировано`, {
            chatId,
            messageId
        });

        return message;
    } catch (error) {
        logger.error(`Ошибка редактирования сообщения ${messageId} в чате ${chatId}`, error);

        if (error.response && error.response.body) {
            const errorBody = error.response.body;
            if (errorBody.description.includes('message is not modified')) {
                throw new Error('Сообщение не изменено: новый текст идентичен старому');
            } else if (errorBody.description.includes('message to edit not found')) {
                throw new Error('Сообщение не найдено. Возможно, оно было удалено');
            } else if (errorBody.description.includes('message can\'t be edited')) {
                throw new Error('Сообщение не может быть отредактировано (прошло более 48 часов)');
            }
        }

        throw error;
    }
}

/**
 * Редактирование подписи к медиа (фото, видео)
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {number} messageId - ID сообщения
 * @param {string} newCaption - Новая подпись
 * @param {object} options - Дополнительные опции
 * @returns {Promise<object>}
 */
async function editMessageCaption(bot, chatId, messageId, newCaption, options = {}) {
    try {
        logger.info(`Редактирование подписи сообщения ${messageId} в чате ${chatId}`);

        const message = await bot.editMessageCaption(newCaption, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        });

        const key = `${chatId}:${messageId}`;
        const stored = messageStore.get(key);
        if (stored) {
            messageStore.store(key, {
                ...stored,
                caption: newCaption,
                lastEdited: new Date().toISOString()
            });
        }

        logger.success(`Подпись успешно отредактирована`, {
            chatId,
            messageId
        });

        return message;
    } catch (error) {
        logger.error(`Ошибка редактирования подписи сообщения ${messageId}`, error);
        throw error;
    }
}

/**
 * Удаление сообщения
 * @param {TelegramBot} bot - Экземпляр бота
 * @param {string|number} chatId - ID чата/канала
 * @param {number} messageId - ID сообщения
 * @returns {Promise<boolean>}
 */
async function deleteMessage(bot, chatId, messageId) {
    try {
        logger.info(`Удаление сообщения ${messageId} из чата ${chatId}`);

        const result = await bot.deleteMessage(chatId, messageId);

        // Удалить из хранилища
        const key = `${chatId}:${messageId}`;
        messageStore.delete(key);

        logger.success(`Сообщение успешно удалено`, {
            chatId,
            messageId
        });

        return result;
    } catch (error) {
        logger.error(`Ошибка удаления сообщения ${messageId}`, error);
        throw error;
    }
}

module.exports = {
    editMessageText,
    editMessageCaption,
    deleteMessage
};
