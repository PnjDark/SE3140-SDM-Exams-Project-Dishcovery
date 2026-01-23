# ✅ Windows Setup Checklist

Complete step-by-step checklist to run Dishcovery on Windows.

---

## 📋 Pre-Setup Requirements

- [ ] Windows 10 or 11
- [ ] Administrator access
- [ ] At least 2GB free disk space
- [ ] Internet connection
- [ ] PowerShell or Command Prompt

---

## 🔧 Installation (One Time Only)

### Node.js Installation

- [ ] Download Node.js 18+ from https://nodejs.org/
- [ ] Run installer (next, next, finish)
- [ ] Verify installation:
  ```powershell
  node --version    # Should show: v18.x.x or higher
  npm --version     # Should show: 9.x.x or higher
  ```

### MySQL Installation

- [ ] **Option A**: Download MySQL Community Server from https://dev.mysql.com/downloads/mysql/
  - [ ] Choose Windows MSI Installer
  - [ ] Run installer
  - [ ] Setup Type: Developer Default
  - [ ] Port: 3306 (default)
  - [ ] Authentication: Legacy (for mysql2 compatibility)
  - [ ] Root Password: Leave empty OR set secure password
  - [ ] Configure as Windows Service
  - [ ] Complete installation

- [ ] **Option B**: Install XAMPP instead (easier)
  - [ ] Download from https://www.apachefriends.org/
  - [ ] Install XAMPP
  - [ ] Use XAMPP Control Panel to start MySQL
  - [ ] MySQL automatically runs on port 3306

### Verify MySQL is Running

```powershell
Get-Service MySQL80    # Should show "Running"
# OR
Get-Service MySQL83    # Depends on version
```

If not running:
```powershell
Start-Service MySQL80
```

---

## 📂 Project Setup

### Step 1: Open Project Folder

- [ ] Open PowerShell or Command Prompt
- [ ] Navigate to project:
  ```powershell
  cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery
  ```

### Step 2: Install Server Dependencies

- [ ] Navigate to server:
  ```powershell
  cd server
  ```
- [ ] Install packages:
  ```powershell
  npm install
  ```
- [ ] Verify (should show "added XXX packages"):
  - [ ] Look for success message
  - [ ] Check `node_modules` folder exists
  - [ ] No critical errors in output

### Step 3: Install Client Dependencies

- [ ] Navigate to client:
  ```powershell
  cd ..\client
  ```
- [ ] Install packages:
  ```powershell
  npm install
  ```
- [ ] Verify (should show "added XXX packages"):
  - [ ] Look for success message
  - [ ] Check `node_modules` folder exists
  - [ ] No critical errors in output

### Step 4: Setup Database

- [ ] Navigate to database folder:
  ```powershell
  cd ..\database
  ```
- [ ] Run setup script:
  ```powershell
  node setup.js
  ```
- [ ] Verify output shows:
  - [ ] "✅ Connected to MySQL server"
  - [ ] "✅ Database 'dishcovery' ready"
  - [ ] "✅ All tables created successfully"
  - [ ] "✅ Database setup completed"

If error occurs, see troubleshooting section below.

---

## 🚀 Running the Application

### Terminal 1: Start Backend Server

- [ ] Open NEW PowerShell/Command Prompt window
- [ ] Navigate to server:
  ```powershell
  cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server
  ```
- [ ] Start server:
  ```powershell
  npm start
  ```
- [ ] Verify output shows:
  - [ ] "✅ Server running on http://localhost:5000"
  - [ ] "📊 Health check: http://localhost:5000/api/health"
  - [ ] "🍽️  Restaurants: http://localhost:5000/api/restaurants"
  - [ ] No error messages

### Terminal 2: Start Frontend Server

- [ ] Open ANOTHER NEW PowerShell/Command Prompt window
- [ ] Navigate to client:
  ```powershell
  cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client
  ```
- [ ] Start frontend:
  ```powershell
  npm start
  ```
- [ ] Browser should open automatically at http://localhost:3000
- [ ] Verify:
  - [ ] Page loads with fancy dark hero section
  - [ ] Search bar visible
  - [ ] Statistics cards showing
  - [ ] No blank/loading screen for more than 5 seconds

---

## ✔️ Verification Checklist

### Frontend (Port 3000)

- [ ] Browser opens automatically
- [ ] Visit http://localhost:3000 in browser
- [ ] Fancy homepage loads with:
  - [ ] Dark blue/purple gradient background
  - [ ] Search bar with glow effect
  - [ ] "Find Your Perfect Dish" heading
  - [ ] Statistics cards below
  - [ ] Feature cards with animations
  - [ ] No JavaScript errors (F12 → Console)

### Backend (Port 5000)

- [ ] Terminal shows "Server running on http://localhost:5000"
- [ ] Open browser and visit: http://localhost:5000/api/health
- [ ] Shows JSON response:
  ```json
  {
    "status": "OK",
    "server": "Dishcovery API",
    "time": "2026-01-23T...",
    "uptime": "..."
  }
  ```

### Database (Port 3306)

