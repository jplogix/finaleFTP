import dotenv from 'dotenv';
import { Config } from '../interfaces';

dotenv.config();

const config: Config = {
  ftp: {
    port: parseInt(process.env.FTP_PORT || '21', 10),
    user: process.env.FTP_USER || 'finale',
    password: process.env.FTP_PASSWORD || 'inventory123',
    passivePortStart: parseInt(process.env.FTP_PASSIVE_PORT_START || '10000', 10),
    passivePortEnd: parseInt(process.env.FTP_PASSIVE_PORT_END || '10100', 10)
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'finale_inventory',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  app: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    logDir: process.env.LOG_DIR || './logs',
    healthCheckPort: parseInt(process.env.HEALTH_CHECK_PORT || '3000', 10)
  }
};

export default config;
