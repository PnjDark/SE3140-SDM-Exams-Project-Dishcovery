# 🪟 Dishcovery - Windows Setup Guide

Complete guide to run Dishcovery on Windows machines.

---

## 📋 Project Overview

**Dishcovery** is a full-stack restaurant discovery platform with 3 main components:

1. **Frontend (React)** - `client/` folder
   - Port: 3000
   - Technology: React 19, React Router, Context API
   - No backend dependencies

2. **Backend (Node.js/Express)** - `server/` folder
   - Port: 5000
   - Technology: Express.js, MySQL2, JWT, Bcryptjs, Multer
   - Requires MySQL database

3. **Database (MySQL)** - `database/` folder
   - Port: 3306 (default)
   - Schema: 10+ tables (users, restaurants, dishes, reviews, etc.)
   - Requires MySQL Server installation

---

## 🔧 Prerequisites for Windows

### Required Software

1. **Node.js 18+**
   - Download: https://nodejs.org/
   - Verify: `node --version` & `npm --version`
   - ✅ Already installed on your system

2. **MySQL Server 8+**
   - Download: https://dev.mysql.com/downloads/mysql/
   - Or use: MySQL Workbench Community
   - Requires: Windows installer
   - ⚠️ **NOT YET INSTALLED - See setup below**

3. **Git** (Optional but recommended)
   - Download: https://git-scm.com/

---

## 📂 Project Structure

```
SE3140-SDM-Exams-Project-Dishcovery/
├── client/                    # React Frontend (Port 3000)
│   ├── src/
│   │   ├── App.js            # Main app routing
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # State management (Auth, Restaurant, Dish)
│   │   └── App.css           # Global styles
│   └── package.json          # Dependencies: react, react-router, react-scripts
│
├── server/                    # Node.js Backend (Port 5000)
│   ├── index.js              # Express app & routes setup
│   ├── db.js                 # MySQL connection pool
│   ├── routes/               # API endpoints
│   │   ├── auth.js           # POST /register, /login, /me
│   │   ├── restaurants.js    # GET restaurants, search, filters
│   │   ├── owner.js          # Owner management endpoints
│   │   ├── admin.js          # Admin dashboard endpoints
│   │   ├── Dishes.js         # Dish management
│   │   └── upload.js         # File upload handling
│   ├── middleware/           # Multer file upload config
│   ├── utils/                # Validation & error handling
│   ├── .env                  # DATABASE CREDENTIALS (created ✅)
│   └── package.json          # Dependencies: express, mysql2, jwt, bcryptjs, multer
│
└── database/                 # Database setup
    ├── schema.sql            # Database tables definition
    ├── seed.sql              # Sample data
    ├── setup.js              # Automated setup script
    └── admin-seed.sql        # Admin test data
```

---

## 🚀 Quick Start (6 Steps)

### Step 1: Install MySQL Server

**Option A: Using MySQL Community Server**

1. Download: https://dev.mysql.com/downloads/mysql/
2. Choose "Windows (x86, 32-bit & 64-bit) MSI Installer"
3. Run installer and follow wizard:
   - Setup Type: Developer Default
   - Check requirements (Visual C++ Redistributable)
   - MySQL Server 8.0.XX - Configure MySQL Server as a Windows Service
   - Port: 3306
   - Config Type: Development Machine
   - Authentication: Use Legacy Authentication Plugin (for mysql2 compatibility)
   - Root Password: Leave blank or set a password
   - Windows Service Name: MySQL80 (or MySQL83)
4. Complete installation

**Option B: Using XAMPP (Easier)**

1. Download: https://www.apachefriends.org/
2. Install XAMPP
3. In XAMPP Control Panel, start Apache + MySQL
4. MySQL runs on port 3306 automatically

**Verify MySQL is running:**
```powershell
# Open PowerShell and test
mysql -u root -p
# If no password was set, just press Enter at the prompt
# You should see: mysql>
# Type: exit
```

### Step 2: Navigate to Project

```powershell
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery
```

### Step 3: Install Dependencies

```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

**Expected:** Both should show "added XXX packages" with no errors.

### Step 4: Setup Database

```powershell
# Navigate to database folder
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\database

