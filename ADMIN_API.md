# DISHCOVERY ADMIN API DOCUMENTATION

## Base URL
```
http://localhost:5000/api/admin
```

## Authentication
All admin endpoints require JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

Only users with `role = 'admin'` can access these endpoints.

---

## ENDPOINTS

### 1. DASHBOARD STATS

#### GET `/dashboard`
Get overview statistics and recent activity for the admin dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total_users": 50,
      "customers": 45,
      "owners": 5
    },
    "restaurants": {
      "total": 25,
      "approved": 20,
      "pending": 3,
      "rejected": 2
    },
    "reviews": {
      "total_reviews": 150,
      "avg_rating": 4.5
    },
    "recent_users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "created_at": "2026-01-22T10:00:00Z"
      }
    ],
    "pending_restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "cuisine": "Italian",
        "location": "Downtown",
        "owner_id": 5,
        "status": "pending",
        "created_at": "2026-01-22T09:00:00Z"
      }
    ]
  }
}
```

---

### 2. USER MANAGEMENT

#### GET `/users`
List all users on the platform.

**Query Parameters:**
- None

**Response:**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "is_verified": true,
      "created_at": "2026-01-20T00:00:00Z",
      "last_login": "2026-01-22T14:30:00Z"
    }
  ]
}
```

---

#### GET `/users/:id`
Get detailed information about a specific user.

**Parameters:**
- `id` (required): User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "name": "Restaurant Owner",
      "email": "owner@example.com",
      "role": "owner",
      "avatar_url": null,
      "bio": "I run restaurants",
      "location": "Midtown",
      "is_verified": true,
      "created_at": "2026-01-15T00:00:00Z"
    },
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "status": "approved"
      }
    ]
  }
}
```

---

#### PUT `/users/:id/role`
Change a user's role.

**Parameters:**
- `id` (required): User ID
- `role` (required in body): One of `customer`, `owner`, `admin`

**Request Body:**
```json
{
  "role": "owner"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated to owner"
}
```

---

#### PUT `/users/:id/deactivate`
Deactivate a user account (sets `is_verified = false`).

**Parameters:**
- `id` (required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User account deactivated"
}
```

---

#### DELETE `/users/:id`
Delete a user account permanently.

**Parameters:**
- `id` (required): User ID

**Response:**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### 3. RESTAURANT MODERATION

#### GET `/restaurants`
List all restaurants with optional status filtering and pagination.

**Query Parameters:**
- `status` (optional): Filter by `pending`, `approved`, or `rejected`
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Example:**
```
GET /api/admin/restaurants?status=pending&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 25,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "cuisine": "Italian",
      "location": "Downtown",
      "status": "pending",
      "owner_id": 5,
      "owner_name": "Restaurant Owner",
      "created_at": "2026-01-22T09:00:00Z",
      "dish_count": 12,
      "review_count": 5,
      "avg_rating": 4.5
    }
  ]
}
```

---

#### PUT `/restaurants/:id/status`
Approve, reject, or set restaurant status to pending.

**Parameters:**
- `id` (required): Restaurant ID
- `status` (required in body): One of `approved`, `rejected`, `pending`

**Request Body:**
```json
{
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant status updated to approved"
}
```

---

#### DELETE `/restaurants/:id`
Delete a restaurant and all associated data (dishes, reviews).

**Parameters:**
- `id` (required): Restaurant ID

**Response:**
```json
{
  "success": true,
  "message": "Restaurant deleted"
}
```

---

### 4. REVIEW MODERATION

#### GET `/reviews`
List all reviews for moderation.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "restaurant_id": 5,
      "user_id": 10,
      "comment": "Great food and service!",
      "rating": 5,
      "created_at": "2026-01-22T12:00:00Z",
      "restaurant_name": "Pizza Palace",
      "user_name": "John Doe"
    }
  ]
}
```

---

#### DELETE `/reviews/:id`
Remove an inappropriate review.

**Parameters:**
- `id` (required): Review ID

**Response:**
```json
{
  "success": true,
  "message": "Review removed"
}
```

---

## ERROR RESPONSES

### 403 Forbidden - Not Admin
```json
{
  "success": false,
  "error": "Access denied. Administrators only."
}
```

### 401 Unauthorized - No Token
```json
{
  "success": false,
  "error": "Access token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid role. Must be customer, owner, or admin"
}
```

---

## TESTING WITH CURL

### Get admin dashboard
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/dashboard
```

### List all users
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/users
```

### Update user role
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "owner"}' \
  http://localhost:5000/api/admin/users/5/role
```

### Get pending restaurants
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/restaurants?status=pending
```

### Approve a restaurant
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}' \
  http://localhost:5000/api/admin/restaurants/1/status
```

### Delete a review
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/reviews/1
```

---

## USAGE FLOW

### Step 1: Admin Login
```bash
POST /api/auth/login
Body: {"email": "admin@dishcovery.test", "password": "admin123"}
```
Save the returned JWT token.

### Step 2: Access Admin Dashboard
```bash
GET /api/admin/dashboard
Header: Authorization: Bearer {token}
```

### Step 3: Moderate Restaurants
```bash
GET /api/admin/restaurants?status=pending
PUT /api/admin/restaurants/{id}/status
```

### Step 4: Moderate Users
```bash
GET /api/admin/users
PUT /api/admin/users/{id}/role
PUT /api/admin/users/{id}/deactivate
```

### Step 5: Moderate Reviews
```bash
GET /api/admin/reviews
DELETE /api/admin/reviews/{id}
```
