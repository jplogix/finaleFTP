const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const db = require('./db');

/**
 * Process a JSON file from Finale Inventory
 * @param {String} filePath - Path to the file to process
 * @returns {Promise<Object>} - Processing statistics
 */
async function processFile(filePath) {
  logger.info(`Processing file: ${filePath}`);
  const filename = path.basename(filePath);
  
  try {
    // Create import log entry
    const importLogId = await db.createImportLog(filename);
    
    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data;
    
    try {
      data = JSON.parse(fileContent);
    } catch (parseErr) {
      logger.error(`Error parsing JSON file: ${filename}`, parseErr);
      throw new Error(`Invalid JSON format: ${parseErr.message}`);
    }
    
    // Process the data
    if (!Array.isArray(data)) {
      // If the data is not an array, wrap it in an array
      data = [data];
    }
    
    // Map the data to our database schema
    const items = data.map(item => mapItemToSchema(item));
    
    // Insert or update items in the database
    const result = await db.upsertInventoryItems(items, importLogId);
    
    logger.info(`File processed successfully: ${filename}`, result);
    return result;
  } catch (err) {
    logger.error(`Error processing file: ${filename}`, err);
    throw err;
  }
}

/**
 * Map Finale Inventory item to our database schema
 * @param {Object} item - Finale Inventory item
 * @returns {Object} - Mapped item
 */
function mapItemToSchema(item) {
  // This mapping will depend on the actual structure of Finale Inventory data
  // Adjust according to the actual JSON structure
  return {
    item_id: item.id || item.itemId || item.sku || `unknown-${Date.now()}`,
    sku: item.sku || '',
    name: item.name || item.productName || '',
    description: item.description || '',
    quantity: parseInt(item.quantity || item.stock || 0, 10),
    location: item.location || item.warehouse || '',
    category: item.category || '',
    supplier: item.supplier || item.vendor || '',
    cost_price: parseFloat(item.costPrice || item.cost || 0),
    selling_price: parseFloat(item.sellingPrice || item.price || 0)
  };
}

/**
 * Set up a file watcher to process new files
 * @param {String} directory - Directory to watch
 */
function setupFileWatcher(directory) {
  const chokidar = require('chokidar');
  
  // Initialize watcher
  const watcher = chokidar.watch(directory, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });
  
  // Add event listeners
  watcher
    .on('add', filePath => {
      logger.info(`New file detected: ${filePath}`);
      
      // Only process JSON files
      if (path.extname(filePath).toLowerCase() === '.json') {
        processFile(filePath)
          .then(result => {
            logger.info(`File processed: ${filePath}`, result);
          })
          .catch(err => {
            logger.error(`Error processing file: ${filePath}`, err);
          });
      } else {
        logger.info(`Skipping non-JSON file: ${filePath}`);
      }
    })
    .on('error', error => logger.error(`File watcher error: ${error}`));
  
  logger.info(`File watcher started for directory: ${directory}`);
  return watcher;
}

module.exports = {
  processFile,
  setupFileWatcher
};
