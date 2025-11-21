# Используем официальный образ Node.js Alpine (легковесный)
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY src ./src

# Создаем директории для данных и логов
RUN mkdir -p data logs

# Запускаем бота
CMD ["node", "src/bot.js"]
