# 🛡️ Admin Dashboard - Access Guide

Complete guide to accessing and using the Dishcovery admin dashboard.

---

## 📍 Quick Access

**URL**: `http://localhost:3000/dashboard/admin`

**Requirement**: Must be logged in with **admin** role

---

## 🚀 Step-by-Step Access Guide

### Step 1: Create Admin Account (First Time Setup)

Admin accounts must be created via database or by an existing admin.

**Option A: Database Insert**
```sql
-- Connect to dishcovery database
mysql -u root -p dishcovery

-- Create admin user
INSERT INTO users (
  email, password_hash, name, role, 
  is_verified, created_at, updated_at
) VALUES (
  'admin@dishcovery.com',
  '$2a$10$HASHED_PASSWORD_HERE',
  'Admin User',
  'admin',
  1,
  NOW(),
  NOW()
);
```

**Option B: Register and Promote (Recommended)**
1. Register a normal user at `/register`
2. Get admin access from database manager:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 2: Log In

1. Navigate to `http://localhost:3000/login`
2. Enter your **email** and **password**
3. Click **Sign In**
4. You should be redirected based on your role:
   - Admin → `/dashboard/admin`
   - Owner → `/dashboard/owner`
   - Customer → `/dashboard`

### Step 3: Access Admin Dashboard

**Method 1: Direct URL**
```
http://localhost:3000/dashboard/admin
```

**Method 2: Navbar Navigation**
1. After login, look at the **top navbar**
2. Click your **profile icon/menu** (top right)
3. Select **"Admin Dashboard"** (appears only if you're admin)
4. You'll be taken to the admin dashboard

**Method 3: API Authentication**
```javascript
// In browser console after login
fetch('/api/admin/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 🔐 Authentication Requirements

### Prerequisites
- ✅ User account with **admin** role
- ✅ Valid JWT token stored in localStorage
- ✅ Token not expired (7-day expiration)
- ✅ Correct JWT_SECRET configured on server

### Required Fields in JWT Token
```javascript
{
  "id": 1,                    // User ID
  "email": "admin@site.com",  // Email
  "role": "admin",            // MUST be "admin"
  "name": "Admin Name",
  "iat": 1704854445,          // Issued at
  "exp": 1705459245           // Expires (7 days)
}
```

### Access Control Middleware
```javascript
// Protected route check in frontend
const isAdmin = user?.role === 'admin';

// If not admin:
if (!isAdmin) {
  return <Navigate to="/dashboard" />;
}
```

---

## 🎯 Admin Dashboard Features

### Overview Tab
- **Platform Statistics**
  - Total users count
  - Total restaurants count
  - Total reviews count
  - System uptime

- **Recent Activity**
  - Last 10 user registrations
  - Last 10 restaurants created
  - Last 10 reviews posted

### Users Tab
- **User Management**
  - View all users
  - Change user roles (customer ↔ owner ↔ admin)
  - Deactivate/activate users
  - Delete user accounts
  - View user details (email, name, role, join date)

### Restaurants Tab
- **Restaurant Moderation**
  - Filter by status: Pending | Approved | Rejected
  - View all restaurants with details
  - Approve pending restaurants
  - Reject restaurants
  - Delete restaurants
  - View restaurant statistics (dishes, reviews, rating)

### Reviews Tab
- **Review Management**
  - View all reviews
  - See review content and ratings
  - Delete inappropriate reviews
  - Pagination support
  - View associated restaurant

---

## 📊 Common Admin Tasks

### Task 1: Approve a Restaurant

1. **Navigate to Restaurants Tab**
   - Click "Restaurants" in the tab navigation
   - Filter shows: Pending | Approved | Rejected

2. **Find Pending Restaurant**
   - Click filter dropdown
   - Select "Pending"
   - View list of pending restaurants

3. **Approve Restaurant**
   - Find the restaurant in the list
   - Click the **"Approve"** button (green checkmark)
   - Confirm action
   - Status changes to "Approved"
   - **Result**: Restaurant now visible to customers

4. **Verify Approval**
   - Switch to customer view
   - Check `/restaurants` endpoint
   - New restaurant appears in listings

### Task 2: Manage Users

1. **Navigate to Users Tab**
   - Click "Users" in the tab navigation
   - View all registered users

2. **Change User Role**
   - Find user in list
   - Click role dropdown
   - Select new role (Customer, Owner, Admin)
   - Role updates immediately

3. **Deactivate User**
   - Click "Deactivate" button next to user
   - User can still log in but loses access to features

4. **Delete User**
   - Click "Delete" button
   - Confirm deletion
   - User account permanently removed

### Task 3: Moderate Reviews

1. **Navigate to Reviews Tab**
   - Click "Reviews" in the tab navigation

2. **Find Inappropriate Review**
   - Browse review list
   - Read review content
   - Check associated restaurant

3. **Delete Review**
   - Click "Delete" button on review
   - Confirm deletion
   - Review removed from platform

4. **View Pagination**
   - Navigate through pages
   - Load additional reviews
   - Default 10 reviews per page

---

## 🔌 API Endpoints (Admin Only)

### Dashboard Stats
```bash
GET /api/admin/dashboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "totalUsers": 42,
    "totalRestaurants": 15,
    "totalReviews": 324,
    "approvedCount": 12,
    "pendingCount": 3,
    "recentUsers": [...],
    "recentRestaurants": [...],
    "recentReviews": [...]
  }
}
```

### Get All Users
```bash
GET /api/admin/users
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 42,
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer",
      "created_at": "2026-01-20T10:30:00Z"
    },
    ...
  ]
}
```

### Change User Role
```bash
PUT /api/admin/users/{id}/role
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "role": "owner"  // customer, owner, or admin
}

