import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import logger from '../utils/logger';
import * as db from './db';
import { InventoryItem, ProcessingResult } from '../interfaces';

/**
 * Process a JSON file from Finale Inventory
 * @param filePath - Path to the file to process
 * @returns Processing statistics
 */
async function processFile(filePath: string): Promise<ProcessingResult> {
  logger.info(`Processing file: ${filePath}`);
  const filename = path.basename(filePath);

  try {
    // Create import log entry
    const importLogId = await db.createImportLog(filename);

    // Read and parse the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let data: any;

    try {
      data = JSON.parse(fileContent);
    } catch (parseErr) {
      logger.error(`Error parsing JSON file: ${filename}`, parseErr);
      throw new Error(`Invalid JSON format: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`);
    }

    // Process the data
    if (!Array.isArray(data)) {
      // If the data is not an array, wrap it in an array
      data = [data];
    }

    // Map the data to our database schema
    const items = data.map((item: any) => mapItemToSchema(item));

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
 * @param item - Finale Inventory item
 * @returns Mapped item
 */
function mapItemToSchema(item: any): InventoryItem {
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
function setupFileWatcher(directory: string): any {
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
    .on('add', (filePath: string) => {
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
    .on('error', (error: unknown) => logger.error(`File watcher error: ${error}`));

  logger.info(`File watcher started for directory: ${directory}`);
  return watcher;
}

export {
  processFile,
  setupFileWatcher
};
