const FtpSrv = require('ftp-srv');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');
const logger = require('../utils/logger');
const { processFile } = require('./fileProcessor');

// Ensure upload directory exists
if (!fs.existsSync(config.app.uploadDir)) {
  fs.mkdirSync(config.app.uploadDir, { recursive: true });
}

// Create FTP server
const ftpServer = new FtpSrv({
  url: `ftp://0.0.0.0:${config.ftp.port}`,
  pasv_url: process.env.PASV_URL || '127.0.0.1',
  pasv_min: config.ftp.passivePortStart,
  pasv_max: config.ftp.passivePortEnd,
  anonymous: false,
  greeting: 'Welcome to Finale Inventory FTP Server',
  log: logger
});

// Handle user authentication
ftpServer.on('login', ({ username, password }, resolve, reject) => {
  if (username === config.ftp.user && password === config.ftp.password) {
    logger.info(`User ${username} logged in`);
    
    // Set up user's root directory and permissions
    return resolve({
      root: config.app.uploadDir,
      cwd: '/',
      permissions: {
        // Allow user to read, write, and delete files
        write: true,
        read: true,
        delete: true
      }
    });
  }
  
  logger.warn(`Failed login attempt for user: ${username}`);
  return reject(new Error('Invalid username or password'));
});

// Handle file upload completion
ftpServer.on('STOR', ({ file, connection }) => {
  const filename = path.basename(file.name);
  logger.info(`File uploaded: ${filename} by ${connection.username}`);
  
  // Process the file
  const filePath = path.join(config.app.uploadDir, filename);
  processFile(filePath)
    .then(result => {
      logger.info(`File processed: ${filename}`, result);
    })
    .catch(err => {
      logger.error(`Error processing file: ${filename}`, err);
    });
});

// Handle server errors
ftpServer.on('error', (err) => {
  logger.error('FTP Server error:', err);
});

// Start the FTP server
function startFtpServer() {
  return ftpServer.listen()
    .then(() => {
      logger.info(`FTP server listening on port ${config.ftp.port}`);
    })
    .catch(err => {
      logger.error('Error starting FTP server:', err);
      throw err;
    });
}

module.exports = {
  startFtpServer
};
