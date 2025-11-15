# Deployment Guide - Machinery Maintenance Tracker

This guide provides comprehensive instructions for deploying the Machinery Maintenance Tracker application using Docker and CI/CD pipelines.

## Prerequisites

Before deploying the application, ensure you have the following installed and configured on your deployment server:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **MySQL 8.0** (or use the included Docker Compose MySQL service)
- **Git** (for cloning the repository)

## Environment Variables

The application requires several environment variables to function properly. Create a `.env` file in the project root with the following variables:

### Required Variables

```env
# Database Configuration
DATABASE_URL=mysql://username:password@host:3306/database_name

# JWT Secret for session management
JWT_SECRET=your-secure-random-string-here

# OAuth Configuration (if using Manus OAuth)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=your-app-id

# Owner Information
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=Owner Name

# Application Configuration
VITE_APP_TITLE=Machinery Maintenance Tracker
VITE_APP_LOGO=/logo.png

# Forge API Configuration (for S3 storage)
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### MySQL Configuration (for Docker Compose)

```env
MYSQL_ROOT_PASSWORD=secure-root-password
MYSQL_DATABASE=maintenance_tracker
MYSQL_USER=appuser
MYSQL_PASSWORD=secure-app-password
```

## Deployment Methods

### Method 1: Docker Compose (Recommended for Development/Testing)

This method deploys both the application and MySQL database using Docker Compose.

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd machinery-maintenance-tracker
```

#### Step 2: Configure Environment Variables

Create a `.env` file with all required environment variables as shown above.

#### Step 3: Build and Start Services

```bash
# Build the Docker image
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

#### Step 4: Run Database Migrations

```bash
docker-compose exec app pnpm db:push
```

#### Step 5: Access the Application

The application will be available at `http://localhost:3000`

### Method 2: Standalone Docker Container

This method deploys only the application container, assuming you have an external MySQL database.

#### Step 1: Build the Docker Image

```bash
docker build -t machinery-maintenance-tracker:latest .
```

#### Step 2: Run the Container

```bash
docker run -d \
  --name machinery-maintenance-tracker \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:3306/database" \
  -e JWT_SECRET="your-jwt-secret" \
  -e OAUTH_SERVER_URL="https://api.manus.im" \
  -e VITE_OAUTH_PORTAL_URL="https://oauth.manus.im" \
  -e VITE_APP_ID="your-app-id" \
  -e OWNER_OPEN_ID="owner-id" \
  -e OWNER_NAME="Owner Name" \
  -e VITE_APP_TITLE="Machinery Maintenance Tracker" \
  -e BUILT_IN_FORGE_API_URL="https://forge-api.manus.im" \
  -e BUILT_IN_FORGE_API_KEY="your-api-key" \
  -e VITE_FRONTEND_FORGE_API_KEY="your-frontend-key" \
  -e VITE_FRONTEND_FORGE_API_URL="https://forge-api.manus.im" \
  machinery-maintenance-tracker:latest
```

#### Step 3: Run Database Migrations

```bash
docker exec machinery-maintenance-tracker pnpm db:push
```

### Method 3: CI/CD Pipeline with GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and deploys the application when code is pushed to the main branch.

#### Step 1: Configure GitHub Secrets

In your GitHub repository, navigate to **Settings → Secrets and variables → Actions** and add the following secrets:

- `DOCKER_USERNAME` - Your Docker Hub username
- `DOCKER_PASSWORD` - Your Docker Hub password or access token
- `DEPLOY_HOST` - The hostname or IP address of your deployment server
- `DEPLOY_USER` - SSH username for the deployment server
- `DEPLOY_SSH_KEY` - Private SSH key for authentication

#### Step 2: Prepare Deployment Server

On your deployment server, create the deployment directory:

```bash
sudo mkdir -p /opt/machinery-maintenance-tracker
cd /opt/machinery-maintenance-tracker
```

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  app:
    image: <your-dockerhub-username>/machinery-maintenance-tracker:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      # Add all other required environment variables
    restart: unless-stopped
```

Create a `.env` file with all required environment variables.

#### Step 3: Push to Main Branch

When you push code to the main branch, GitHub Actions will automatically:

1. Build the application
2. Run type checking
3. Build and push the Docker image to Docker Hub
4. SSH into your deployment server
5. Pull the latest image
6. Restart the containers
7. Run database migrations

## Database Setup

### Initial Database Creation

If you're using an external MySQL database, create the database before running migrations:

```sql
CREATE DATABASE maintenance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'appuser'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON maintenance_tracker.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
```

### Running Migrations

The application uses Drizzle ORM for database migrations. Run migrations using:

```bash
# If using Docker Compose
docker-compose exec app pnpm db:push

# If using standalone Docker
docker exec machinery-maintenance-tracker pnpm db:push

# If running locally
pnpm db:push
```

## Production Considerations

### Security Best Practices

1. **Use Strong Secrets**: Generate strong, random values for `JWT_SECRET` and database passwords
2. **Enable HTTPS**: Use a reverse proxy (nginx, Traefik) with SSL/TLS certificates
3. **Firewall Configuration**: Only expose necessary ports (443 for HTTPS, 22 for SSH)
4. **Regular Updates**: Keep Docker, Node.js, and dependencies up to date
5. **Database Backups**: Implement regular automated backups of the MySQL database

### Reverse Proxy Configuration (nginx)

Example nginx configuration for SSL termination:

```nginx
server {
    listen 80;
    server_name maintenance.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name maintenance.example.com;

    ssl_certificate /etc/letsencrypt/live/maintenance.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/maintenance.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Monitoring and Logging

Monitor application health and logs:

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db

# Check container status
docker-compose ps

# View resource usage
docker stats
```

### Scaling Considerations

For production deployments with high traffic:

1. **Load Balancing**: Deploy multiple application containers behind a load balancer
2. **Database Replication**: Use MySQL replication for read scalability
3. **Caching**: Implement Redis for session storage and caching
4. **CDN**: Use a CDN for static assets
5. **Container Orchestration**: Consider Kubernetes for large-scale deployments

## Troubleshooting

### Common Issues

**Database Connection Failed**

- Verify `DATABASE_URL` is correct
- Ensure MySQL is running and accessible
- Check firewall rules

**Application Won't Start**

- Check logs: `docker-compose logs app`
- Verify all required environment variables are set
- Ensure port 3000 is not already in use

**File Upload Issues**

- Verify S3/storage credentials are correct
- Check file size limits in nginx/proxy configuration
- Ensure sufficient disk space

### Health Checks

Test application health:

```bash
# Check if application is responding
curl http://localhost:3000

# Check database connectivity
docker-compose exec app pnpm db:push --dry-run
```

## Backup and Recovery

### Database Backup

Create automated backups:

```bash
# Backup database
docker-compose exec db mysqldump -u root -p maintenance_tracker > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T db mysql -u root -p maintenance_tracker < backup_20240101.sql
```

### Application Backup

Backup uploaded files and configuration:

```bash
# Backup environment configuration
cp .env .env.backup

# If using local file storage, backup uploads directory
tar -czf uploads_backup.tar.gz /path/to/uploads
```

## Support and Maintenance

For issues or questions:

1. Check application logs for error messages
2. Review this documentation for common solutions
3. Consult the project README for additional information
4. Open an issue in the project repository

## Version Updates

To update to a new version:

```bash
# Pull latest code
git pull origin main

# Rebuild containers
docker-compose build

# Restart services
docker-compose up -d

# Run any new migrations
docker-compose exec app pnpm db:push
```
