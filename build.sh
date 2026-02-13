#!/bin/bash
# Build script for Render deployment

echo "=========================================="
echo "Building SYNAPSE Full Stack for Render"
echo "=========================================="

# Build frontend
echo ""
echo "[1/3] Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
  echo "Frontend npm install failed"
  exit 1
fi

echo "[2/3] Building frontend..."
npm run build
if [ $? -ne 0 ]; then
  echo "Frontend build failed"
  exit 1
fi

cd ..

# Install Python dependencies
echo "[3/3] Installing Python dependencies..."
cd backend
pip install -r requirements.txt
if [ $? -ne 0 ]; then
  echo "Python dependencies failed"
  exit 1
fi

cd ..

echo ""
echo "=========================================="
echo "Build complete! Ready for deployment"
echo "=========================================="
