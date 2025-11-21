const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class MessageStore {
    constructor() {
        this.dataDir = path.join(__dirname, '../../data');
        this.storePath = path.join(this.dataDir, 'messages.json');
        this.messages = new Map();
        this.ensureDataDir();
        this.load();
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    load() {
        try {
            if (fs.existsSync(this.storePath)) {
                const data = fs.readFileSync(this.storePath, 'utf8');
                const parsed = JSON.parse(data);
                this.messages = new Map(Object.entries(parsed));
                logger.info(`Загружено ${this.messages.size} сообщений из хранилища`);
            }
        } catch (error) {
            logger.error('Ошибка загрузки хранилища сообщений', error);
        }
    }

    save() {
        try {
            const data = Object.fromEntries(this.messages);
            fs.writeFileSync(this.storePath, JSON.stringify(data, null, 2));
        } catch (error) {
            logger.error('Ошибка сохранения хранилища сообщений', error);
        }
    }

    /**
     * Сохранить информацию о сообщении
     * @param {string} key - Уникальный ключ (например, "chatId:messageId")
     * @param {object} messageInfo - Информация о сообщении
     */
    store(key, messageInfo) {
        this.messages.set(key, {
            ...messageInfo,
            timestamp: new Date().toISOString()
        });
        this.save();
    }

    /**
     * Получить информацию о сообщении
     * @param {string} key - Ключ сообщения
     * @returns {object|null}
     */
    get(key) {
        return this.messages.get(key) || null;
    }

    /**
     * Получить все сообщения для определенного чата
     * @param {string|number} chatId - ID чата
     * @returns {Array}
     */
    getByChatId(chatId) {
        const results = [];
        for (const [key, value] of this.messages.entries()) {
            if (value.chatId === chatId.toString()) {
                results.push({ key, ...value });
            }
        }
        return results;
    }

    /**
     * Удалить сообщение из хранилища
     * @param {string} key - Ключ сообщения
     */
    delete(key) {
        this.messages.delete(key);
        this.save();
    }

    /**
     * Получить последнее сообщение для чата
     * @param {string|number} chatId - ID чата
     * @returns {object|null}
     */
    getLastMessage(chatId) {
        const messages = this.getByChatId(chatId);
        if (messages.length === 0) return null;

        return messages.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
    }
}

module.exports = new MessageStore();
