# Synapse - System Monitoring Platform

A production-ready, real-time system monitoring platform with a modern FastAPI backend and a beautiful React dashboard.

## Overview

Synapse provides comprehensive service monitoring with:

- **Real-time Health Checks** - Automated periodic service monitoring
- **Live Dashboard** - Beautiful cyberpunk-themed UI with live metrics
- **Alert System** - Intelligent alerts on service failures
- **WebSocket Updates** - Instant metric streaming to connected clients
- **Historical Analytics** - Track uptime, performance trends
- **Centralized Logging** - Event tracking and audit logs

## Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Synapse System Monitoring Platform             │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  Frontend (React)    │   Backend (FastAPI)             │
│  Port: 5173          │   Port: 8000                    │
│  ├─ Dashboard        │   ├─ Authentication (JWT)       │
│  ├─ Alerts           │   ├─ Service Registry           │
│  ├─ Logs             │   ├─ Health Check Scheduler     │
│  └─ Charts           │   ├─ Alert Engine               │
│                      │   ├─ WebSocket Server           │
│                      │   └─ Logging Service            │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │  MongoDB Atlas (Cloud)  │
        ├─────────────────────────┤
        │  Collections:           │
        │  ├─ users              │
        │  ├─ services           │
        │  ├─ health_checks      │
        │  ├─ alerts             │
        │  └─ logs               │
        └─────────────────────────┘
```

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Run server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`  
API Docs: `http://localhost:8000/api/v1/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Default Test Credentials

```
Email: test@example.com
Password: password123
```

## Features Overview

### 1. User Authentication
- Secure JWT-based authentication
- Password hashing with bcrypt
- Refresh token mechanism
- Protected endpoints

### 2. Service Management
- Register services with health check URLs
- Service metadata and descriptions
- CRUD operations
- Soft deletion support

### 3. Health Monitoring
- **Automated Periodic Checks**: Configurable interval (default: 60 seconds)
- **Latency Measurement**: Response time tracking in milliseconds
- **Status Classification**: Healthy, Unhealthy, Degraded
- **Historical Data**: Time-series storage for analytics

### 4. Alert System
- Automatic alerts on service failures
- Alert severity levels (info, warning, critical)
- Repeated failure detection
- Alert resolution tracking
- Deduplication to prevent alert storm

### 5. Real-time Updates
- WebSocket endpoint for live metrics
- Instant alert notifications
- Live status streaming
- Scalable connection management

### 6. Logging & Analytics
- Centralized event logging
- Structured logs with timestamps
- Service-level metrics
- Performance analytics
- Historical trend analysis

### 7. Dashboard UI
- Cyberpunk dark theme with neon accents
- Real-time metric visualization
- Interactive charts (Recharts)
- Smooth animations (Framer Motion)
- Responsive mobile design
- Terminal-style log viewer

## API Endpoints

All endpoints require JWT Bearer token in Authorization header.

### Authentication (Public)
```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login and get tokens
POST   /api/v1/auth/refresh         # Refresh access token
```

### Services
```
GET    /api/v1/services             # List user's services
POST   /api/v1/services             # Create new service
GET    /api/v1/services/{id}        # Get service details
PATCH  /api/v1/services/{id}        # Update service
DELETE /api/v1/services/{id}        # Delete service
```

### Health Checks
```
POST   /api/v1/health/{id}/check    # Trigger manual check
GET    /api/v1/health/{id}/history  # Get check history
GET    /api/v1/health/{id}/metrics  # Get service metrics
GET    /api/v1/health/all/metrics   # Get all metrics
```

### Alerts
```
GET    /api/v1/alerts               # List user's alerts
POST   /api/v1/alerts/{id}/resolve  # Resolve an alert
GET    /api/v1/alerts/{id}/service  # Get service alerts
```

### WebSocket
```
WS     /ws/metrics/{token}          # Live metrics stream
```

## Database Schema

### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String (indexed, unique),
  hashed_password: String,
  full_name: String,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

**services**
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (indexed),
  name: String,
  health_check_url: String,
  description: String,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

**health_checks**
```javascript
{
  _id: ObjectId,
  service_id: ObjectId (indexed),
  status: String,          // "healthy", "unhealthy", "degraded"
  response_time_ms: Float,
  status_code: Int,
  error_message: String (optional),
  timestamp: DateTime (indexed)
}
```

**alerts**
```javascript
{
  _id: ObjectId,
  service_id: ObjectId (indexed),
  user_id: ObjectId (indexed),
  alert_type: String,      // "service_down", "high_latency", "repeated_failures"
  message: String,
  severity: String,        // "info", "warning", "critical"
  resolved: Boolean (indexed),
  created_at: DateTime (indexed),
  resolved_at: DateTime (optional)
}
```

**logs**
```javascript
{
  _id: ObjectId,
  type: String,
  service_id: ObjectId (optional),
  user_id: ObjectId (optional),
  level: String,           // "info", "warning", "error", "critical"
  details: Object,
  timestamp: DateTime (indexed)
}
```

## Configuration

### Backend (.env)
```
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/synapse
DATABASE_NAME=synapse
SECRET_KEY=your-long-secret-key-for-jwt
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
HEALTH_CHECK_INTERVAL_SECONDS=60
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Deployment