Response:
{
  "success": true,
  "message": "User role updated",
  "data": { "id": 1, "role": "owner" }
}
```

### Get All Restaurants
```bash
GET /api/admin/restaurants?status=pending
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 7,
      "name": "Pizza Palace",
      "cuisine": "Italian",
      "location": "Downtown",
      "status": "pending",
      "owner_id": 5,
      "dish_count": 0,
      "review_count": 0,
      "avg_rating": null
    },
    ...
  ]
}
```

### Update Restaurant Status
```bash
PUT /api/admin/restaurants/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "status": "approved"  // approved, rejected, or pending
}

Response:
{
  "success": true,
  "message": "Restaurant status updated to approved",
  "data": { "id": 7, "status": "approved" }
}
```

### Get All Reviews
```bash
GET /api/admin/reviews?page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "count": 10,
  "total": 324,
  "data": [
    {
      "id": 1,
      "restaurant_id": 5,
      "user_id": 3,
      "comment": "Great food!",
      "rating": 5,
      "created_at": "2026-01-20T15:45:00Z"
    },
    ...
  ]
}
```

### Delete Review
```bash
DELETE /api/admin/reviews/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Review deleted successfully"
}
```

---

## ⚙️ Configuration

### Admin Route Protection

**Frontend Protection** (`client/src/App.js`):
```javascript
<Route 
  path="/dashboard/admin" 
  element={<ProtectedRoute requireAdmin={true}>
    <AdminDashboard />
  </ProtectedRoute>} 
/>
```

**Backend Protection** (`server/routes/admin.js`):
```javascript
router.get('/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Admin only.'
    });
  }
  // ... admin logic
});
```

### JWT Token Verification

**Token must contain**:
```json
{
  "role": "admin",  // EXACTLY "admin"
  "exp": 1705459245,  // Not expired
  "iat": 1704854445   // Valid timestamp
}
```

---

## 🧪 Testing Admin Access

### Test 1: Check if User is Admin
```javascript
// In browser console after login
const user = JSON.parse(localStorage.getItem('user'));
console.log('User role:', user?.role);
console.log('Is admin:', user?.role === 'admin');
```

### Test 2: Direct API Call
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dishcovery.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Test 3: Navigate to Dashboard
1. Login as admin
2. Visit `http://localhost:3000/dashboard/admin`
3. Should see dashboard (not access denied message)

---

## ❌ Troubleshooting

### "Access Denied" on Dashboard

**Problem**: Logged in but seeing access denied.

**Causes**:
- User role is not "admin"
- Token invalid/expired
- CORS issue
- Browser cache

**Solutions**:
1. Check user role: `console.log(JSON.parse(localStorage.getItem('user')).role)`
2. Verify token: Paste in jwt.io
3. Clear localStorage and re-login
4. Hard refresh: Ctrl+Shift+R
5. Check browser console for errors (F12)

### Cannot See Admin Link in Navbar

**Problem**: No "Admin Dashboard" option in profile menu.

**Causes**:
- Not logged in as admin
- Role not properly set in database
- Frontend cache issue