# Run the setup script
node setup.js
```

**What it does:**
- Creates `dishcovery` database
- Creates all 10+ tables (users, restaurants, dishes, reviews, etc.)
- Inserts sample data
- Sets up indexes and constraints

**Expected output:**
```
✅ Connected to MySQL server
✅ Database 'dishcovery' ready
✅ All tables created successfully
✅ Database setup completed
```

**If error occurs:**
```
# Check MySQL is running first
# Try manual setup:
mysql -u root -p
# Then paste contents of schema.sql
```

### Step 5: Start Backend Server

**Terminal 1 - Backend:**

```powershell
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server
npm start
```

**Expected output:**
```
✅ Server running on http://localhost:5000
📊 Health check: http://localhost:5000/api/health
🍽️  Restaurants: http://localhost:5000/api/restaurants
```

**If "MySQL connection failed":**
- Check .env file has correct credentials
- Verify MySQL server is running
- Check DB_HOST is "localhost" (not 127.0.0.1)

### Step 6: Start Frontend Client

**Terminal 2 - Frontend:**

```powershell
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view client in the browser.

  Local:            http://localhost:3000
```

**Browser opens automatically** at http://localhost:3000

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] Frontend loads at http://localhost:3000 (with fancy new homepage!)
- [ ] Backend API responds: http://localhost:5000/api/health
- [ ] Can see "Welcome to Dishcovery API" at http://localhost:5000
- [ ] Browser Console (F12) has no critical errors
- [ ] MySQL service shows as running (Task Manager > Services)

---

## 🔑 Key Windows Paths

```
Project Root:
c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery

Backend:
c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server

Frontend:
c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client

Database:
c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\database

Config:
c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server\.env
```

---

## 🔐 Environment Configuration

### Server .env File (Already Created ✅)

Location: `server/.env`

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=                    # Leave blank if no password set
DB_NAME=dishcovery
DB_PORT=3306

# Server
PORT=5000

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
```

### Modify if MySQL Password is Set

If you set a root password during MySQL installation:

```env
DB_PASSWORD=your_mysql_password_here
```

---

## 🔌 API Endpoints (Backend)

Once backend is running at `http://localhost:5000`:

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user
```

### Restaurants
```
GET    /api/restaurants       - Get all restaurants
GET    /api/restaurants/:id   - Get restaurant details
POST   /api/restaurants/:id/reviews - Add review
```

### Owner (Protected)
```
GET    /api/owner/restaurants - Get owner's restaurants
POST   /api/owner/restaurants - Create restaurant
```

### Admin (Protected)
```
GET    /api/admin/dashboard   - Dashboard stats
GET    /api/admin/users       - List users
```

### Files
```
POST   /api/upload            - Upload image
```

---

## 🗄️ Database Tables

Created automatically by setup script:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (customer, owner, admin) |
| `restaurants` | Restaurant listings |
| `dishes` | Menu items |
| `reviews` | Restaurant reviews |
| `restaurant_follows` | Users following restaurants |
| `posts` | Restaurant announcements |
| `post_comments` | Comments on posts |
| `post_likes` | Likes on posts |

---

## 🆘 Troubleshooting

### Issue: "MySQL connection failed"

**Solution 1:** Start MySQL service
```powershell
# Check if MySQL is running
Get-Service MySQL80  # or MySQL83, depending on version

# Start service if stopped
Start-Service MySQL80
```

**Solution 2:** Verify credentials in `.env`
```env
DB_HOST=localhost      # NOT 127.0.0.1
DB_USER=root
DB_PASSWORD=           # Empty if no password
DB_NAME=dishcovery
DB_PORT=3306
```

**Solution 3:** Create database manually
```powershell
# Start MySQL CLI
mysql -u root -p
# Password: (press Enter if no password)

# Then run:
SOURCE c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\database\schema.sql
```

---

### Issue: "Port 3000 already in use"

```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use different port:
set PORT=3001
npm start
```

---

### Issue: "Cannot find module 'react-scripts'"

```powershell
# Reinstall dependencies
cd client
rm -r node_modules package-lock.json
npm install
npm start
```

---

### Issue: "Dependencies not installing"

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -r node_modules

# Reinstall
npm install
```

