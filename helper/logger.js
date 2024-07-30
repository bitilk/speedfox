const winston = require('winston');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
const path = require('path');

require('winston-daily-rotate-file');

const StartTimestamp = new Date().toISOString().replace(/:/g, '-');
const LOG_FILE_NAME    = `application-${StartTimestamp}.log`;
const LOG_FILE_PATH  = path.join('log', LOG_FILE_NAME);

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

module.exports.logger = logger;
module.exports.LOG_FILE_PATH = LOG_FILE_PATH;
