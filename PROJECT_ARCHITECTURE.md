# 🏗️ Dishcovery Project Architecture

Complete technical architecture and data flow diagram.

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DISHCOVERY FULL STACK                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   REACT FRONTEND     │         │  NODE.JS BACKEND    │
│   (Port 3000)        │         │  (Port 5000)        │
├──────────────────────┤         ├──────────────────────┤
│ Browser (localhost)  │◄───────►│ Express.js Server   │
│                      │ HTTP/   │                      │
│ ✅ App.js           │  REST   │ ✅ index.js         │
│ ✅ Home.js          │         │ ✅ routes/          │
│ ✅ Login/Register   │         │    - auth.js        │
│ ✅ Restaurants.js   │         │    - restaurants.js │
│ ✅ Dashboard.js     │         │    - owner.js       │
│ ✅ OwnerDash.js     │         │    - admin.js       │
│ ✅ AdminDash.js     │         │ ✅ db.js (MySQL)    │
│                      │         │                      │
│ State:              │         │ Middleware:         │
│ - AuthContext       │         │ - CORS              │
│ - RestaurantContext │         │ - JSON parser       │
│ - DishContext       │         │ - JWT auth          │
└──────────────────────┘         │ - File upload       │
          │                      └──────────────────────┘
          │                                 │
          └─────────────────┬───────────────┘
                            │
                    ┌───────▼────────┐
                    │  MYSQL 8.0     │
                    │  (Port 3306)   │
                    ├────────────────┤
                    │ Database:      │
                    │ dishcovery     │
                    │                │
                    │ Tables:        │
                    │ - users        │
                    │ - restaurants  │
                    │ - dishes       │
                    │ - reviews      │
                    │ - posts        │
                    │ - followers    │
                    │ & more...      │
                    └────────────────┘
```

---

## 🔄 Data Flow

### 1. User Registration Flow

```
User Input (Register Form)
    ↓
[client/pages/Register.js]
    ↓
POST /api/auth/register (JSON body)
    ↓
[server/routes/auth.js]
    ├─ Validate input
    ├─ Hash password (bcryptjs)
    ├─ Check if email exists
    ├─ Create user in database
    └─ Return success/error
    ↓
[client/context/AuthContext.js]
    ├─ Save token to localStorage
    ├─ Save user data
    └─ Navigate to /dashboard
```

### 2. Login & Authentication Flow

```
Login Form Input
    ↓
POST /api/auth/login
    ↓
[server/routes/auth.js]
    ├─ Find user by email
    ├─ Compare password hash
    ├─ Generate JWT token
    └─ Return token + user data
    ↓
[client/context/AuthContext.js]
    ├─ Store token in localStorage
    ├─ Store user in state
    └─ Auto-login on page refresh
    ↓
Protected Routes check Authorization
    ├─ Token exists? ✅
    ├─ Token valid? ✅
    └─ User role correct? ✅
```

### 3. Restaurant Browsing Flow

```
[client/pages/Restaurants.js]
    ↓
GET /api/restaurants (with filters: cuisine, location, price)
    ↓
[server/routes/restaurants.js]
    ├─ Query database
    ├─ Apply filters
    └─ Return restaurant list
    ↓
[React Component]
    ├─ Parse response
    ├─ Store in RestaurantContext
    └─ Render RestaurantCard components
```

### 4. Image Upload Flow

```
[client/components/ImageUploadForm.js]
    ↓
FormData with file
    ↓
POST /api/upload (with Authorization header)
    ↓
[server/routes/upload.js]
    ├─ Multer middleware processes
    ├─ Validate file type/size
    ├─ Save to server/uploads/
    └─ Return file URL
    ↓
Update restaurant/dish with image URL
    ↓
Display image in browser
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```
1. User logs in
   ↓
2. Server generates JWT with:
   - User ID
   - Email
   - Role (customer/owner/admin)
   - Expiration (optional)
   
3. Token sent to client
   ↓
4. Client stores in localStorage
   ↓
5. Client sends in Authorization header:
   Authorization: Bearer <token>
   ↓
6. Server verifies token with JWT_SECRET
   ↓
7. If valid: req.user populated
   If invalid: Return 403 Forbidden
```

### Role-Based Access

```
Customer: 
  ✅ View restaurants, dishes
  ✅ Submit reviews
  ✅ Search & filter
  ❌ Create restaurants
  ❌ Admin features

Owner:
  ✅ Create/edit restaurants
  ✅ Manage menu (dishes)
  ✅ Upload images
  ✅ View analytics
  ❌ Approve restaurants
  ❌ Admin dashboard

Admin:
  ✅ Everything
  ✅ User management
  ✅ Restaurant approval
  ✅ Review moderation
  ✅ Dashboard/analytics
```

