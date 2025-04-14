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

This application can be easily deployed using Dokploy with GitHub integration and Nixpack.

### Prerequisites

- A VPS with Dokploy installed
- GitHub repository for your code
- Docker Hub account (or other container registry)
- Domain or subdomain pointing to your VPS (recommended)

### GitHub Setup

1. Push this code to your GitHub repository
2. Set up the following secrets in your GitHub repository:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Your Docker Hub access token
   - `DOKPLOY_URL`: Your Dokploy instance URL
   - `DOKPLOY_TOKEN`: Your Dokploy API token
   - `DOKPLOY_APP_ID`: Your Dokploy application ID

### Dokploy Setup

1. Log in to your Dokploy instance
2. Create a new application
3. Select "Docker" as the source type
4. Enter your Docker image name: `your-username/finale-ftp:latest`
5. Configure the ports:
   - Port 21 for FTP
   - Port 3000 for health checks
   - Port range 10000-10100 for passive FTP
6. Set up environment variables as defined in `.env.production`
7. Configure health checks to use the `/health` endpoint
8. Set up the PostgreSQL database dependency

### Deployment Process

When you push to your GitHub repository:

1. GitHub Actions will build the Docker image
2. The image will be pushed to Docker Hub
3. Dokploy will be notified to deploy the new image
4. Dokploy will pull the image and deploy it with zero downtime

### Manual Deployment

If you prefer to deploy manually:

1. Build the Docker image:
   ```
   docker build -t your-username/finale-ftp:latest .
   ```
2. Push the image to Docker Hub:
   ```
   docker push your-username/finale-ftp:latest
   ```
3. Trigger a deployment in Dokploy through the UI or API

### Important Notes for FTP Deployment

- Make sure ports 21 and 10000-10100 are open in your firewall
- For proper passive mode FTP, the `PASV_URL` must be set to your server's public IP or domain
- In cloud environments, you may need to configure additional network settings

## License

MIT
