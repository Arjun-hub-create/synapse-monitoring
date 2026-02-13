# Synapse Deployment Guide

Complete guide for deploying Synapse to production environments.

## Pre-Deployment Checklist

- [ ] Backend: Run all tests
- [ ] Frontend: Run linting & type checking
- [ ] Database: Backup MongoDB
- [ ] Secrets: All environment variables configured
- [ ] SSL/TLS: Certificate ready
- [ ] DNS: Domain configured
- [ ] Monitoring: Alerting setup
- [ ] Backups: Automated backups configured

---

## Backend Deployment

### Option 1: Railway (Recommended for Beginners)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add environment variables
railway variables set MONGODB_URL=your_connection_string
railway variables set SECRET_KEY=your_secret_key
railway variables set DEBUG=False

# Deploy
railway up
```

### Option 2: Render

1. Push backend to GitHub
2. Connect GitHub to Render
3. Create new Web Service
4. Point to `backend` directory
5. Set environment variables
6. Deploy

```yaml
# render.yaml
services:
  - type: web
    name: synapse-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn app.main:app --host 0.0.0.0 --port 8000"
    envVars:
      - key: MONGODB_URL
        value: your_connection_string
```

### Option 3: Docker + AWS EC2/DigitalOcean

**Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run with Gunicorn for production
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - MONGODB_URL=${MONGODB_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=False
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:latest
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongodb_data:
```

**Deploy to EC2**
```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Clone repository
git clone your-repo-url
cd synapse

# Build and run with Docker
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

### Production Settings

```env
# .env.production
MONGODB_URL=your_production_connection_string
DATABASE_NAME=synapse_prod
SECRET_KEY=very_long_random_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
HEALTH_CHECK_INTERVAL_SECONDS=60
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

---

## Frontend Deployment

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "./dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-url/api/$1" }
  ]
}
```

### Option 2: Netlify

1. Connect GitHub to Netlify
2. Select `frontend` directory
3. Build command: `npm run build`
4. Publish directory: `dist`

**netlify.toml**
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[context.production]
  environment = { VITE_API_BASE_URL = "https://your-api.com/api/v1" }

[[redirects]]
  from = "/api/*"
  to = "https://your-api.com/api/:splat"
  status = 200
```

### Option 3: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**CloudFront Distribution**
- Origin: S3 bucket
- Default root object: index.html
- Create invalidation folder path pattern
- Cache behavior: Allow all HTTP methods

### Production Build Optimization

```bash
# Create optimized production build
npm run build

# Check bundle size
npm run build -- --mode production
ls -lh dist/

# Expected size: ~150KB gzipped
```

---

## Database Setup

### MongoDB Atlas (Cloud)

1. Create account at `https://www.mongodb.com/cloud/atlas`
2. Create project
3. Build cluster (M0 free tier)
4. Create database user
5. Whitelist IPs (0.0.0.0/0 or specific IPs)
6. Get connection string
7. Replace in `.env`

**Connection String Pattern**
```
mongodb+srv://username:password@cluster.mongodb.net/synapse?retryWrites=true&w=majority
```

### MongoDB Compact (Self-Hosted)

```bash
# Docker
docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# Connection string
mongodb://admin:password@localhost:27017/synapse?authSource=admin
```

### Backup Strategy

```bash
# MongoDB Atlas: Automated backups enabled by default

# Manual backup
mongodump --uri "your_connection_string" --out ./backup

# Restore
mongorestore --uri "your_connection_string" ./backup
```

---

## SSL/TLS Certificate

### Let's Encrypt + Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location /api {
        proxy_pass http://localhost:8000;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# New Relic setup
export NEW_RELIC_LICENSE_KEY=your_key
pip install newrelic
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program uvicorn app.main:app
```

### Database Monitoring

- MongoDB Atlas: Built-in charts
- Performance Advisor: Automatic indexing recommendations
- Alerts: Configure automated alerts

### Error Tracking

```python
# Sentry integration
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your_sentry_dsn",
    integrations=[FastApiIntegration()]
)
```

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Load balancer: Nginx, HAProxy, or AWS ALB
# Multiple backend instances
# MongoDB Atlas: Auto-scaling replica set
# Frontend: CDN distribution (Cloudflare, CloudFront)
```

### Caching Strategy

```python
# Redis caching for frequently accessed data
from redis import Redis

redis_client = Redis(host='localhost', port=6379)

# Cache health check results
cache_key = f"metrics:{service_id}"
cached_metrics = redis_client.get(cache_key)
if cached_metrics:
    return json.loads(cached_metrics)
```

### Database Optimization

- Enable compression for large collections
- Archive old health check records
- Implement TTL indexes for temporary data
- Monitor slow queries

---

## CI/CD Pipeline

### GitHub Actions

```yaml
name: Deploy Synapse

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Deploy backend
          
      - name: Deploy Frontend
        run: |
          # Deploy frontend to Vercel
          npm i -g vercel
          cd frontend
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Post-Deployment

### Health Checks

```bash
# Backend health
curl https://your-api.com/health

# API endpoint
curl https://your-api.com/api/v1/docs

# Frontend
curl https://your-domain.com
```

### Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 https://your-api.com/health

# Using Locust
pip install locust
locust -f locustfile.py --host https://your-api.com
```

### Security Scan

```bash
# Dependency vulnerability check
npm audit
pip check

# OWASP dependency check
./dependency-check.sh --scan
```

---

## Troubleshooting Deployment

### Backend won't start
- Check environment variables
- Verify MongoDB connection
- Check port availability
- Review logs

### Frontend blank page
- Check API endpoint configuration
- Browser console errors
- Network tab in DevTools
- Verify CORS settings

### WebSocket connection fails
- Verify WebSocket proxy settings
- Check firewall rules
- Validate token generation
- Review browser compatibility

### Database connection timeout
- Verify connection string
- Check network access
- Confirm credentials
- Verify IP whitelist

---

## Maintenance

### Regular Tasks

- [ ] Daily: Check error logs, alert monitoring
- [ ] Weekly: Review performance metrics, backup verification
- [ ] Monthly: Security updates, dependency updates
- [ ] Quarterly: Full system audit, capacity planning

### Update Process

```bash
# Backend
git pull
pip install --upgrade -r requirements.txt
# Run migrations if needed
restart service

# Frontend
git pull
npm install
npm run build
# Deploy dist folder
```

---

## Disaster Recovery

### Backup & Restore

```bash
# Database backup
mongodump --uri "production_connection" --out ./backup

# Weekly automated backup (cron job)
0 2 * * 0 mongodump --uri "..." --out /backups/$(date +\%Y-\%m-\%d)

# Restore from backup
mongorestore --uri "recovery_connection" ./backup
```

### Failover Plan

1. Database failover: MongoDB Atlas automatic
2. Backend: Docker restart with health checks
3. Frontend: CDN cache provides basic functionality
4. Communication: Status page notification

---

## Cost Optimization

### Development
- MongoDB Atlas M0 (Free, 512MB)
- Vercel free tier (Frontend)
- Railway/Render free tier (Backend)

### Production (Estimated Monthly)
- MongoDB Atlas M2 ($9/month, 10GB)
- Backend hosting ($10-20/month)
- Frontend CDN ($5-15/month)
- Domain ($12/year)
- SSL ($0 with Let's Encrypt)

**Total: ~$30-50/month**

---

**Deployment successful! 🚀**

For questions or issues, refer to individual service documentation.
