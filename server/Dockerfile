# Server Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy shared folder first
COPY shared ./shared

# Copy server package files
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy server source code
COPY server/ .

# Expose port
EXPOSE 3002

# Start server
CMD ["npm", "start"]