---

## 📝 File Descriptions

### Frontend Key Files

**`client/src/App.js`**
- Main routing setup
- Protected routes for owner/admin
- Context providers (Auth, Restaurant, Dish)

**`client/src/context/AuthContext.js`**
- User authentication state
- Token management
- Login/Logout logic

**`client/src/pages/Home.js`** (Updated with fancy design)
- Landing page
- Search bar
- Featured restaurants & cuisines
- Stats display

**`client/src/pages/Login.js` & `Register.js`**
- Authentication forms
- Email/password validation

**`client/src/pages/Restaurants.js`**
- Restaurant listing
- Filtering by cuisine, location, rating
- Search functionality

---

### Backend Key Files

**`server/index.js`**
- Express app initialization
- Route mounting
- Middleware setup (CORS, JSON, file upload)
- Server startup on port 5000

**`server/db.js`**
- MySQL connection pool
- Promise-based interface
- Connection testing

**`server/routes/auth.js`**
- Register endpoint
- Login endpoint
- JWT token generation
- Password hashing with bcryptjs

**`server/routes/restaurants.js`**
- Get all/single restaurant
- Search functionality
- Filter by cuisine/location/rating
- Review submission

**`server/.env`**
- Database credentials
- JWT secret
- Server port

---

## 🎨 Frontend Features (Fancy Homepage)

Already implemented with modern styling:

✅ Dark mode hero section with gradient  
✅ Glassmorphism search bar  
✅ Animated statistics cards  
✅ 3D flip feature cards  
✅ Smooth hover animations  
✅ Golden gradient ratings  
✅ Premium CTA section  
✅ Responsive design  

---

## 🧪 Test the Application

### 1. Register a New User

Go to http://localhost:3000/register

```
Email: test@example.com
Password: Test123!@
Name: Test User
Role: Customer
```

### 2. Login

Go to http://localhost:3000/login

```
Email: test@example.com
Password: Test123!@
```

### 3. Browse Restaurants

After login, go to /restaurants page

### 4. Access Admin Dashboard (if admin account)

Admin accounts are created via database directly

---

## 🔄 Restart Guide

**If you need to restart everything:**

```powershell
# Terminal 1 - Stop backend (Ctrl+C)
# Terminal 2 - Stop frontend (Ctrl+C)

# Verify MySQL is still running:
Get-Service MySQL80

# Start backend again:
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\server
npm start

# Start frontend again:
cd c:\Users\CARLOS\SE3140-SDM-Exams-Project-Dishcovery\client
npm start
```

---

## 📚 Additional Commands

### Database Management

```powershell
# Setup database fresh
cd database
node setup.js

# Reset database (delete all data)
node setup.js --reset

# View database in CLI
mysql -u root -p
USE dishcovery;
SHOW TABLES;
SELECT * FROM users;
```

### Development Mode (Auto-reload)

```powershell
# Backend (with nodemon)
cd server
npm run dev

# Frontend (automatically with npm start)
cd client
npm start
```

### Build for Production

```powershell
# Build frontend
cd client
npm run build
# Creates: client/build/ folder

# Server is production-ready as-is
# Just run: npm start
```

---

## 🎯 Next Steps After Setup

1. ✅ Start both servers (steps 5-6)
2. ✅ Access http://localhost:3000
3. ✅ Register a test account
4. ✅ Test login/logout
5. ✅ Browse restaurants
6. ✅ Check admin dashboard (if applicable)

---

## 📞 Support

If issues persist:

1. **Check ports**: Both 3000 and 5000 must be free
2. **Check MySQL**: `Get-Service MySQL80` should show "Running"
3. **Check .env**: Database credentials must match MySQL setup
4. **Check console**: Look for specific error messages
5. **Restart**: Stop all processes, restart MySQL, then restart servers

---

## 🎉 You're Ready!

Your Dishcovery application is now fully set up on Windows.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Docs:** Check ADMIN_API.md & UPLOAD_API.md

Enjoy! 🍽️