### Backend Deployment

**Option 1: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Option 2: Railway/Render/Heroku**
- Push backend folder to Git
- Connect MongoDB Atlas
- Deploy with one click

**Option 3: VPS/EC2/DigitalOcean**
- Deploy with Docker or Gunicorn
- Use Nginx as reverse proxy
- Configure SSL/TLS

### Frontend Deployment

**Option 1: Vercel**
```bash
npm install -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

**Option 3: GitHub Pages**
```bash
npm run build
# Deploy dist/ to GitHub Pages
```

**Option 4: AWS S3 + CloudFront**
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

## Performance Optimization

### Backend
- AsyncIO for concurrent operations
- MongoDB indexes on frequently queried fields
- Connection pooling with Motor
- Background job scheduler for health checks
- Efficient database queries with projections

### Frontend
- Code splitting with Vite
- Lazy loading routes
- Image optimization
- CSS-in-JS optimization
- Component memoization
- Debounced API calls

## Security Best Practices

✅ **Implemented**
- JWT authentication with expiration
- Password hashing with bcrypt
- Input validation with Pydantic
- CORS configured
- Protected endpoints

⚠️ **Production Recommendations**
- Use HTTPS/SSL
- Implement rate limiting
- Add token blacklisting
- Use environment variables for secrets
- Enable database encryption at rest
- Implement audit logging
- Use API key for sensitive operations
- Add 2FA support
- Implement DDoS protection

## Monitoring & Logging

### Backend Logs
```
[2024-01-15 12:30:45] INFO: Scheduler started
[2024-01-15 12:30:46] INFO: Starting health checks for 5 services
[2024-01-15 12:30:47] INFO: Auth Service: healthy
```

### Frontend Logs
- Browser console logs
- Error tracking (optional: Sentry)
- Performance monitoring

## Troubleshooting

### Cannot connect to MongoDB
- Verify connection string in .env
- Check MongoDB Atlas network access
- Ensure database exists

### WebSocket connection fails
- Check backend is running
- Verify token is valid
- Check browser WebSocket support

### Animations are slow
- Disable some Framer Motion animations
- Use `will-change` CSS property
- Check browser performance

### Database operations slow
- Add indexes to frequently queried fields
- Implement query optimization
- Use MongoDB Atlas performance advisor

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Future Roadmap

### Phase 2
- [ ] Service dependency graphs
- [ ] Custom alert rules
- [ ] Email/Slack notifications
- [ ] API key authentication
- [ ] Single Sign-On (SSO)

### Phase 3
- [ ] Redis caching
- [ ] Rate limiting
- [ ] Multi-tenant support
- [ ] Grafana integration
- [ ] Prometheus metrics export

### Phase 4
- [ ] Machine learning anomaly detection
- [ ] Predictive alerting
- [ ] Advanced dashboarding
- [ ] Mobile app
- [ ] CLI tools

## License

MIT License - Free for commercial and personal use

## Support & Credits

- Built with FastAPI, React, MongoDB, and Tailwind CSS
- Inspired by modern SaaS platforms
- Community contributions welcome

## Contact

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for system monitoring excellence**

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: February 13, 2026
