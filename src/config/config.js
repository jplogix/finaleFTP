require('dotenv').config();

module.exports = {
  ftp: {
    port: process.env.FTP_PORT || 21,
    user: process.env.FTP_USER || 'finale',
    password: process.env.FTP_PASSWORD || 'inventory123',
    passivePortStart: parseInt(process.env.FTP_PASSIVE_PORT_START || 10000),
    passivePortEnd: parseInt(process.env.FTP_PASSIVE_PORT_END || 10100)
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'finale_inventory',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  app: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    logDir: process.env.LOG_DIR || './logs'
  }
};
