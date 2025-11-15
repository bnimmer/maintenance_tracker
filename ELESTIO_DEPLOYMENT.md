# Elestio Deployment Guide - Machinery Maintenance Tracker

This guide provides step-by-step instructions for deploying the Machinery Maintenance Tracker application on Elestio.

## What is Elestio?

Elestio is a fully managed DevOps platform that simplifies application deployment and management. It provides automated deployments, backups, monitoring, and scaling capabilities.

## Prerequisites

- An Elestio account (sign up at https://elest.io)
- A GitHub repository containing this application code
- Basic understanding of environment variables

## Deployment Methods

### Method 1: Deploy from GitHub (Recommended)

This method automatically deploys your application from a GitHub repository with CI/CD integration.

#### Step 1: Push Code to GitHub

Ensure your code is pushed to a GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Create New Service on Elestio

1. Log in to your Elestio dashboard
2. Click **"Create Service"**
3. Select **"Custom"** or **"Docker Compose"** template
4. Choose your preferred cloud provider and region
5. Select your instance size (minimum recommended: 2 vCPU, 4GB RAM)

#### Step 3: Configure Repository

1. In the **"Source"** section, select **"GitHub"**
2. Connect your GitHub account if not already connected
3. Select your repository and branch (usually `main`)
4. Set the **Docker Compose file** path to `docker-compose.elestio.yml`

#### Step 4: Configure Environment Variables

Elestio will automatically detect variables from `elestio.yml`. Review and update the following:

**Required Variables:**
- `DATABASE_URL` - Auto-configured by Elestio
- `JWT_SECRET` - Auto-generated secure random string
- `MYSQL_ROOT_PASSWORD` - Auto-generated
- `MYSQL_PASSWORD` - Auto-generated

**Optional Variables (for Manus OAuth):**
- `OAUTH_SERVER_URL` - Default: `https://api.manus.im`
- `VITE_OAUTH_PORTAL_URL` - Default: `https://oauth.manus.im`
- `VITE_APP_ID` - Your Manus application ID
- `OWNER_OPEN_ID` - Your owner identifier
- `OWNER_NAME` - Your name

**S3 Storage Variables (if using file uploads):**
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_KEY`
- `VITE_FRONTEND_FORGE_API_URL`

#### Step 5: Deploy

1. Review your configuration
2. Click **"Create Service"**
3. Elestio will automatically:
   - Provision infrastructure
   - Clone your repository
   - Build Docker images
   - Start services
   - Configure SSL/TLS certificates

#### Step 6: Run Database Migrations

After deployment completes:

1. Go to your service dashboard
2. Click **"Terminal"** or **"SSH"**
3. Run the migration command:

```bash
docker-compose exec app pnpm db:push
```

Alternatively, you can add this to a post-deployment script (see Advanced Configuration below).

#### Step 7: Access Your Application

1. Find your service URL in the Elestio dashboard (e.g., `https://your-app.vm.elestio.app`)
2. Open the URL in your browser
3. Sign in and start using the application

### Method 2: Manual Docker Deployment

If you prefer manual control, you can deploy using Elestio's Docker environment.

#### Step 1: Create Docker Service

1. Create a new service on Elestio
2. Select **"Docker"** template
3. Choose your cloud provider and instance size

#### Step 2: SSH into Your Instance

```bash
ssh root@your-instance-ip
```

#### Step 3: Clone Repository

```bash
cd /opt
git clone <your-github-repo-url> machinery-maintenance-tracker
cd machinery-maintenance-tracker
```

#### Step 4: Configure Environment

Create a `.env` file:

```bash
nano .env
```

Add your environment variables:

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@172.17.0.1:3306/maintenance_tracker
JWT_SECRET=your-secure-random-string
MYSQL_ROOT_PASSWORD=your-mysql-root-password
MYSQL_DATABASE=maintenance_tracker
MYSQL_USER=appuser
MYSQL_PASSWORD=your-app-password
NODE_ENV=production
```

#### Step 5: Deploy with Docker Compose

```bash
# Use the Elestio-specific compose file
docker-compose -f docker-compose.elestio.yml up -d

# Run migrations
docker-compose -f docker-compose.elestio.yml exec app pnpm db:push
```

## Advanced Configuration

### Custom Domain

1. In Elestio dashboard, go to **"Domains"**
2. Add your custom domain (e.g., `maintenance.yourdomain.com`)
3. Update your DNS records as instructed
4. Elestio will automatically provision SSL certificates

### Automated Backups

Elestio provides automated backups:

1. Go to **"Backups"** in your service dashboard
2. Configure backup schedule (daily, weekly, etc.)
3. Set retention policy
4. Enable automatic restoration testing

### Monitoring and Alerts

1. Navigate to **"Monitoring"** in your service dashboard
2. Configure alerts for:
   - CPU usage
   - Memory usage
   - Disk space
   - Application downtime
3. Add notification channels (email, Slack, etc.)

### Scaling

To scale your application:

1. Go to **"Settings"** → **"Resources"**
2. Increase vCPU and RAM as needed
3. For horizontal scaling, enable **"Load Balancing"**
4. Configure multiple application instances

### CI/CD Integration

Elestio automatically deploys on git push. To customize:

1. Go to **"CI/CD"** settings
2. Configure deployment triggers:
   - Push to specific branches
   - Pull request merges
   - Manual deployments only
3. Add pre/post deployment scripts

**Example Post-Deployment Script:**

Create `.elestio/scripts/post-deploy.sh`:

```bash
#!/bin/bash
echo "Running database migrations..."
docker-compose exec -T app pnpm db:push

echo "Checking application health..."
curl -f http://localhost:3000 || exit 1

echo "Deployment completed successfully!"
```

Make it executable:

```bash
chmod +x .elestio/scripts/post-deploy.sh
```

### Environment-Specific Configuration

For different environments (staging, production):

1. Create separate Elestio services
2. Use different branches or repositories
3. Configure environment-specific variables
4. Use different database instances

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
docker-compose -f docker-compose.elestio.yml logs app
```

**Common issues:**
- Missing environment variables
- Database connection failures
- Port conflicts

### Database Connection Issues

**Verify database is running:**
```bash
docker-compose -f docker-compose.elestio.yml ps db
```

**Check database logs:**
```bash
docker-compose -f docker-compose.elestio.yml logs db
```

**Test connection:**
```bash
docker-compose -f docker-compose.elestio.yml exec db mysql -u root -p
```

### SSL Certificate Issues

Elestio automatically manages SSL certificates. If you encounter issues:

1. Check domain DNS settings
2. Verify domain is properly configured in Elestio
3. Wait up to 10 minutes for certificate provisioning
4. Contact Elestio support if issues persist

### Performance Issues

**Check resource usage:**
```bash
docker stats
```

**Optimize database:**
```bash
docker-compose -f docker-compose.elestio.yml exec db mysql -u root -p
OPTIMIZE TABLE machines, maintenance_history, maintenance_schedules;
```

**Scale resources:**
- Increase instance size in Elestio dashboard
- Enable caching (Redis)
- Configure CDN for static assets

## Maintenance

### Updating the Application

**Automatic updates (CI/CD enabled):**
```bash
git push origin main
```
Elestio will automatically deploy the update.

**Manual updates:**
```bash
cd /opt/machinery-maintenance-tracker
git pull origin main
docker-compose -f docker-compose.elestio.yml build
docker-compose -f docker-compose.elestio.yml up -d
docker-compose -f docker-compose.elestio.yml exec app pnpm db:push
```

### Database Backups

**Manual backup:**
```bash
docker-compose -f docker-compose.elestio.yml exec db mysqldump -u root -p maintenance_tracker > backup_$(date +%Y%m%d).sql
```

**Restore backup:**
```bash
docker-compose -f docker-compose.elestio.yml exec -T db mysql -u root -p maintenance_tracker < backup_20240101.sql
```

### Monitoring Logs

**Real-time logs:**
```bash
docker-compose -f docker-compose.elestio.yml logs -f app
```

**Application logs only:**
```bash
docker-compose -f docker-compose.elestio.yml logs -f --tail=100 app
```

## Security Best Practices

1. **Use Strong Passwords**: Ensure all auto-generated passwords are strong
2. **Enable Firewall**: Elestio provides built-in firewall configuration
3. **Regular Updates**: Keep dependencies and Docker images updated
4. **SSL/TLS**: Always use HTTPS (automatic with Elestio)
5. **Access Control**: Limit SSH access to trusted IPs
6. **Backup Encryption**: Enable encrypted backups in Elestio settings

## Cost Optimization

1. **Right-size instances**: Start small and scale as needed
2. **Use backup retention policies**: Don't keep unnecessary backups
3. **Monitor resource usage**: Identify and fix inefficiencies
4. **Use spot instances**: For non-critical environments
5. **Schedule downtime**: For development/staging environments

## Support

### Elestio Support
- Documentation: https://docs.elest.io
- Support Portal: https://elest.io/support
- Community Forum: https://community.elest.io

### Application Support
- Check application logs first
- Review this documentation
- Consult the main README.md
- Open an issue in the GitHub repository

## Additional Resources

- [Elestio Documentation](https://docs.elest.io)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/refman/8.0/en/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Quick Reference

### Common Commands

```bash
# View running services
docker-compose -f docker-compose.elestio.yml ps

# Restart application
docker-compose -f docker-compose.elestio.yml restart app

# View logs
docker-compose -f docker-compose.elestio.yml logs -f

# Run migrations
docker-compose -f docker-compose.elestio.yml exec app pnpm db:push

# Access database
docker-compose -f docker-compose.elestio.yml exec db mysql -u root -p

# Check disk usage
df -h

# Check memory usage
free -h
```

### Environment Variables Quick Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | MySQL connection string |
| JWT_SECRET | Yes | - | Secret for JWT tokens |
| MYSQL_ROOT_PASSWORD | Yes | - | MySQL root password |
| MYSQL_DATABASE | No | maintenance_tracker | Database name |
| MYSQL_USER | No | appuser | Database user |
| MYSQL_PASSWORD | Yes | - | Database password |
| NODE_ENV | No | production | Node environment |
| VITE_APP_TITLE | No | Machinery Maintenance Tracker | App title |

## Conclusion

Deploying on Elestio simplifies the entire deployment process with automated infrastructure provisioning, SSL certificates, backups, and monitoring. Follow this guide to get your Machinery Maintenance Tracker application running in production quickly and securely.
