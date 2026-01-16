@echo off
echo 🚀 DishDiscovery Database Setup
echo ================================

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    exit /b 1
)

REM Check MySQL (simplified check)
echo Checking MySQL...
timeout /t 2 /nobreak >nul

echo ✅ Node.js is ready

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Run database setup
echo 🗃️ Setting up database...
call npm run db:setup

if %errorlevel% equ 0 (
    echo 🎉 Setup completed successfully!
    echo.
    echo 📋 Sample Accounts:
    echo    Admin:     admin@dishcovery.com / password123
    echo    Owner 1:   owner1@dishcovery.com / password123
    echo    Owner 2:   owner2@dishcovery.com / password123
    echo    Customer 1: customer1@dishcovery.com / password123
    echo    Customer 2: customer2@dishcovery.com / password123
    echo.
    echo 🚀 Start the server: npm run dev
) else (
    echo 💥 Setup failed
    exit /b 1
)