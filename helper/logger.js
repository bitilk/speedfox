const winston = require('winston');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
const path = require('path');

require('winston-daily-rotate-file');

const StartTimestamp = new Date().toISOString().replace(/:/g, '-');
const logFilename    = `application-${StartTimestamp}.log`;
const LOG_FILE_PATH  = path.join('log', logFilename);

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new transports.File({
      filename: LOG_FILE_PATH,
      maxFiles: 5
    })
  ]
});

function getLog() {
  const LOG_CONTENT = fs.readFileSync(LOG_FILE_PATH, 'utf8');
  return LOG_CONTENT;
}

module.exports.logger = logger;
module.exports.getLog = getLog;
