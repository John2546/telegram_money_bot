const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    log(level, message, data = null) {
        const timestamp = this.getTimestamp();
        const logMessage = {
            timestamp,
            level,
            message,
            ...(data && { data })
        };

        // Console output with colors
        const colors = {
            INFO: '\x1b[36m',    // Cyan
            SUCCESS: '\x1b[32m', // Green
            ERROR: '\x1b[31m',   // Red
            WARN: '\x1b[33m',    // Yellow
            RESET: '\x1b[0m'
        };

        const color = colors[level] || colors.RESET;
        console.log(`${color}[${timestamp}] [${level}] ${message}${colors.RESET}`);
        if (data) {
            console.log(data);
        }

        // File output
        const logFile = path.join(this.logDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logMessage) + '\n');
    }

    info(message, data) {
        this.log('INFO', message, data);
    }

    success(message, data) {
        this.log('SUCCESS', message, data);
    }

    error(message, data) {
        this.log('ERROR', message, data);
    }

    warn(message, data) {
        this.log('WARN', message, data);
    }
}

module.exports = new Logger();
