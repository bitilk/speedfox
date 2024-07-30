const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const path = require('path');

require('winston-daily-rotate-file');

const StartTimestamp = new Date().toISOString().replace(/:/g, '-');
const logFilename = `application-${StartTimestamp}.log`;

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new transports.File({
      filename: path.join('log', logFilename),
      maxFiles: 5
    })
  ]
});

module.exports = logger;
