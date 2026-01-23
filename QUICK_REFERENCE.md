# 🔧 Quick Reference & Troubleshooting

Fast lookup guide for common issues and commands.

---

## ⚡ Quick Commands

### Start Everything (After First Setup)

```powershell
# Terminal 1 - Backend
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server
npm start

# Terminal 2 - Frontend  
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client
npm start
```

Then visit: **http://localhost:3000**

---

### Setup Database (First Time Only)

```powershell
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\database
node setup.js
```

Expected: "✅ Database setup completed"

---

### Stop Servers

```powershell
# In each terminal, press: Ctrl + C
```

---

## 🚨 Common Issues & Fixes

### ❌ "Cannot find module 'mysql2'"

**Cause**: Dependencies not installed

**Fix**:
```powershell
cd server
npm install
```

---

### ❌ "MySQL connection failed"

**Cause**: MySQL not running OR wrong credentials

**Fix 1**: Start MySQL service
```powershell
Get-Service MySQL80
# Should say: Running

# If not running:
Start-Service MySQL80
```

**Fix 2**: Check credentials in `server/.env`
```env
DB_HOST=localhost    # ← Must be localhost, not 127.0.0.1
DB_USER=root
DB_PASSWORD=         # ← Empty if no password
DB_PORT=3306
```

**Fix 3**: Test MySQL manually
```powershell
mysql -u root -p
# Press Enter if no password
# You should see: mysql>
# Type: exit
```

---

### ❌ "Port 3000 already in use"

**Cause**: Another process using the port

**Fix 1**: Kill the process
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill it (replace 1234 with actual PID)
taskkill /PID 1234 /F
```

**Fix 2**: Use different port
```powershell
set PORT=3001
npm start
```

---

### ❌ "Port 5000 already in use"

**Same fix as above**, but for port 5000

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

### ❌ "React failed to compile"

**Cause**: Syntax error in React code

**Fix**:
```powershell
# Stop (Ctrl+C)
# Check browser console (F12) for error
# Fix the error in the file
# npm start automatically recompiles
```

---

### ❌ "Cannot GET /api/restaurants"

**Cause**: Backend server not running

**Fix**:
```powershell
# Open Terminal 1
cd server
npm start

# Should show:
# ✅ Server running on http://localhost:5000
```

---

### ❌ "Email already exists"

**Cause**: Trying to register with existing email

**Fix**:
- Use different email OR
- Reset database:
```powershell
cd database
node setup.js  # This clears old data
```

---

### ❌ "Invalid token" after login

**Cause**: JWT_SECRET changed OR token expired

**Fix**:
```powershell
# Clear browser storage:
# 1. Open DevTools (F12)
# 2. Application tab → Local Storage → Clear All
# 3. Try login again

# Or restart browser completely
```

---

### ❌ "npm: command not found"

**Cause**: Node.js not installed OR not in PATH

**Fix**:
```powershell
# Check if Node is installed:
node --version
npm --version

# If not, download from: https://nodejs.org/
```

---

## 🔍 Verification Checklist

Before saying "it doesn't work", verify:

```
☐ MySQL service is running:
   Get-Service MySQL80

☐ Backend is running:
   Visit http://localhost:5000/api/health
   Should show: { status: 'OK', ... }

☐ Frontend is running:
   Visit http://localhost:3000
   Should load page (may show loading spinner)

☐ No console errors:
   Press F12 in browser
   Check Console tab for red errors

☐ .env file exists:
   Check: server/.env
   Has: DB_HOST, DB_USER, DB_NAME, etc.

☐ Dependencies installed:
   Check: server/node_modules/ exists
   Check: client/node_modules/ exists
```

---

## 🔌 Port Check Commands

```powershell
# Check if port 3000 is available:
netstat -ano | findstr :3000

# Check if port 5000 is available:
netstat -ano | findstr :5000

# Check if port 3306 is available:
netstat -ano | findstr :3306

# If found, kill the process:
taskkill /PID <PID> /F
```

---

## 🗄️ Database Commands

### Access MySQL CLI

```powershell
mysql -u root -p
# Password: (press Enter if empty)
```

### Once Inside MySQL CLI

```sql
-- List databases
SHOW DATABASES;

-- Select database
USE dishcovery;

-- List tables
SHOW TABLES;

-- View users
SELECT * FROM users;

-- View restaurants
SELECT * FROM restaurants;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
EXIT;
```

### Reset Database

```powershell
cd database
node setup.js  # This recreates everything
```

---

## 📝 File Locations (Remember These)

```powershell
# Project root:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery

# Backend:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server

# Frontend:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client

# Database setup:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\database

# Config:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server\.env

