# Docker Setup for Key Pair Generator

This document provides instructions for running the Angular Key Pair Generator application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

### Production Build

1. **Build and run the production container:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Open your browser and navigate to `http://localhost:8080`

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

### Development Build

1. **Build and run the development container:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the development server:**
   - Open your browser and navigate to `http://localhost:4200`
   - Hot reload is enabled for development

3. **Stop the development container:**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## Manual Docker Commands

### Production

```bash
# Build the production image
docker build -t key-pair-generator .

# Run the container
docker run -p 8080:80 key-pair-generator

# Run in detached mode
docker run -d -p 8080:80 --name key-pair-generator key-pair-generator
```

### Development

```bash
# Build the development image
docker build -f Dockerfile.dev -t key-pair-generator-dev .

# Run the development container
docker run -p 4200:4200 -v $(pwd):/app key-pair-generator-dev
```

## Docker Images

### Production Image (`Dockerfile`)
- **Base:** `nginx:alpine`
- **Size:** ~20MB (optimized)
- **Features:**
  - Multi-stage build for smaller image size
  - Nginx for serving static files
  - Gzip compression enabled
  - Security headers configured
  - Angular routing support
  - Health check endpoint

### Development Image (`Dockerfile.dev`)
- **Base:** `node:18-alpine`
- **Size:** ~200MB
- **Features:**
  - Hot reload enabled
  - Volume mounting for live code changes
  - Development server on port 4200

## Configuration

### Nginx Configuration (`nginx.conf`)
- Optimized for Angular SPA
- Gzip compression enabled
- Security headers configured
- Static asset caching
- Health check endpoint at `/health`

### Environment Variables
- `NODE_ENV`: Set to `production` or `development`

## Health Check

The production container includes a health check endpoint:
```bash
curl http://localhost:8080/health
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   netstat -tulpn | grep :8080
   
   # Stop the container
   docker-compose down
   ```

2. **Build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Permission issues (Linux/Mac):**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER .
   ```

### Logs

```bash
# View container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f angular-app
```

## Security Considerations

- The production image runs as a non-root user
- Security headers are configured in nginx
- Only necessary files are included in the image
- Health checks are implemented for monitoring

## Performance Optimization

- Multi-stage build reduces final image size
- Nginx is optimized for serving static content
- Gzip compression reduces bandwidth usage
- Static assets are cached for better performance 