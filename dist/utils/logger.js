"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("../config/config"));
// Ensure log directory exists
if (!fs_1.default.existsSync(config_1.default.app.logDir)) {
    fs_1.default.mkdirSync(config_1.default.app.logDir, { recursive: true });
}
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
    defaultMeta: { service: 'finale-ftp' },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.default.app.logDir, 'error.log'),
            level: 'error'
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(config_1.default.app.logDir, 'combined.log')
        })
    ]
});
// If we're not in production, also log to the console
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
exports.default = logger;
