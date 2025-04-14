const { startFtpServer } = require('./services/ftp');
const { initDatabase } = require('./services/db');
const { setupFileWatcher } = require('./services/fileProcessor');
const config = require('./config/config');
const logger = require('./utils/logger');

async function startApplication() {
  try {
    // Initialize the database
    await initDatabase();
    
    // Start the FTP server
    await startFtpServer();
    
    // Set up file watcher for the uploads directory
    setupFileWatcher(config.app.uploadDir);
    
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
