const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../utils/logger');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Initialize the database by creating necessary tables if they don't exist
 */
async function initDatabase() {
  const client = await pool.connect();
  try {
    logger.info('Initializing database...');
    
    // Create inventory_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        item_id VARCHAR(255) NOT NULL,
        sku VARCHAR(255),
        name VARCHAR(255),
        description TEXT,
        quantity INTEGER,
        location VARCHAR(255),
        category VARCHAR(255),
        supplier VARCHAR(255),
        cost_price DECIMAL(10, 2),
        selling_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        raw_data JSONB,
        UNIQUE(item_id)
      )
    `);
    
    // Create import_logs table to track file imports
    await client.query(`
      CREATE TABLE IF NOT EXISTS import_logs (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        items_processed INTEGER DEFAULT 0,
        items_created INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        error_message TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    
    logger.info('Database initialization completed');
  } catch (err) {
    logger.error('Error initializing database', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Insert or update inventory items in the database
 * @param {Array} items - Array of inventory items to insert/update
 * @param {Number} importLogId - ID of the import log entry
 * @returns {Object} - Statistics about the operation
 */
async function upsertInventoryItems(items, importLogId) {
  const client = await pool.connect();
  const stats = {
    created: 0,
    updated: 0,
    errors: 0
  };
  
  try {
    await client.query('BEGIN');
    
    for (const item of items) {
      try {
        // Check if item exists
        const checkResult = await client.query(
          'SELECT id FROM inventory_items WHERE item_id = $1',
          [item.item_id]
        );
        
        if (checkResult.rowCount === 0) {
          // Insert new item
          await client.query(`
            INSERT INTO inventory_items (
              item_id, sku, name, description, quantity, location, 
              category, supplier, cost_price, selling_price, raw_data
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            item.item_id,
            item.sku,
            item.name,
            item.description,
            item.quantity,
            item.location,
            item.category,
            item.supplier,
            item.cost_price,
            item.selling_price,
            JSON.stringify(item)
          ]);
          stats.created++;
        } else {
          // Update existing item
          await client.query(`
            UPDATE inventory_items SET
              sku = $2,
              name = $3,
              description = $4,
              quantity = $5,
              location = $6,
              category = $7,
              supplier = $8,
              cost_price = $9,
              selling_price = $10,
              raw_data = $11,
              updated_at = CURRENT_TIMESTAMP
            WHERE item_id = $1
          `, [
            item.item_id,
            item.sku,
            item.name,
            item.description,
            item.quantity,
            item.location,
            item.category,
            item.supplier,
            item.cost_price,
            item.selling_price,
            JSON.stringify(item)
          ]);
          stats.updated++;
        }
      } catch (err) {
        logger.error(`Error processing item ${item.item_id}`, err);
        stats.errors++;
      }
    }
    
    // Update import log
    await client.query(`
      UPDATE import_logs SET
        items_processed = $1,
        items_created = $2,
        items_updated = $3,
        status = $4,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = $5
    `, [
      items.length,
      stats.created,
      stats.updated,
      stats.errors > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
      importLogId
    ]);
    
    await client.query('COMMIT');
    return stats;
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Error in upsertInventoryItems transaction', err);
    
    // Update import log with error
    try {
      await client.query(`
        UPDATE import_logs SET
          status = 'FAILED',
          error_message = $1,
          completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [err.message, importLogId]);
    } catch (logErr) {
      logger.error('Error updating import log with failure', logErr);
    }
    
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Create a new import log entry
 * @param {String} filename - Name of the file being imported
 * @returns {Number} - ID of the created log entry
 */
async function createImportLog(filename) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      INSERT INTO import_logs (filename, status)
      VALUES ($1, 'PROCESSING')
      RETURNING id
    `, [filename]);
    
    return result.rows[0].id;
  } catch (err) {
    logger.error('Error creating import log', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  initDatabase,
  upsertInventoryItems,
  createImportLog
};
