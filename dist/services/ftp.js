"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFtpServer = startFtpServer;
const ftp_srv_1 = __importDefault(require("ftp-srv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("../utils/logger"));
const fileProcessor_1 = require("./fileProcessor");
// Ensure upload directory exists
if (!fs_1.default.existsSync(config_1.default.app.uploadDir)) {
    fs_1.default.mkdirSync(config_1.default.app.uploadDir, { recursive: true });
}
// Create FTP server
const ftpServer = new ftp_srv_1.default({
    url: `ftp://0.0.0.0:${config_1.default.ftp.port}`,
    pasv_url: process.env.PASV_URL || '127.0.0.1',
    pasv_min: config_1.default.ftp.passivePortStart,
    pasv_max: config_1.default.ftp.passivePortEnd,
    anonymous: false,
    greeting: 'Welcome to Finale Inventory FTP Server',
    log: logger_1.default
});
// Handle user authentication
ftpServer.on('login', ({ username, password }, resolve, reject) => {
    if (username === config_1.default.ftp.user && password === config_1.default.ftp.password) {
        logger_1.default.info(`User ${username} logged in`);
        // Set up user's root directory and permissions
        return resolve({
            root: config_1.default.app.uploadDir,
            cwd: '/',
            permissions: {
                // Allow user to read, write, and delete files
                write: true,
                read: true,
                delete: true
            }
        });
    }
    logger_1.default.warn(`Failed login attempt for user: ${username}`);
    return reject(new Error('Invalid username or password'));
});
// Handle file upload completion
ftpServer.on('STOR', ({ file, connection }) => {
    const filename = path_1.default.basename(file.name);
    logger_1.default.info(`File uploaded: ${filename} by ${connection.username}`);
    // Process the file
    const filePath = path_1.default.join(config_1.default.app.uploadDir, filename);
    (0, fileProcessor_1.processFile)(filePath)
        .then(result => {
        logger_1.default.info(`File processed: ${filename}`, result);
    })
        .catch(err => {
        logger_1.default.error(`Error processing file: ${filename}`, err);
    });
});
// Handle server errors
ftpServer.on('error', (err) => {
    logger_1.default.error('FTP Server error:', err);
});
// Start the FTP server
function startFtpServer() {
    return ftpServer.listen()
        .then(() => {
        logger_1.default.info(`FTP server listening on port ${config_1.default.ftp.port}`);
    })
        .catch((err) => {
        logger_1.default.error('Error starting FTP server:', err);
        throw err;
    });
}
