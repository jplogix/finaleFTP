const winston = require('winston');
const path = require('path');
const config = require('../config/config');
const fs = require('fs');

// Ensure log directory exists
if (!fs.existsSync(config.app.logDir)) {
  fs.mkdirSync(config.app.logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'finale-ftp' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(config.app.logDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(config.app.logDir, 'combined.log') 
    })
  ]
});

// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