**Solutions**:
1. Verify role in database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your@email.com';
   ```
2. Update role if needed:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
3. Log out and log in again
4. Clear browser cache

### API Returns 403 Error

**Problem**: API calls return "Invalid or expired token"

**Solutions**:
1. Check token exists: `localStorage.getItem('token')`
2. Verify token expiration: Use jwt.io
3. Log in again for fresh token
4. Check JWT_SECRET matches in server/.env

---

## 📋 User Roles & Permissions

| Feature | Customer | Owner | Admin |
|---------|----------|-------|-------|
| View Dashboard | Own | Own | Yes (All) |
| Browse Restaurants | Approved only | All their own | All |
| Create Restaurants | No | Yes | No |
| Manage Reviews | Own only | See for own restaurants | All |
| Approve Restaurants | No | No | **Yes** |
| Delete Restaurants | No | Own only | **All** |
| Manage Users | No | No | **Yes** |
| Delete Users | No | No | **Yes** |
| Change User Roles | No | No | **Yes** |
| View Statistics | No | Own | **All** |

---

## 🔑 Admin Workflows

### Workflow 1: New Restaurant Approval
```
1. Owner creates restaurant
   ↓ Restaurant created with status: "pending"
   
2. Admin sees notification (or checks Restaurants tab)
   
3. Admin reviews restaurant details
   
4. Admin clicks "Approve"
   ↓ Status changes to "approved"
   
5. Customers can now see restaurant
   ↓ In /api/restaurants endpoint
```

### Workflow 2: User Promotion to Owner
```
1. Customer signs up
   ↓ Role: "customer"
   
2. Customer wants to open restaurant
   
3. Admin changes role to "owner"
   ↓ Users tab → Role dropdown → "owner"
   
4. User logs in/out and back in
   
5. User now sees Owner Dashboard
```

### Workflow 3: Review Moderation
```
1. Inappropriate review posted
   
2. Admin checks Reviews tab
   
3. Admin reads review content
   
4. Admin clicks "Delete"
   ↓ Review removed from platform
```

---

## 🚀 Quick Start

### For First Admin Setup

1. **Access Database**
   ```bash
   mysql -u root -p dishcovery
   ```

2. **Create Admin User**
   ```sql
   INSERT INTO users (
     email, password_hash, name, role, 
     is_verified, created_at, updated_at
   ) VALUES (
     'admin@dishcovery.com',
     '$2a$10$YOUR_HASHED_PASSWORD',
     'System Admin',
     'admin',
     1,
     NOW(),
     NOW()
   );
   ```

3. **Get Hashed Password**
   - Use bcrypt online tool or:
   - Register via UI, then update role
   - Or use: `npm install bcryptjs` and run:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('your_password', 10, (err, hash) => {
     console.log('INSERT INTO users VALUES (..., "' + hash + '", ...)');
   });
   ```

4. **Login and Access**
   - Go to `http://localhost:3000/login`
   - Enter email: `admin@dishcovery.com`
   - Enter password: Your password
   - Click Sign In
   - Redirected to `/dashboard/admin`

5. **Start Administrating**
   - View statistics
   - Approve pending restaurants
   - Manage users
   - Moderate reviews

---

## 📚 Related Files

- [server/routes/admin.js](../server/routes/admin.js) - Admin API endpoints
- [client/src/pages/admin/AdminDashboard.js](../client/src/pages/admin/AdminDashboard.js) - Dashboard component
- [client/src/context/AuthContext.js](../client/src/context/AuthContext.js) - Auth management
- [server/routes/auth.js](../server/routes/auth.js) - Login/register

---

## 💡 Pro Tips

✅ **Check JWT Token in Console**
```javascript
// Decode and view token contents
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(decoded.exp * 1000));
console.log('User role:', decoded.role);
```

✅ **Monitor Admin Activity**
- Check browser DevTools → Network tab for API calls
- Watch Network tab for 403 errors (permission denied)
- Check Console for JavaScript errors

✅ **Bulk Operations**
- Use database queries for bulk role changes:
  ```sql
  UPDATE users SET role = 'owner' WHERE email LIKE '%restaurant%';
  ```

✅ **Create Test Admin Accounts**
- Create multiple admin accounts for testing
- Different admin accounts for testing different workflows

---

**Last Updated**: January 22, 2026  
**Status**: ✅ Complete and Verified
