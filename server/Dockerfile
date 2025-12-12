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

# Health check using wget with proper output handling
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3002/health || exit 1

# Start server
CMD ["npm", "start"]
