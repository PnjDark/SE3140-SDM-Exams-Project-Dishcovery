# 🔐 Token Authentication Troubleshooting Guide

## Problem: "Invalid or expired token" Error

This guide helps diagnose and fix token-related issues in Dishcovery.

---

## 🔍 Common Causes

### 1. **Token Expired**
- JWT tokens expire after 7 days
- **Solution**: Log in again to get a fresh token

### 2. **Token Not Stored in LocalStorage**
- Browser cleared cache/cookies
- Private browsing mode
- Third-party cookie issues
- **Solution**: Log in again, check browser settings

### 3. **Token Format Wrong**
- Should be: `Authorization: Bearer TOKEN`
- **Solution**: Frontend automatically adds Bearer prefix

### 4. **JWT Secret Mismatch**
- Frontend and backend have different secrets
- **Solution**: Verify JWT_SECRET in .env matches

### 5. **Token Tampered**
- Manually edited the token
- **Solution**: Clear localStorage and log in again

---

## ✅ Quick Fix Steps

### Step 1: Clear All Stored Auth
Open browser DevTools (F12) → Application/Storage → LocalStorage:
```
Delete: token
Delete: user
```

### Step 2: Hard Refresh Browser
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Step 3: Log In Again
1. Go to `/login`
2. Enter credentials
3. Should receive new token

### Step 4: Test API Call
Open DevTools → Console:
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Test API call
fetch('/api/owner/restaurants', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## 🛠️ Debugging Steps

### Check Token in Browser

**Open DevTools (F12)** → Application → LocalStorage → http://localhost:3000

**You should see:**
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user: {"id":2,"email":"owner@test.com",...}
```

### Check JWT Expiration
Visit https://jwt.io and paste your token:
- Verify "Signature Verified" shows checkmark
- Check "exp" field for expiration date
- Should be ~7 days from creation

### Check Server Response Headers
```bash
curl -X GET http://localhost:5000/api/owner/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -v
```

Look for:
- `200 OK` - Success
- `401 Unauthorized` - Missing token
- `403 Forbidden` - Invalid/expired token

---

## 📋 Verification Checklist

Before attempting to create a restaurant:

- [ ] Logged in successfully
- [ ] Token visible in DevTools LocalStorage
- [ ] Token not expired (check jwt.io)
- [ ] Token starts with `eyJ...`
- [ ] Browser shows no CORS errors
- [ ] Backend is running on port 5000
- [ ] Frontend is running on port 3000
- [ ] Network request shows Authorization header

---

## 🔧 Backend Verification

### Check JWT_SECRET in .env
```bash
cat server/.env | grep JWT_SECRET
```

Should output:
```
JWT_SECRET=<long-string-of-characters>
```

### Verify Token Validation
Check server/routes/auth.js:
```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};
```

### Test Token Endpoint
```bash
# Get token via login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"password123"}'

# Use token in request
TOKEN="<paste-token-from-response>"

curl -X GET http://localhost:5000/api/owner/restaurants \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Frontend Token Handling

### AuthContext (src/context/AuthContext.js)
Handles token storage and retrieval:
```javascript
// Stores token after login
localStorage.setItem('token', data.token);

// Retrieves on page load
const savedToken = localStorage.getItem('token');
```

### OwnerDashboard (src/pages/owner/OwnerDashboard.js)
Uses token in requests:
```javascript
const token = contextToken || localStorage.getItem('token');

const response = await fetch('/api/owner/restaurants', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Auto-logout if token expired
if (response.status === 403) {
  localStorage.removeItem('token');
  navigate('/login');
}
```

---

## 🔐 Security Best Practices

✅ **Do:**
- Store token in localStorage (automatically done)
- Include token in Authorization header
- Clear token on logout
- Handle token expiration gracefully
- Use HTTPS in production

❌ **Don't:**
- Store token in plain text comments
- Share token with others
- Use same token across devices
- Store sensitive data in token payload
- Hardcode JWT secret

---

## 📞 If Problem Persists

1. **Check Console Errors** (F12 → Console)
2. **Check Network Tab** (F12 → Network)
   - Look for failed requests
   - Check response status codes
   - Verify Authorization header present

3. **Check Server Logs** (Terminal running `npm run dev`)
   - Look for connection errors
   - Check token validation logs
   - Verify database connectivity

4. **Verify Server is Running**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return:
   ```json
   {"status":"OK","server":"Dishcovery API",...}
   ```

5. **Restart Everything**
   ```bash
   # Stop server: Ctrl+C
   # Stop client: Ctrl+C
   # Restart server
   cd server && npm run dev
   # Restart client
   cd client && npm start
   ```

---

## 📊 Token Lifecycle

```
1. User Login
   ↓
2. Server generates JWT token
   ↓
3. Frontend stores in localStorage
   ↓
4. Frontend includes in API requests
   ↓
5. Backend verifies using JWT_SECRET
   ↓
6. If valid → Access granted
   If expired → 403 error
   ↓
7. User logs in again for new token
```

---

## 🧪 Test Script

```bash
#!/bin/bash

# Login and get token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# Test API with token
echo "Testing API..."
curl -X GET http://localhost:5000/api/owner/restaurants \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

---

## 📚 Related Files

- [server/routes/auth.js](../server/routes/auth.js) - Authentication routes
- [server/.env](../server/.env) - JWT_SECRET configuration
- [client/src/context/AuthContext.js](../client/src/context/AuthContext.js) - Token management
- [client/src/pages/owner/OwnerDashboard.js](../client/src/pages/owner/OwnerDashboard.js) - Token usage

---

**Last Updated**: January 22, 2026  
**Status**: Active
