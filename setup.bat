@echo off
REM Quick Start Script for Synapse (Windows)
REM This script automates the initial setup

echo =====================================
echo   Synapse - Quick Start Setup
echo =====================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo XX Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK Node.js version: %NODE_VERSION%

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo XX Python 3 not found. Please install Python 3.9+
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo OK %PYTHON_VERSION%

echo.
echo Setting up Backend...
echo =====================================

cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo XX Please edit backend\.env with your MongoDB connection string
)

echo OK Backend setup complete!

echo.
echo Setting up Frontend...
echo =====================================

cd ..\frontend

REM Install npm dependencies
echo Installing npm dependencies...
call npm install

echo OK Frontend setup complete!

echo.
echo =====================================
echo   Setup Complete! 🎉
echo =====================================
echo.
echo To start the application:
echo.
echo Backend (Terminal 1):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   uvicorn app.main:app --reload
echo.
echo Frontend (Terminal 2):
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo API Documentation: http://localhost:8000/api/v1/docs
echo.
echo =====================================

pause