- [ ] MySQL service shows as "Running" in Windows Services
- [ ] Open PowerShell:
  ```powershell
  mysql -u root -p
  # (Press Enter if no password)
  ```
- [ ] MySQL prompt appears: `mysql>`
- [ ] Type: `SHOW DATABASES;`
- [ ] Output includes: `dishcovery` database
- [ ] Type: `exit`

---

## 🧪 Test Basic Functionality

### 1. Register Account

- [ ] Go to http://localhost:3000/register
- [ ] Fill in:
  - [ ] Email: `test@example.com`
  - [ ] Password: `Test123!@`
  - [ ] Name: `Test User`
- [ ] Click "Register"
- [ ] Verify:
  - [ ] Success message appears
  - [ ] Redirected to dashboard OR login page

### 2. Login

- [ ] Go to http://localhost:3000/login
- [ ] Fill in:
  - [ ] Email: `test@example.com`
  - [ ] Password: `Test123!@`
- [ ] Click "Login"
- [ ] Verify:
  - [ ] Login succeeds
  - [ ] Redirected to dashboard
  - [ ] User info shows in navbar

### 3. Check API Response

- [ ] Open PowerShell
- [ ] Test API:
  ```powershell
  curl http://localhost:5000/api/restaurants
  ```
- [ ] Should return JSON (may be empty array):
  ```json
  {
    "success": true,
    "data": []
  }
  ```

---

## 🔧 Common Issues & Quick Fixes

### Issue: "MySQL connection failed"

- [ ] Check MySQL is running:
  ```powershell
  Get-Service MySQL80
  ```
- [ ] If stopped, start it:
  ```powershell
  Start-Service MySQL80
  ```
- [ ] Verify credentials in `server/.env`:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=
  ```
- [ ] Restart server

### Issue: "Port 3000 already in use"

- [ ] Find process using port 3000:
  ```powershell
  netstat -ano | findstr :3000
  ```
- [ ] Note the PID (last column)
- [ ] Kill the process:
  ```powershell
  taskkill /PID <PID_NUMBER> /F
  ```
- [ ] Try npm start again

### Issue: "Cannot find module"

- [ ] Reinstall dependencies:
  ```powershell
  rm -r node_modules package-lock.json
  npm install
  ```

### Issue: React won't compile

- [ ] Check browser console (F12)
- [ ] Fix error in source code
- [ ] Save file
- [ ] Browser auto-reloads

### Issue: Blank page loads

- [ ] Wait 30-60 seconds
- [ ] Hard refresh browser: Ctrl+Shift+R
- [ ] Check console (F12) for errors

---

## 🎯 Success Criteria

You're done when:

✅ **Backend Terminal shows**:
```
✅ Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
```

✅ **Frontend Terminal shows**:
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
```

✅ **Browser shows**:
- Dishcovery fancy homepage
- Search bar and statistics
- Feature cards
- No console errors

✅ **Database working**:
- MySQL service running
- Database `dishcovery` exists
- Tables created successfully

---

## 📞 Windows-Specific Tips

### PowerShell vs Command Prompt

Either works! PowerShell is slightly more powerful:
- **PowerShell**: Colored output, better formatting
- **Command Prompt**: Classic, simpler

Both can run all the same commands.

### Running in Background

To run servers in background (optional):
```powershell
# In PowerShell, press Ctrl+` to open another terminal
# Or open new PowerShell window separately (simpler)
```

### Finding Open Ports

```powershell
# See what's using each port
netstat -ano | findstr :3000    # Frontend
netstat -ano | findstr :5000    # Backend
netstat -ano | findstr :3306    # Database
```

---

## 🔄 Restart Guide

If something goes wrong:

### Kill All Node Processes
```powershell
Get-Process node | Stop-Process -Force
```

### Restart Everything
1. Stop both servers (Ctrl+C in each terminal)
2. Verify MySQL is running:
   ```powershell
   Get-Service MySQL80
   ```
3. Restart backend:
   ```powershell
   cd server
   npm start
   ```
4. Restart frontend:
   ```powershell
   cd client
   npm start
   ```

---

## 📚 Documentation to Read

After setup, read in this order:

1. **WINDOWS_SETUP_GUIDE.md** ← You are here!
2. **QUICK_REFERENCE.md** ← Troubleshooting
3. **PROJECT_ARCHITECTURE.md** ← How it works
4. **README.md** ← Project overview
5. **ADMIN_API.md** ← API documentation

---

## ✅ Final Checklist Before Declaring Success

- [ ] MySQL installed and running
- [ ] Database created with all tables
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Browser shows fancy homepage
- [ ] Can register new account
- [ ] Can login to account
- [ ] Can access dashboard
- [ ] No console errors (F12)
- [ ] Documentation reviewed

---

## 🎉 You're Done!

The Dishcovery application is now running on your Windows machine!

**Access Points**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

**Next Steps**:
1. Explore the application
2. Register test accounts
3. Review the code
4. Make modifications
5. Add restaurant data (if desired)

---

**Last Updated**: January 23, 2026  
**Windows Version**: 10/11  
**Total Setup Time**: ~10-15 minutes (excluding downloads)

Enjoy Dishcovery! 🍽️✨