---

## 📦 Component Hierarchy

### Frontend Components

```
App.js (Root)
├─ AuthProvider
├─ RestaurantProvider
├─ DishProvider
└─ Router
    ├─ Navbar.js (shown on all pages)
    ├─ Home.js
    │   ├─ DishCard
    │   └─ RestaurantCard
    ├─ Restaurants.js
    │   ├─ FilterBar.js
    │   ├─ SearchBar.js
    │   └─ RestaurantCard (x many)
    ├─ RestaurantDetails.js
    │   ├─ DishCard (x many)
    │   ├─ ReviewForm.js
    │   └─ ReviewList.js
    ├─ DishSearch.js
    │   └─ DishCard (x many)
    ├─ Profile.js
    ├─ Dashboard.js (Protected - Customer)
    ├─ OwnerDashboard.js (Protected - Owner)
    │   ├─ RestaurantForm
    │   └─ DishManager
    └─ AdminDashboard.js (Protected - Admin)
        ├─ UserManagementTable
        ├─ RestaurantModerationTable
        └─ ReviewModerationTable
```

---

## 🗄️ Database Schema (Simplified)

### Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role ENUM('customer', 'owner', 'admin'),
  avatar_url VARCHAR(500),
  bio TEXT,
  location VARCHAR(100),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Restaurants Table

```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cuisine VARCHAR(50),
  location VARCHAR(100),
  owner_id INT,
  rating DECIMAL(3,2),
  price_range INT,
  is_approved BOOLEAN,
  image_url VARCHAR(500),
  created_at TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

### Dishes Table

```sql
CREATE TABLE dishes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(500),
  created_at TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

### Reviews Table

```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT (1-5),
  comment TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔄 API Endpoint Structure

### Authentication Endpoints

```
POST   /api/auth/register
       Body: { email, password, name, role }
       Response: { success, token, user }

POST   /api/auth/login
       Body: { email, password }
       Response: { success, token, user }

GET    /api/auth/me
       Headers: { Authorization: Bearer token }
       Response: { success, user }
```

### Restaurant Endpoints

```
GET    /api/restaurants
       Query: ?cuisine=Italian&location=NYC&rating=4.5
       Response: { success, data: [restaurants] }

GET    /api/restaurants/:id
       Response: { success, data: restaurant }

GET    /api/restaurants/:id/dishes
       Response: { success, data: [dishes] }

GET    /api/restaurants/search/dishes
       Query: ?q=pizza&cuisine=Italian&restaurant=5
       Response: { success, data: [dishes] }

POST   /api/restaurants/:id/reviews
       Headers: { Authorization: Bearer token }
       Body: { rating, comment }
       Response: { success, review }
