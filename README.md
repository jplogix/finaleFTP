# Finale Inventory FTP Server

This application provides an FTP server that can capture scheduled exports from Finale Inventory, parse the JSON data, and insert it into a PostgreSQL database. Built with TypeScript for type safety and better developer experience.

## Features

- FTP server to receive scheduled exports from Finale Inventory
- Automatic processing of JSON files
- PostgreSQL database integration for storing inventory data
- File watching for real-time processing
- Detailed logging
- TypeScript for type safety and better code quality

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the provided example:

   ```
   # FTP Server Configuration
   FTP_PORT=21
   FTP_USER=finale
   FTP_PASSWORD=inventory123
   FTP_PASSIVE_PORT_START=10000
   FTP_PASSIVE_PORT_END=10100

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=finale_inventory
   DB_USER=postgres
   DB_PASSWORD=postgres

   # Application Configuration
   UPLOAD_DIR=./uploads
   LOG_DIR=./logs
   ```

4. Create the PostgreSQL database:
   ```
   createdb finale_inventory
   ```

## Usage

Build the TypeScript code:

```
npm run build
```

Start the application:

```
npm start
```

For development with auto-restart:

```
npm run dev
```

Clean the build directory:

```
npm run clean
```

## Configuring Finale Inventory

1. Log in to your Finale Inventory account
2. Go to Integrations
3. Click "Add New Integration" and select "Add FTP Server Integration"
4. Enter the FTP server details:
   - Host: Your server IP or domain
   - Port: 21 (or your configured port)
   - Username: finale (or your configured username)
   - Password: inventory123 (or your configured password)
5. Configure a report to be pushed to the FTP server:
   - Select JSON as the format
   - Set the schedule as needed (daily recommended)
   - Specify the filename

## Database Schema

The application creates two tables:

1. `inventory_items` - Stores the inventory data
2. `import_logs` - Tracks file imports and processing status

## Deployment with Dokploy

This application can be easily deployed using Dokploy on a VPS.

### Prerequisites

- A VPS with Docker and Dokploy installed
- Domain or subdomain pointing to your VPS (recommended)

### Deployment Steps

1. Clone this repository on your local machine
2. Copy `.env.production` to `.env` and update the values:
   ```
   cp .env.production .env
   ```
3. Edit the `.env` file with your specific configuration:
   - Set `DOKPLOY_REGISTRY` to your Docker registry
   - Set `PASV_URL` to your server's IP address or domain name
   - Update credentials as needed
4. Run the deployment script:
   ```
   ./deploy.sh
   ```

### Manual Deployment

If you prefer to deploy manually:

1. Build the Docker image:
   ```
   docker build -t finale-ftp .
   ```
2. Run the containers using docker-compose:
   ```
   docker-compose up -d
   ```

### Important Notes for FTP Deployment

- Make sure ports 21 and 10000-10100 are open in your firewall
- For proper passive mode FTP, the `PASV_URL` must be set to your server's public IP or domain
- In cloud environments, you may need to configure additional network settings

## License

MIT