# Uploaded images:
C:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server\uploads
```

---

## 🎯 Testing URLs

### Frontend
```
Home:          http://localhost:3000
Login:         http://localhost:3000/login
Register:      http://localhost:3000/register
Restaurants:   http://localhost:3000/restaurants
Dashboard:     http://localhost:3000/dashboard
Profile:       http://localhost:3000/profile
```

### Backend API
```
Health:        http://localhost:5000/api/health
Restaurants:   http://localhost:5000/api/restaurants
Users:         http://localhost:5000/api/auth/me (requires token)
```

### cURL Examples

```powershell
# Get all restaurants
curl http://localhost:5000/api/restaurants

# Health check
curl http://localhost:5000/api/health

# Register (Windows PowerShell):
$body = @{
    email = "test@example.com"
    password = "Test123!@"
    name = "Test User"
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d $body
```

---

## 📊 Service Status Commands

```powershell
# Check MySQL
Get-Service MySQL80

# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check if port 5000 is in use
netstat -ano | findstr :5000

# List all running Node processes
Get-Process node

# Kill all Node processes
Get-Process node | Stop-Process -Force
```

---

## 🔄 Development Workflow

### Making Changes

**Frontend (React)**:
```powershell
1. Edit file in client/src/
2. Save file
3. Browser auto-refreshes
4. Check DevTools (F12) for errors
```

**Backend (Express)**:
```powershell
1. Edit file in server/routes/ or server/db.js
2. Save file
3. If using npm run dev, auto-restarts
4. If using npm start, restart manually (Ctrl+C, npm start)
5. Re-test in browser or curl
```

**Database**:
```powershell
1. Edit file in database/schema.sql
2. Run: node database/setup.js
3. Verify changes with: mysql -u root -p
```

---

## 🎨 Styling Guide

### Frontend Styles
- Global: `client/src/App.css`
- Page styles: `client/src/pages/*.css`
- Component styles: `client/src/components/*.css`
- Home page (fancy): `client/src/pages/Home.css` ✨

### Color Scheme (New Design)
```
Primary:    #667eea (purple)
Secondary:  #764ba2 (dark purple)
Gold:       #f59e0b (ratings)
Dark:       #1e293b (text)
Light:      #e2e8f0 (secondary text)
```

---

## 🔐 .env File Template

If you need to recreate `server/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dishcovery
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# File Upload (Optional)
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=./uploads
```

---

## 🚀 Performance Tips

### Frontend Optimization
- Clear browser cache: Ctrl+Shift+Delete
- Disable extensions temporarily
- Open DevTools → Performance tab → Profile

### Backend Optimization
- Use `npm run dev` during development (nodemon)
- Monitor database queries
- Check MySQL connection pool status

### Database Optimization
- Use indexes on frequently searched columns
- Analyze queries with EXPLAIN
- Regular backups

---

## 📚 Documentation Files

```
WINDOWS_SETUP_GUIDE.md       ← How to setup on Windows
PROJECT_ARCHITECTURE.md       ← System design & data flow
QUICK_REFERENCE.md           ← This file
README.md                    ← Project overview
ADMIN_API.md                 ← API documentation
UPLOAD_API.md                ← File upload specifics
VALIDATION_GUIDE.md          ← Input validation rules
APPROVAL_WORKFLOW.md         ← Restaurant approval flow
```

---

## ⏱️ Typical Startup Time

```
npm install (first time):    ~2-3 minutes
npm start (frontend):        ~30 seconds
npm start (backend):         ~5 seconds
Database setup:              ~10 seconds
First page load:             ~5 seconds
```

---

## 📞 Quick Support

**Problem**: Application won't start
→ Check: MySQL running + ports free + dependencies installed

**Problem**: Database won't connect  
→ Check: Credentials in .env match MySQL setup

**Problem**: Frontend shows blank
→ Check: Backend running + DevTools F12 for errors

**Problem**: Can't login
→ Check: User registered first + email/password correct

**Problem**: Images won't upload
→ Check: server/uploads/ folder exists + correct permissions

---

## 🎯 Success Indicators

✅ You're done when you see:

**Terminal 1 (Backend)**:
```
✅ Server running on http://localhost:5000
✅ MySQL connected successfully
```

**Terminal 2 (Frontend)**:
```
Compiled successfully!
You can now view client in the browser.
Local: http://localhost:3000
```

**Browser**:
```
Dishcovery homepage loads with:
- Fancy dark hero section
- Search bar
- Statistics cards
- Feature cards
- Restaurants section
```

---

## 🎉 Now What?

1. Explore the application
2. Register a test account
3. Browse restaurants (may be empty until data added)
4. Check admin dashboard
5. Review the code in Visual Studio Code
6. Make modifications as needed

---

**Last Updated**: January 23, 2026  
**Windows Version**: 10/11  
**Project Status**: ✅ Production Ready