```

### Owner Endpoints (Protected)

```
GET    /api/owner/restaurants
       Headers: { Authorization: Bearer token }
       Response: { success, data: [owner's restaurants] }

POST   /api/owner/restaurants
       Headers: { Authorization: Bearer token }
       Body: { name, cuisine, location, ... }
       Response: { success, restaurant }

POST   /api/owner/restaurants/:id/dishes
       Headers: { Authorization: Bearer token }
       Body: { name, description, price }
       Response: { success, dish }
```

### Admin Endpoints (Protected)

```
GET    /api/admin/dashboard
       Headers: { Authorization: Bearer token }
       Response: { success, stats }

GET    /api/admin/users
       Headers: { Authorization: Bearer token }
       Response: { success, data: [users] }

PUT    /api/admin/restaurants/:id/status
       Headers: { Authorization: Bearer token }
       Body: { status: 'approved'|'rejected' }
       Response: { success, restaurant }

GET    /api/admin/reviews
       Headers: { Authorization: Bearer token }
       Response: { success, data: [reviews] }

DELETE /api/admin/reviews/:id
       Headers: { Authorization: Bearer token }
       Response: { success }
```

### File Upload

```
POST   /api/upload
       Headers: { Authorization: Bearer token }
       Body: FormData { image: File }
       Response: { success, url: "/uploads/filename.jpg" }
```

---

## 📁 File Structure & Responsibilities

### Frontend Structure

```
client/
├── public/
│   ├── index.html          # HTML entry point
│   ├── manifest.json       # PWA manifest
│   └── robots.txt
│
├── src/
│   ├── App.js              # Main routing & providers
│   ├── App.css             # Global styles
│   ├── index.js            # React entry point
│   ├── index.css           # Global CSS
│   │
│   ├── context/
│   │   ├── AuthContext.js       # Auth state + login/logout
│   │   ├── RestaurantContext.js # Restaurant state
│   │   └── DishContext.js       # Dish state
│   │
│   ├── components/
│   │   ├── Navbar.js            # Navigation header
│   │   ├── DishCard.js          # Dish display card
│   │   ├── RestaurantCard.js    # Restaurant display card
│   │   ├── ReviewForm.js        # Review submission form
│   │   ├── ReviewList.js        # Display reviews
│   │   ├── SearchBar.js         # Search functionality
│   │   ├── FilterBar.js         # Filter options
│   │   ├── ImageUploadForm.js   # File upload form
│   │   ├── ErrorMessage.js      # Error display
│   │   ├── LoadingSpinner.js    # Loading indicator
│   │   ├── ProtectedRoute.js    # Auth-required routes
│   │   ├── PublicOnlyRoute.js   # Login/register routes
│   │   └── admin/
│   │       ├── UserManagementTable.js
│   │       ├── RestaurantModerationTable.js
│   │       └── ReviewModerationTable.js
│   │
│   └── pages/
│       ├── Home.js              # Landing page (fancy!)
│       ├── Login.js             # Login form
│       ├── Register.js          # Registration form
│       ├── Restaurants.js       # Restaurant listing
│       ├── RestaurantDetails.js # Single restaurant view
│       ├── DishSearch.js        # Dish search page
│       ├── Dashboard.js         # Customer dashboard
│       ├── Profile.js           # User profile
│       └── admin/
│           └── AdminDashboard.js
│
└── package.json            # Dependencies & scripts
```

### Backend Structure

```
server/
├── index.js                # Express app setup & server startup
├── db.js                   # MySQL connection pool
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables (DATABASE!)
│
├── middleware/
│   └── upload.js           # Multer file upload config
│
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── restaurants.js      # Restaurant CRUD & search
│   ├── owner.js            # Owner-specific endpoints
│   ├── admin.js            # Admin dashboard endpoints
│   ├── Dishes.js           # Dish management
│   └── upload.js           # File upload endpoint
│
├── utils/
│   ├── validation.js       # Input validation functions
│   └── errorHandler.js     # Error response formatting
│
└── uploads/                # Uploaded image storage
    └── (images stored here)
```

---

## 🔧 Key Technology Choices

### Frontend: React 19
- **Why**: Component-based, excellent for complex UIs
- **State**: Context API (no Redux needed)
- **Routing**: React Router v6
- **Styling**: CSS3 with CSS-in-JS

### Backend: Node.js + Express.js
- **Why**: JavaScript full-stack, fast development
- **API**: REST API with Express routing
- **Database**: MySQL2 (promise-based)
- **Auth**: JWT tokens
- **Security**: Bcryptjs for password hashing

### Database: MySQL 8
- **Why**: Reliable, ACID compliant, relational
- **Schema**: 10+ normalized tables
- **Indexes**: For performance optimization
- **Constraints**: Foreign keys, unique constraints

### File Upload: Multer
- **Why**: Lightweight, handles multipart/form-data
- **Storage**: Local filesystem (server/uploads/)

---

## 🚀 Performance Considerations

### Frontend Optimization
- React routing (code splitting)
- Context API (local state, no prop drilling)
- Memoization for expensive components
- CSS transitions for smooth UX

### Backend Optimization
- MySQL connection pooling
- Database indexes on frequently searched columns
- JWT stateless authentication
- CORS enabled for frontend communication

### Database Optimization
- Indexed columns: email, role, cuisine, location
- Foreign key relationships
- FULLTEXT search for dish/restaurant names

---

## 🔐 Security Features

1. **Password Hashing**: Bcryptjs (10 salt rounds)
2. **JWT Tokens**: Signed with JWT_SECRET
3. **CORS**: Only allow localhost:3000
4. **Input Validation**: Server-side validation all endpoints
5. **Protected Routes**: Role-based access control
6. **File Upload**: Type & size validation

---

## 📊 Windows Port Summary

```
Frontend:  3000 (React dev server)
Backend:   5000 (Express.js)
Database:  3306 (MySQL)

All are localhost-only during development.
```

---

## 🎯 Development Workflow

```
1. Make code changes
2. Frontend auto-reloads (npm start watches files)
3. Backend auto-reloads (nodemon - npm run dev)
4. Database changes via setup.js script
5. Test in browser + API (curl / Postman)
```

---

## 📚 File Size & Performance

```
Frontend:
- node_modules: ~500MB
- src code: ~50KB
- Built size: ~200KB (optimized)

Backend:
- node_modules: ~80MB
- src code: ~20KB

Database:
- MySQL: ~500MB (fresh install)
- Data: ~1MB (after seed)
```

---

**Architecture Last Updated**: January 23, 2026  
**Status**: Production Ready  
**Stack**: React 19 + Node.js 20 + MySQL 8 + Express.js 5
