@echo off
REM filepath: server/scripts/setup.bat
setlocal enabledelayedexpansion
cd /d "%~dp0\..\.."

echo.
echo ======================================
echo   DishDiscovery - Project Setup
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed
    pause
    exit /b 1
)

echo [OK] npm found
npm --version
echo.

REM Install root dependencies
echo [INFO] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install root dependencies
    pause
    exit /b 1
)
echo [OK] Root dependencies installed
echo.

REM Install server dependencies
echo [INFO] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install server dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Server dependencies installed
cd ..
echo.

REM Install client dependencies
echo [INFO] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install client dependencies
    cd ..
    pause
    exit /b 1
)
echo [OK] Client dependencies installed
cd ..
echo.

REM Create .env file in server if not exists
if not exist "server\.env" (
    echo [INFO] Creating server\.env file...
    (
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=dishcovery
        echo DB_PORT=3306
        echo JWT_SECRET=your_super_secret_jwt_key_change_in_production
        echo NODE_ENV=development
        echo PORT=5000
    ) > server\.env
    echo [OK] server\.env created with defaults
)
echo.

REM Setup database
echo ======================================
echo   Database Setup
echo ======================================
echo.
echo [IMPORTANT] Make sure MySQL is running!
echo.
pause

echo [INFO] Running database setup...
cd server
call npm run db:setup
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed!
    echo Please check:
    echo   1. MySQL is running
    echo   2. Database credentials in server\.env are correct
    echo   3. Database user has CREATE DATABASE privileges
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo [INFO] Sample Accounts Created:
echo   Admin:       admin@dishcovery.com / password123
echo   Owner 1:     owner1@dishcovery.com / password123
echo   Owner 2:     owner2@dishcovery.com / password123
echo   Customer 1:  customer1@dishcovery.com / password123
echo   Customer 2:  customer2@dishcovery.com / password123
echo.
echo [INFO] Next steps:
echo   1. Terminal 1 - Start server:  cd server ^& npm run dev
echo   2. Terminal 2 - Start client:  cd client ^& npm start
echo.
pause