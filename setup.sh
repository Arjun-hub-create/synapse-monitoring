#!/bin/bash
# Quick Start Script for Synapse
# This script automates the initial setup

echo "====================================="
echo "  Synapse - Quick Start Setup"
echo "====================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.9+"
    exit 1
fi
echo "✅ Python version: $(python3 --version)"

echo ""
echo "Setting up Backend..."
echo "====================================="

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your MongoDB connection string"
fi

echo "✅ Backend setup complete!"

echo ""
echo "Setting up Frontend..."
echo "====================================="

cd ../frontend

# Install npm dependencies
echo "Installing npm dependencies..."
npm install

echo "✅ Frontend setup complete!"

echo ""
echo "====================================="
echo "  Setup Complete! 🎉"
echo "====================================="
echo ""
echo "To start the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "API Documentation: http://localhost:8000/api/v1/docs"
echo ""
echo "====================================="
