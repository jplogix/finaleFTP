import { startFtpServer } from './services/ftp';
import { initDatabase } from './services/db';
import { setupFileWatcher } from './services/fileProcessor';
import { startHealthCheckServer } from './services/healthcheck';
import config from './config/config';
import logger from './utils/logger';

async function startApplication(): Promise<void> {
  try {
    // Initialize the database
    await initDatabase();

    // Start the FTP server
    await startFtpServer();

    // Set up file watcher for the uploads directory
    setupFileWatcher(config.app.uploadDir);

    // Start health check server
    startHealthCheckServer(config.app.healthCheckPort || 3000);

    logger.info('Application started successfully');
  } catch (err) {
    logger.error('Failed to start application:', err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Application shutting down...');
  process.exit(0);
});

// Start the application
startApplication();
