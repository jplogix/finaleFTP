"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processFile = processFile;
exports.setupFileWatcher = setupFileWatcher;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const logger_1 = __importDefault(require("../utils/logger"));
const db = __importStar(require("./db"));
/**
 * Process a JSON file from Finale Inventory
 * @param filePath - Path to the file to process
 * @returns Processing statistics
 */
async function processFile(filePath) {
    logger_1.default.info(`Processing file: ${filePath}`);
    const filename = path_1.default.basename(filePath);
    try {
        // Create import log entry
        const importLogId = await db.createImportLog(filename);
        // Read and parse the file
        const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
        let data;
        try {
            data = JSON.parse(fileContent);
        }
        catch (parseErr) {
            logger_1.default.error(`Error parsing JSON file: ${filename}`, parseErr);
            throw new Error(`Invalid JSON format: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`);
        }
        // Process the data
        if (!Array.isArray(data)) {
            // If the data is not an array, wrap it in an array
            data = [data];
        }
        // Map the data to our database schema
        const items = data.map((item) => mapItemToSchema(item));
        // Insert or update items in the database
        const result = await db.upsertInventoryItems(items, importLogId);
        logger_1.default.info(`File processed successfully: ${filename}`, result);
        return result;
    }
    catch (err) {
        logger_1.default.error(`Error processing file: ${filename}`, err);
        throw err;
    }
}
/**
 * Map Finale Inventory item to our database schema
 * @param item - Finale Inventory item
 * @returns Mapped item
 */
function mapItemToSchema(item) {
    // This mapping will depend on the actual structure of Finale Inventory data
    // Adjust according to the actual JSON structure
    return {
        item_id: item.id || item.itemId || item.sku || `unknown-${Date.now()}`,
        sku: item.sku || '',
        name: item.name || item.productName || '',
        description: item.description || '',
        quantity: parseInt(String(item.quantity || item.stock || 0), 10),
        location: item.location || item.warehouse || '',
        category: item.category || '',
        supplier: item.supplier || item.vendor || '',
        cost_price: parseFloat(String(item.costPrice || item.cost || 0)),
        selling_price: parseFloat(String(item.sellingPrice || item.price || 0))
    };
}
/**
 * Set up a file watcher to process new files
 * @param directory - Directory to watch
 */
function setupFileWatcher(directory) {
    // Initialize watcher
    const watcher = chokidar_1.default.watch(directory, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });
    // Add event listeners
    watcher
        .on('add', (filePath) => {
        logger_1.default.info(`New file detected: ${filePath}`);
        // Only process JSON files
        if (path_1.default.extname(filePath).toLowerCase() === '.json') {
            processFile(filePath)
                .then(result => {
                logger_1.default.info(`File processed: ${filePath}`, result);
            })
                .catch(err => {
                logger_1.default.error(`Error processing file: ${filePath}`, err);
            });
        }
        else {
            logger_1.default.info(`Skipping non-JSON file: ${filePath}`);
        }
    })
        .on('error', (error) => logger_1.default.error(`File watcher error: ${error}`));
    logger_1.default.info(`File watcher started for directory: ${directory}`);
    return watcher;
}
