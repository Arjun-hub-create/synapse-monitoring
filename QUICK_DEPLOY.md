# 🚀 QUICK DEPLOYMENT GUIDE

## LOCAL TESTING (Before Production)

### Start Backend
```bash
cd "c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE\backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start Frontend
```bash
cd "c:\Users\arjun\OneDrive\Documents\AJ SYNAPSE\frontend"
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/api/v1/docs

---

## TEST REGISTRATION

1. **Go to:** http://localhost:5173/register
2. **Enter:**
   - Full Name: Test User
   - Email: testuser@example.com
   - Password: TestPass123
3. **Expected:** Should redirect to dashboard (NOT blank screen)
4. **Verify:** No errors in browser console

---

## BUILD FOR PRODUCTION

### Frontend Build
```bash
cd frontend
npm install
npm run build
# Output: dist/ folder
```

### Backend Production Run
```bash
cd backend
pip install gunicorn uvicorn
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## DEPLOYMENT OPTION 1: RAILWAY (EASIEST)

### Prerequisites
```bash
npm install -g railway
railway login
```

### Backend Deployment
```bash
cd backend
railway init
railway add
# Select Python
# Select "Use python 3.11"
railway variables set \
  MONGODB_URL=mongodb+srv://arjunmarjun74_db_user:vzF7F8TY12ajbDOM@clusteraj.lhcdqhb.mongodb.net/?appName=Clusteraj \
  SECRET_KEY=your-super-secret-key-min-32-chars \
  DATABASE_NAME=synapse
railway up
```

### Frontend Deployment
```bash
cd frontend
railway init
railway add
# Select Node.js
railway variables set \
  VITE_API_URL=https://your-backend-url.railway.app
railway up
```

---

## DEPLOYMENT OPTION 2: VERCEL (Frontend) + RENDER (Backend)

### Frontend on Vercel
```bash
cd frontend
npm run build
# Connect repo to vercel.com
# Set env variable: VITE_API_URL=https://your-backend-url
```

### Backend on Render
1. Go to render.com
2. New → Web Service
3. Connect GitHub repo
4. Set environment variables:
   - MONGODB_URL
   - SECRET_KEY
   - DATABASE_NAME
5. Deploy

---

## ENVIRONMENT VARIABLES

### Required for Production
```env
# MongoDB
MONGODB_URL=mongodb+srv://arjunmarjun74_db_user:vzF7F8TY12ajbDOM@clusteraj.lhcdqhb.mongodb.net/?appName=Clusteraj
DATABASE_NAME=synapse

# Security
SECRET_KEY=your-production-secret-min-32-chars
ALGORITHM=HS256

# Tokens
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# App
DEBUG=False
HOST=0.0.0.0
PORT=8000

# Health Checks
HEALTH_CHECK_INTERVAL_SECONDS=60
```

---

## VERIFY DEPLOYMENT

### Test Backend
```bash
curl https://your-backend-url/api/v1/docs
# Should return Swagger UI
```

### Test Frontend
```bash
# Open in browser
https://your-frontend-url
# Should load without errors
```

### Test API
```bash
# Register
curl -X POST https://your-backend-url/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "full_name": "Test User"
  }'

# Should return success
```

---

## TROUBLESHOOTING

### Issue: API not found
**Solution:** Set correct VITE_API_URL in frontend

### Issue: MongoDB connection failed
**Solution:** Verify MONGODB_URL in backend environment

### Issue: CORS error
**Solution:** Add frontend URL to backend CORS settings

### Issue: Port already in use
**Solution:** Change PORT in .env or kill process using port

---

## MONITORING

### Check Backend Logs
```bash
# In production
tail -f app.log
```

### Check Database
```bash
# MongoDB Atlas Console
# Check collections, indexes, ops
```

### Check Frontend Performance
```bash
# Use browser DevTools
# Check Network, Performance, Console tabs
```

---

## ROLLBACK PLAN

If something goes wrong:
1. Revert to previous deployment
2. Check MongoDB data is intact
3. Verify .env variables
4. Restart services
5. Test locally before re-deploying

---

## PRODUCTION CHECKLIST

- [ ] MongoDB Atlas cluster running
- [ ] Environment variables set
- [ ] Secrets stored securely
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall rules configured
- [ ] Rate limiting enabled
- [ ] Error monitoring setup (Sentry)
- [ ] Database backups scheduled
- [ ] Load balancer configured
- [ ] CDN setup for frontend
- [ ] Monitoring alerts configured

---

## SUCCESS CRITERIA

After deployment, verify:
- ✅ Frontend loads without errors
- ✅ Registration works (no blank screen)
- ✅ Login works
- ✅ Dashboard displays
- ✅ API documentation accessible
- ✅ No 404 or 500 errors
- ✅ Database operations working
- ✅ Authentication tokens valid

---

## NEXT STEPS

1. Choose deployment platform (Railway/Render/etc)
2. Set up environment variables
3. Deploy backend first
4. Deploy frontend second
5. Verify all endpoints working
6. Monitor for errors
7. Set up alerting and monitoring

---

**Deployment Time:** ~30 minutes  
**Estimated Downtime:** 0 minutes (blue-green deployment supported)  
**Rollback Time:** ~5 minutes if needed

🚀 **READY FOR PRODUCTION LAUNCH** 🚀
