const logger = require('../utils/logger');
const messageStore = require('../utils/messageStore');
const { postMessage, postPhoto, postVideo } = require('./postMessage');
const { editMessageText, editMessageCaption, deleteMessage } = require('./editMessage');

/**
 * Обработчик команды /start
 */
function handleStart(bot, msg) {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 <b>Добро пожаловать в бота для управления каналами и группами!</b>

Этот бот позволяет публиковать и редактировать сообщения в ваших каналах и группах Telegram.

<b>Доступные команды:</b>
/help - Показать справку по командам
/getchatid - Получить ID текущего чата
/post - Опубликовать сообщение
/edit - Редактировать сообщение
/delete - Удалить сообщение
/last - Показать последнее сообщение в чате

<b>Важно:</b>
• Добавьте бота в канал/группу как администратора
• Используйте команды для публикации и редактирования
• Все сообщения сохраняются для удобного редактирования
  `;

    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'HTML' });
    logger.info(`Пользователь ${msg.from.username || msg.from.id} запустил бота`);
}

/**
 * Обработчик команды /help
 */
function handleHelp(bot, msg) {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 <b>Справка по командам</b>

<b>Получение информации:</b>
/getchatid - Получить ID текущего чата (используйте в группе/канале)

<b>Публикация сообщений:</b>
/post &lt;chat_id&gt; &lt;текст&gt; - Опубликовать текстовое сообщение
Пример: <code>/post -1001234567890 Привет, мир!</code>

<b>Редактирование сообщений:</b>
/edit &lt;chat_id&gt; &lt;message_id&gt; &lt;новый_текст&gt; - Редактировать сообщение
Пример: <code>/edit -1001234567890 123 Обновленный текст</code>

/last &lt;chat_id&gt; - Показать последнее сообщение
Пример: <code>/last -1001234567890</code>

<b>Удаление сообщений:</b>
/delete &lt;chat_id&gt; &lt;message_id&gt; - Удалить сообщение
Пример: <code>/delete -1001234567890 123</code>

<b>Форматирование текста:</b>
Используйте HTML-теги:
• &lt;b&gt;жирный&lt;/b&gt; - <b>жирный</b>
• &lt;i&gt;курсив&lt;/i&gt; - <i>курсив</i>
• &lt;code&gt;код&lt;/code&gt; - <code>код</code>
• &lt;a href="url"&gt;ссылка&lt;/a&gt; - ссылка

<b>Как получить chat_id:</b>
1. Добавьте бота в канал/группу как администратора
2. Отправьте команду /getchatid в канал/группу
3. Бот отправит вам ID в личные сообщения
  `;

    bot.sendMessage(chatId, helpMessage, { parse_mode: 'HTML' });
}

/**
 * Обработчик команды /getchatid
 */
function handleGetChatId(bot, msg) {
    const chatId = msg.chat.id;
    const chatType = msg.chat.type;
    const chatTitle = msg.chat.title || 'Личный чат';

    let message = `
📍 <b>Информация о чате</b>

<b>Название:</b> ${chatTitle}
<b>Тип:</b> ${chatType}
<b>Chat ID:</b> <code>${chatId}</code>

Используйте этот ID для публикации сообщений через команду /post
  `;

    bot.sendMessage(msg.from.id, message, { parse_mode: 'HTML' })
        .then(() => {
            if (chatType !== 'private') {
                bot.sendMessage(chatId, '✅ ID чата отправлен вам в личные сообщения');
            }
        })
        .catch((error) => {
            bot.sendMessage(chatId, '❌ Не могу отправить вам сообщение. Пожалуйста, начните диалог с ботом командой /start');
            logger.error('Ошибка отправки chat_id', error);
        });
}

/**
 * Обработчик команды /post
 */
