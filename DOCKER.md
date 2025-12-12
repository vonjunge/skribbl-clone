# 🐳 Docker Deployment Guide

## Overview

This project includes Docker configurations for both production and development environments.

## Project Structure

```
skribbl_clone/
├── docker-compose.yml          # Production deployment
├── docker-compose.dev.yml      # Development with hot reload
├── .dockerignore               # Root ignore file
├── server/
│   ├── Dockerfile              # Production server image
│   ├── Dockerfile.dev          # Development server image
│   └── .dockerignore           # Server-specific ignore
└── client/
    ├── Dockerfile              # Production client image (nginx)
    ├── Dockerfile.dev          # Development client image (Vite)
    ├── nginx.conf              # Nginx configuration for production
    └── .dockerignore           # Client-specific ignore
```

## 🚀 Quick Start

### Production Deployment

**1. Build and start all services:**
```bash
docker-compose up -d
```

**2. Access the application:**
- Client: http://localhost
- Server API: http://localhost:3002
- Health Check: http://localhost:3002/health

**3. View logs:**
```bash
docker-compose logs -f
```

**4. Stop services:**
```bash
docker-compose down
```

### Development Deployment (with Hot Reload)

**1. Start development environment:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**2. Access the application:**
- Client (Vite): http://localhost:5173
- Server: http://localhost:3002
- Hot reload enabled for both client and server

**3. Stop development environment:**
```bash
docker-compose -f docker-compose.dev.yml down
```

## 📦 Building Images

### Build specific service:
```bash
# Server only
docker-compose build server

# Client only
docker-compose build client
```

### Build with no cache:
```bash
docker-compose build --no-cache
```

### Build for specific platform:
```bash
docker-compose build --platform linux/amd64
```

## 🔧 Configuration

### Environment Variables

**Server (`docker-compose.yml`):**
- `PORT`: Server port (default: 3002)
- `NODE_ENV`: Environment (production/development)

**Client (`docker-compose.yml`):**
- `VITE_SERVER_URL`: Backend server URL
  - Local: `http://localhost:3002`
  - Production: `http://your-domain.com:3002`
  - Network: `http://192.168.1.XXX:3002`

### Custom Server URL

To deploy with custom server URL:

```bash
docker-compose build --build-arg VITE_SERVER_URL=http://your-domain.com:3002
docker-compose up -d
```

Or edit `docker-compose.yml`:
```yaml
services:
  client:
    build:
      args:
        - VITE_SERVER_URL=http://your-domain.com:3002
```

## 🌐 Network Access

### Local Network Access

**1. Find your local IP:**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

**2. Update docker-compose.yml:**
```yaml
services:
  client:
    build:
      args:
        - VITE_SERVER_URL=http://192.168.1.XXX:3002
```

**3. Rebuild and restart:**
```bash
docker-compose build client
docker-compose up -d
```

**4. Share with friends:**
- They visit: `http://YOUR_IP`
- They can join games and play!

## 🏥 Health Checks

Both services include health checks:

**Check service health:**
```bash
docker-compose ps
```

**Manual health checks:**
```bash
# Server
curl http://localhost:3002/health

# Client (nginx)
curl http://localhost/health
```

## 📊 Resource Management

### View resource usage:
```bash
docker stats
```

### Set resource limits:

Edit `docker-compose.yml`:
```yaml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 🔍 Debugging

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client

# Last 100 lines
docker-compose logs --tail=100 server
```

### Access container shell:
```bash
# Server
docker-compose exec server sh

# Client
docker-compose exec client sh
```

### Inspect running container:
```bash
docker-compose exec server ps aux
docker-compose exec server env
```

## 🧹 Cleanup

### Remove containers:
```bash
docker-compose down
```

### Remove containers and volumes:
```bash
docker-compose down -v
```

### Remove everything (including images):
```bash
docker-compose down --rmi all -v
```

### Clean up Docker system:
```bash
docker system prune -a
```

## 🚀 Production Deployment Tips

### 1. Use Proper Domain

Update server URL to your domain:
```yaml
- VITE_SERVER_URL=https://api.yourdomain.com
```

### 2. Enable SSL/TLS

Use a reverse proxy (Nginx, Traefik, Caddy) for SSL:

```yaml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./certs:/etc/nginx/certs
```

### 3. Use Docker Secrets

For sensitive data:
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  server:
    secrets:
      - db_password
```

### 4. Set Up Logging

Configure proper logging:
```yaml
services:
  server:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. Enable Auto-Restart

Already configured:
```yaml
restart: unless-stopped
```

## 🌍 Cloud Deployment

### Deploy to AWS ECS

1. Push images to ECR
2. Create ECS task definition
3. Create ECS service
4. Configure load balancer

### Deploy to DigitalOcean

```bash
# Install doctl
doctl apps create --spec .do/app.yaml
```

### Deploy to Google Cloud Run

```bash
# Build images
docker build -t gcr.io/PROJECT_ID/skribbl-server ./server
docker build -t gcr.io/PROJECT_ID/skribbl-client ./client

# Push to GCR
docker push gcr.io/PROJECT_ID/skribbl-server
docker push gcr.io/PROJECT_ID/skribbl-client

# Deploy
gcloud run deploy skribbl-server --image gcr.io/PROJECT_ID/skribbl-server
gcloud run deploy skribbl-client --image gcr.io/PROJECT_ID/skribbl-client
```

## 🔐 Security Best Practices

1. **Don't commit secrets**: Use `.env` files or Docker secrets
2. **Use specific base image versions**: `node:18-alpine` not `node:latest`
3. **Run as non-root user**: Add `USER node` to Dockerfile
4. **Scan images**: `docker scan skribbl-server`
5. **Keep images updated**: Regularly rebuild with latest base images
6. **Limit exposed ports**: Only expose necessary ports

## 📝 Common Commands Reference

```bash
# Start production
docker-compose up -d

# Start development
docker-compose -f docker-compose.dev.yml up

# View logs
docker-compose logs -f

# Restart service
docker-compose restart server

# Rebuild and restart
docker-compose up -d --build

# Stop all
docker-compose down

# Remove everything
docker-compose down --rmi all -v

# Check status
docker-compose ps

# Execute command in container
docker-compose exec server sh
```

## 🆘 Troubleshooting

### Issue: Port already in use

```bash
# Find and kill process using port
# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3002 | xargs kill -9
```

### Issue: Cannot connect to server

1. Check if server is running: `docker-compose ps`
2. Check logs: `docker-compose logs server`
3. Verify health: `curl http://localhost:3002/health`
4. Check network: `docker network inspect skribbl_skribbl-network`

### Issue: Client shows connection error

1. Verify VITE_SERVER_URL is correct
2. Rebuild client: `docker-compose build client`
3. Check browser console for errors
4. Ensure server is accessible from client container

### Issue: Changes not reflected

Development mode should auto-reload, but if not:
```bash
docker-compose -f docker-compose.dev.yml restart
```

## 🎯 Performance Optimization

### Multi-stage builds
Already implemented in `client/Dockerfile` - reduces image size by ~90%

### Layer caching
Package files copied before source code for better caching

### Production optimizations
- Nginx for static files
- Gzip compression enabled
- Health checks configured
- Resource limits available

---

**Ready to deploy? 🚀**

```bash
docker-compose up -d
```

Then visit http://localhost and start drawing!

**Happy Holidays! 🎄🎅⛄**
