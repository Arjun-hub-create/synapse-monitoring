# Synapse Backend 🚀

Production-ready FastAPI backend for real-time system monitoring.

## Features

✅ **User Authentication**
- JWT-based authentication with access & refresh tokens
- Secure password hashing with bcrypt
- User registration and login

✅ **Service Management**
- Register services to monitor with health check URLs
- Create, read, update, delete services
- Service metadata and descriptions

✅ **Health Monitoring**
- Periodic automated health checks
- Latency measurement
- Status tracking (healthy, unhealthy, degraded)
- Historical data storage

✅ **Real-time Updates**
- WebSocket support for live metrics
- Instant alerts and status updates
- Live streaming of service health data

✅ **Alerting System**
- Automatic alerts on service failures
- Alert severity levels (info, warning, critical)
- Alert resolution tracking
- Failure threshold detection

✅ **Centralized Logging**
- Comprehensive event logging
- Service-level and system-level logs
- Structured logging with timestamps

✅ **API Documentation**
- Auto-generated OpenAPI (Swagger) docs
- ReDoc documentation included
- Clean schema definitions with examples

## Tech Stack

- **FastAPI** - Modern async web framework
- **Motor** - Async MongoDB driver
- **PyMongo** - MongoDB interactions
- **Python-Jose** - JWT token handling
- **Passlib + Bcrypt** - Password security
- **APScheduler** - Background task scheduling
- **Pydantic** - Data validation and serialization
- **HTTPX** - Async HTTP client for health checks

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app and lifespan
│   ├── config.py               # Settings and environment
│   ├── database.py             # MongoDB connection
│   ├── api/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── services.py         # Service CRUD endpoints
│   │   ├── health.py           # Health check endpoints
│   │   ├── alerts.py           # Alert management endpoints
│   │   └── websocket.py        # WebSocket live metrics
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── service.py          # Service model
│   │   ├── health_check.py     # Health check model
│   │   └── alert.py            # Alert model
│   ├── schemas/
│   │   ├── user.py             # User Pydantic schemas
│   │   ├── service.py          # Service Pydantic schemas
│   │   ├── health.py           # Health Pydantic schemas
│   │   └── alert.py            # Alert Pydantic schemas
│   ├── services/
│   │   ├── auth_service.py     # Authentication logic
│   │   ├── health_service.py   # Health check logic
│   │   ├── alert_service.py    # Alert logic
│   │   └── logging_service.py  # Logging logic
│   ├── tasks/
│   │   └── scheduler.py        # Background job scheduler
│   └── middleware/
│       └── error_handler.py    # Global error handling
├── requirements.txt
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.9+
- MongoDB Atlas cluster
- pip

### Installation

1. **Clone/Setup the project**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and SECRET_KEY
```

`.env` file should contain:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/synapse?retryWrites=true&w=majority
DATABASE_NAME=synapse
SECRET_KEY=your-secret-key-min-32-chars-change-this-in-production
DEBUG=True
HEALTH_CHECK_INTERVAL_SECONDS=60
```

### Running the Server

**Development mode:**

```bash
# From backend directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Server starts at: `http://localhost:8000`

### API Documentation

- **Swagger UI**: `http://localhost:8000/api/v1/docs`
- **ReDoc**: `http://localhost:8000/api/v1/redoc`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Services

- `POST /api/v1/services` - Create service
- `GET /api/v1/services` - List user's services
- `GET /api/v1/services/{id}` - Get service details
- `PATCH /api/v1/services/{id}` - Update service
- `DELETE /api/v1/services/{id}` - Delete service

### Health Checks

- `POST /api/v1/health/{service_id}/check` - Trigger manual health check
- `GET /api/v1/health/{service_id}/history` - Get check history
- `GET /api/v1/health/{service_id}/metrics` - Get service metrics
- `GET /api/v1/health/all/metrics` - Get all metrics

### Alerts

- `GET /api/v1/alerts` - List alerts
- `POST /api/v1/alerts/{alert_id}/resolve` - Resolve alert
- `GET /api/v1/alerts/{service_id}/service` - Get service alerts

### WebSocket

- `WS /ws/metrics/{token}` - Live metrics stream

## Database Schema

### Collections

**users**
```javascript
{
  _id: ObjectId,
  email: String (unique),
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
  user_id: ObjectId,
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
  service_id: ObjectId,
  status: String, // "healthy", "unhealthy", "degraded"
  response_time_ms: Float,
  status_code: Int,
  error_message: String (optional),
  timestamp: DateTime
}
```

**alerts**
```javascript
{
  _id: ObjectId,
  service_id: ObjectId,
  user_id: ObjectId,
  alert_type: String, // "service_down", "high_latency", "repeated_failures"
  message: String,
  severity: String, // "info", "warning", "critical"
  resolved: Boolean,
  created_at: DateTime,
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
  level: String, // "info", "warning", "error", "critical"
  details: Object,
  timestamp: DateTime
}
```

## Authentication Flow

1. **Register**: POST `/auth/register` with email, password, full_name
2. **Login**: POST `/auth/login` returns `access_token` & `refresh_token`
3. **Use Token**: Add `Authorization: Bearer {access_token}` to requests
4. **Refresh**: When token expires, use `refresh_token` at `/auth/refresh`

## Background Tasks

The application runs a background scheduler that:

- **Periodic Health Checks**: Checks all active services every N seconds
- **Failure Detection**: Triggers alerts on repeated failures
- **Alert Resolution**: Auto-resolves alerts when service recovers

Scheduler interval configured in `.env`: `HEALTH_CHECK_INTERVAL_SECONDS`

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "timestamp": "2024-01-15T12:30:45"
  }
}
```

## Development

### Running Tests

```bash
pytest -v
# With coverage
pytest --cov=app tests/
```

### Database Migrations

Indexes are automatically created on startup via `init_indexes()` in `database.py`.

### Logging

Logs are printed to console with timestamps. For production, integrate with:
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch
- Datadog
- New Relic

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables (Production)

```
MONGODB_URL=mongodb+srv://***@***.mongodb.net/synapse
DATABASE_NAME=synapse
SECRET_KEY=your-production-secret-key-very-long-and-random
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

## Performance Tips

- Use MongoDB indexes (automatically created)
- Configure connection pooling in Motor
- Set appropriate `HEALTH_CHECK_INTERVAL_SECONDS`
- Use Redis for token blacklisting (future enhancement)
- Implement rate limiting (future enhancement)

## Future Enhancements

- [ ] Token blacklisting with Redis
- [ ] Rate limiting per user
- [ ] Two-factor authentication
- [ ] Email notifications for alerts
- [ ] Slack/Discord integration
- [ ] Custom alert thresholds
- [ ] Service dependency graphs
- [ ] Performance analytics dashboard
- [ ] Multi-tenant support
- [ ] API key authentication

## Security Considerations

✅ Passwords hashed with bcrypt
✅ JWT tokens with expiration
✅ CORS enabled (configure for production)
✅ Input validation with Pydantic
✅ SQL injection immune (using MongoDB driver)
✅ HTTPS recommended in production

## License

MIT License - Built for production use

## Support

For issues, questions, or contributions, please check the main Synapse repository.

---

Built with ❤️ for system monitoring excellence
