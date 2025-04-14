import http from 'http';
import logger from '../utils/logger';
import { pool } from './db';

/**
 * Start a simple HTTP server for health checks
 * @param port - The port to listen on
 */
export function startHealthCheckServer(port: number = 3000): void {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/health') {
      try {
        // Check database connection
        const client = await pool.connect();
        try {
          await client.query('SELECT 1');
          
          // All checks passed
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
              database: 'up',
              ftp: 'up'
            }
          }));
        } finally {
          client.release();
        }
      } catch (error) {
        logger.error('Health check failed', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        }));
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'error',
        message: 'Not found'
      }));
    }
  });

  server.listen(port, () => {
    logger.info(`Health check server listening on port ${port}`);
  });

  server.on('error', (err) => {
    logger.error('Health check server error:', err);
  });
}
