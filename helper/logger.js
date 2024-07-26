const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'log/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '3d',
  maxSize: '128m'
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.cli(),
  transports: [
    new winston.transports.Console(),
    fileRotateTransport
  ]
});

module.exports = logger;
