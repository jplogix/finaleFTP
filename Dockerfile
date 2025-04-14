FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Build TypeScript code
RUN npm run build

# Create uploads and logs directories
RUN mkdir -p uploads logs

# Expose FTP ports
EXPOSE 21
# Expose passive port range
EXPOSE 10000-10100

# Run the application
CMD ["node", "dist/index.js"]