async function handlePost(bot, msg) {
    const chatId = msg.chat.id;
    const args = msg.text.split(' ').slice(1);

    if (args.length < 2) {
        bot.sendMessage(chatId,
            '❌ Неверный формат команды.\n\n' +
            'Используйте: <code>/post &lt;chat_id&gt; &lt;текст&gt;</code>\n' +
            'Пример: <code>/post -1001234567890 Привет!</code>',
            { parse_mode: 'HTML' }
        );
        return;
    }

    const targetChatId = args[0];
    const text = args.slice(1).join(' ');

    try {
        const message = await postMessage(bot, targetChatId, text);
        bot.sendMessage(chatId,
            `✅ Сообщение успешно опубликовано!\n\n` +
            `<b>Chat ID:</b> <code>${targetChatId}</code>\n` +
            `<b>Message ID:</b> <code>${message.message_id}</code>\n\n` +
            `Для редактирования используйте:\n` +
            `<code>/edit ${targetChatId} ${message.message_id} новый текст</code>`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        bot.sendMessage(chatId,
            `❌ Ошибка публикации сообщения:\n${error.message}\n\n` +
            `Убедитесь, что:\n` +
            `• Бот добавлен в канал/группу как администратор\n` +
            `• Chat ID указан правильно\n` +
            `• У бота есть права на публикацию сообщений`
        );
    }
}

/**
 * Обработчик команды /edit
 */
async function handleEdit(bot, msg) {
    const chatId = msg.chat.id;
    const args = msg.text.split(' ').slice(1);

    if (args.length < 3) {
        bot.sendMessage(chatId,
            '❌ Неверный формат команды.\n\n' +
            'Используйте: <code>/edit &lt;chat_id&gt; &lt;message_id&gt; &lt;новый_текст&gt;</code>\n' +
            'Пример: <code>/edit -1001234567890 123 Обновленный текст</code>',
            { parse_mode: 'HTML' }
        );
        return;
    }

    const targetChatId = args[0];
    const messageId = parseInt(args[1]);
    const newText = args.slice(2).join(' ');

    if (isNaN(messageId)) {
        bot.sendMessage(chatId, '❌ Message ID должен быть числом');
        return;
    }

    try {
        await editMessageText(bot, targetChatId, messageId, newText);
        bot.sendMessage(chatId,
            `✅ Сообщение успешно отредактировано!\n\n` +
            `<b>Chat ID:</b> <code>${targetChatId}</code>\n` +
            `<b>Message ID:</b> <code>${messageId}</code>`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        bot.sendMessage(chatId, `❌ Ошибка редактирования: ${error.message}`);
    }
}

/**
 * Обработчик команды /delete
 */
async function handleDelete(bot, msg) {
    const chatId = msg.chat.id;
    const args = msg.text.split(' ').slice(1);

    if (args.length < 2) {
        bot.sendMessage(chatId,
            '❌ Неверный формат команды.\n\n' +
            'Используйте: <code>/delete &lt;chat_id&gt; &lt;message_id&gt;</code>\n' +
            'Пример: <code>/delete -1001234567890 123</code>',
            { parse_mode: 'HTML' }
        );
        return;
    }

    const targetChatId = args[0];
    const messageId = parseInt(args[1]);

    if (isNaN(messageId)) {
        bot.sendMessage(chatId, '❌ Message ID должен быть числом');
        return;
    }

    try {
        await deleteMessage(bot, targetChatId, messageId);
        bot.sendMessage(chatId,
            `✅ Сообщение успешно удалено!\n\n` +
            `<b>Chat ID:</b> <code>${targetChatId}</code>\n` +
            `<b>Message ID:</b> <code>${messageId}</code>`,
            { parse_mode: 'HTML' }
        );
    } catch (error) {
        bot.sendMessage(chatId, `❌ Ошибка удаления: ${error.message}`);
    }
}

/**
 * Обработчик команды /last
 */
function handleLast(bot, msg) {
    const chatId = msg.chat.id;
    const args = msg.text.split(' ').slice(1);

    if (args.length < 1) {
        bot.sendMessage(chatId,
            '❌ Неверный формат команды.\n\n' +
            'Используйте: <code>/last &lt;chat_id&gt;</code>\n' +
            'Пример: <code>/last -1001234567890</code>',
            { parse_mode: 'HTML' }
        );
        return;
    }

    const targetChatId = args[0];
    const lastMessage = messageStore.getLastMessage(targetChatId);

    if (!lastMessage) {
        bot.sendMessage(chatId,
            `ℹ️ Нет сохраненных сообщений для чата <code>${targetChatId}</code>`,
            { parse_mode: 'HTML' }
        );
        return;
    }

    const messageInfo = `
📝 <b>Последнее сообщение</b>

<b>Chat ID:</b> <code>${lastMessage.chatId}</code>
<b>Message ID:</b> <code>${lastMessage.messageId}</code>
<b>Тип:</b> ${lastMessage.type}
<b>Дата:</b> ${new Date(lastMessage.timestamp).toLocaleString('ru-RU')}

${lastMessage.text ? `<b>Текст:</b>\n${lastMessage.text.substring(0, 200)}${lastMessage.text.length > 200 ? '...' : ''}` : ''}

<b>Для редактирования:</b>
<code>/edit ${lastMessage.chatId} ${lastMessage.messageId} новый текст</code>
  `;

    bot.sendMessage(chatId, messageInfo, { parse_mode: 'HTML' });
}

/**
 * Регистрация всех обработчиков команд
 */
function registerCommands(bot) {
    bot.onText(/\/start/, (msg) => handleStart(bot, msg));
    bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
    bot.onText(/\/getchatid/, (msg) => handleGetChatId(bot, msg));
    bot.onText(/\/post/, (msg) => handlePost(bot, msg));
    bot.onText(/\/edit/, (msg) => handleEdit(bot, msg));
    bot.onText(/\/delete/, (msg) => handleDelete(bot, msg));
    bot.onText(/\/last/, (msg) => handleLast(bot, msg));

    logger.info('Все обработчики команд зарегистрированы');
}

module.exports = {
    registerCommands,
    handleStart,
    handleHelp,
    handleGetChatId,
    handlePost,
    handleEdit,
    handleDelete,
    handleLast
};
