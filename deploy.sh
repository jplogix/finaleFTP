#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check if dokploy is installed
if ! command -v dokploy &> /dev/null; then
  echo "Error: dokploy is not installed or not in PATH"
  exit 1
fi

# Set default values for environment variables
: ${DOKPLOY_REGISTRY:="localhost:5000"}
: ${DOKPLOY_TAG:="latest"}
: ${FTP_USER:="finale"}
: ${FTP_PASSWORD:="inventory123"}
: ${PASV_URL:="your-server-ip-or-domain"}
: ${DB_NAME:="finale_inventory"}
: ${DB_USER:="postgres"}
: ${DB_PASSWORD:="postgres"}

# Export variables for dokploy
export DOKPLOY_REGISTRY
export DOKPLOY_TAG
export FTP_USER
export FTP_PASSWORD
export PASV_URL
export DB_NAME
export DB_USER
export DB_PASSWORD

# Deploy with dokploy
echo "Deploying finale-ftp to Dokploy..."
dokploy deploy

echo "Deployment completed successfully!"
echo "Your FTP server should now be accessible at:"
echo "Host: $PASV_URL"
echo "Port: 21"
echo "Username: $FTP_USER"
echo "Password: $FTP_PASSWORD"
