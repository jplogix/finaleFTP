"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ftp_1 = require("./services/ftp");
const db_1 = require("./services/db");
const fileProcessor_1 = require("./services/fileProcessor");
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./utils/logger"));
async function startApplication() {
    try {
        // Initialize the database
        await (0, db_1.initDatabase)();
        // Start the FTP server
        await (0, ftp_1.startFtpServer)();
        // Set up file watcher for the uploads directory
        (0, fileProcessor_1.setupFileWatcher)(config_1.default.app.uploadDir);
        logger_1.default.info('Application started successfully');
    }
    catch (err) {
        logger_1.default.error('Failed to start application:', err);
        process.exit(1);
    }
}
// Handle process termination
process.on('SIGINT', () => {
    logger_1.default.info('Application shutting down...');
    process.exit(0);
});
// Start the application
startApplication();
