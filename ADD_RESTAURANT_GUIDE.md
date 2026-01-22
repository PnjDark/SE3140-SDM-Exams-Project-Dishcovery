# 🍽️ Add Restaurant Function Guide

Complete guide for adding a new restaurant to Dishcovery using the owner API.

## Overview

The restaurant creation endpoint allows restaurant owners to register their establishments. New restaurants start with a **pending** status and must be approved by an admin before customers can see them.

---

## API Endpoint

**POST** `/api/owner/restaurants`

### Authentication Required
- **Header**: `Authorization: Bearer {JWT_TOKEN}`
- **Role**: `owner` (user must have owner role)

---

## Request Body

```json
{
  "name": "Delicious Pizza House",
  "cuisine": "Italian",
  "location": "Downtown District",
  "description": "Authentic Italian pizzeria with traditional wood-fired oven",
  "price_range": 3,
  "contact_phone": "+1-555-123-4567",
  "contact_email": "owner@pizzahouse.com",
  "website": "https://www.pizzahouse.com",
  "image_url": "/uploads/restaurant-1.jpg",
  "opening_hours": {
    "monday": "11:00-23:00",
    "tuesday": "11:00-23:00",
    "wednesday": "11:00-23:00",
    "thursday": "11:00-23:00",
    "friday": "11:00-00:00",
    "saturday": "12:00-00:00",
    "sunday": "12:00-22:00"
  },
  "social_links": {
    "instagram": "@pizzahouse",
    "facebook": "pizzahouse.official"
  }
}
```

---

## Field Descriptions

### Required Fields

| Field | Type | Validation | Example |
|-------|------|-----------|---------|
| **name** | String | 3-100 characters | "Delicious Pizza House" |
| **cuisine** | String | 2-50 characters | "Italian" |
| **location** | String | 2-100 characters | "Downtown District" |

### Optional Fields

| Field | Type | Validation | Example |
|-------|------|-----------|---------|
| **description** | String | Any length | "Authentic Italian pizzeria..." |
| **price_range** | Integer | 1-5 (1=cheap, 5=expensive) | 3 |
| **contact_phone** | String | Max 20 characters | "+1-555-123-4567" |
| **contact_email** | String | Valid email format | "owner@pizzahouse.com" |
| **website** | String | Max 200 characters | "https://www.pizzahouse.com" |
| **image_url** | String | File path/URL | "/uploads/restaurant-1.jpg" |
| **opening_hours** | JSON Object | Key-value pairs | `{"monday": "11:00-23:00"}` |
| **social_links** | JSON Object | Platform names | `{"instagram": "@handle"}` |

---

## Validation Rules

### Name Validation
- ✅ Must be 3-100 characters
- ✅ Must not be empty
- ❌ "AB" - too short
- ❌ "Deli..." (>100 chars) - too long

### Cuisine Validation
- ✅ Must be 2-50 characters
- ✅ Examples: Italian, Mexican, Chinese, Thai, French
- ❌ "I" - too short
- ❌ Very long cuisines - too long

### Location Validation
- ✅ Must be 2-100 characters
- ✅ Examples: Downtown, Midtown, Business District
- ❌ "A" - too short

### Price Range Validation
- ✅ Must be 1-5 (integer)
- ❌ 0 or 6+ - out of range
- ❌ Non-integer values

### Phone Validation
- ✅ Max 20 characters
- ✅ Any format (no strict validation)
- ❌ Longer than 20 characters

### Email Validation
- ✅ Must match `user@domain.com` format
- ❌ "invalid-email" - no @ or domain
- ❌ "user@" - incomplete

### Website Validation
- ✅ Max 200 characters
- ✅ Should be valid URL format
- ❌ Longer than 200 characters

---

## Success Response (201)

```json
{
  "success": true,
  "message": "Restaurant created successfully and awaiting admin approval",
  "data": {
    "id": 1,
    "name": "Delicious Pizza House",
    "cuisine": "Italian",
    "location": "Downtown District",
    "status": "pending",
    "owner_id": 5,
    "created_at": "2026-01-22T10:30:45.000Z"
  }
}
```

**Status Code**: `201 Created`

---

## Error Responses

### 400 - Validation Error (Multiple Fields)

```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation failed",
  "details": {
    "name": "Restaurant name must be 3-100 characters",
    "cuisine": "Cuisine must be 2-50 characters",
    "contact_email": "Invalid email format"
  },
  "timestamp": "2026-01-22T10:30:45.000Z"
}
```

### 400 - Single Field Validation Error

```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation failed: name",
  "details": "Restaurant name must be 3-100 characters",
  "timestamp": "2026-01-22T10:30:45.000Z"
}
```

### 403 - Access Denied

```json
{
  "success": false,
  "error": "Access denied. Restaurant owners only.",
  "timestamp": "2026-01-22T10:30:45.000Z"
}
```

Occurs when:
- User is not authenticated
- User doesn't have 'owner' role
- Invalid/expired JWT token

### 409 - Duplicate Restaurant

```json
{
  "success": false,
  "error": "A restaurant with this name already exists",
  "timestamp": "2026-01-22T10:30:45.000Z"
}
```

### 500 - Server Error

```json
{
  "success": false,
  "error": "Failed to create restaurant",
  "timestamp": "2026-01-22T10:30:45.000Z"
}
```

---

## cURL Examples

### Basic Restaurant Creation

```bash
curl -X POST http://localhost:5000/api/owner/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Pizza Palace",
    "cuisine": "Italian",
    "location": "Downtown",
    "price_range": 3
  }'
```

### Complete Restaurant with All Fields

```bash
curl -X POST http://localhost:5000/api/owner/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Delicious Pizza House",
    "cuisine": "Italian",
    "location": "Downtown District",
    "description": "Authentic Italian pizzeria",
    "price_range": 3,
    "contact_phone": "+1-555-123-4567",
    "contact_email": "owner@pizzahouse.com",
    "website": "https://pizzahouse.com",
    "image_url": "/uploads/restaurant-1.jpg",
    "opening_hours": {
      "monday": "11:00-23:00",
      "tuesday": "11:00-23:00"
    },
    "social_links": {
      "instagram": "@pizzahouse",
      "facebook": "pizzahouse"
    }
  }'
```

### Minimal Valid Request

```bash
curl -X POST http://localhost:5000/api/owner/restaurants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Restaurant",
    "cuisine": "Mexican",
    "location": "Main Street"
  }'
```

---

## Workflow After Creation

### Step 1: Owner Creates Restaurant
- Restaurant status: `pending`
- Customers cannot see it yet
- Owner can add dishes and manage it

### Step 2: Admin Approval
- Admin reviews the restaurant in `/api/admin/restaurants?status=pending`
- Admin either:
  - **Approves**: Status → `approved` (customers can see it)
  - **Rejects**: Status → `rejected` (owner notified)

### Step 3: Customer Access
- Once `approved`, customers can:
  - View restaurant in listings
  - Browse its menu
  - Leave reviews
  - Follow the restaurant

---

## Integration with Upload API

To upload a restaurant image before creation:

1. **Upload image** using `POST /api/upload`
   ```bash
   curl -X POST http://localhost:5000/api/upload \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "image=@restaurant.jpg"
   ```

2. **Use returned URL** in restaurant creation
   ```bash
   "image_url": "/uploads/restaurant-1704854445832-xyz789.jpg"
   ```

---

## Database Operations

### What Happens Behind the Scenes

1. **Insert into `restaurants` table**
   - Creates new restaurant record
   - Sets status to `pending`
   - Associates with owner_id

2. **Insert into `restaurant_owners` table**
   - Creates owner-restaurant relationship
   - Sets role to `owner`

3. **Return created restaurant data**
   - ID, name, cuisine, location, status, timestamps

---

## Testing Checklist

- [ ] Create restaurant with minimal fields (name, cuisine, location)
- [ ] Create restaurant with all optional fields
- [ ] Test validation: short name (< 3 chars)
- [ ] Test validation: long name (> 100 chars)
- [ ] Test validation: invalid email
- [ ] Test validation: invalid price range
- [ ] Test authentication: missing JWT token
- [ ] Test authorization: non-owner user
- [ ] Verify restaurant shows as "pending"
- [ ] Verify owner appears in restaurant_owners table
- [ ] Verify customer cannot see pending restaurant
- [ ] Verify owner can see their pending restaurant
- [ ] Test admin approval workflow

---

## Related Endpoints

- **Get Owner Restaurants**: `GET /api/owner/restaurants`
- **Update Restaurant**: `PUT /api/owner/restaurants/:id`
- **Get All Restaurants (Admin)**: `GET /api/admin/restaurants`
- **Approve Restaurant (Admin)**: `PUT /api/admin/restaurants/:id/status`
- **Upload Image**: `POST /api/upload`
- **Add Dishes**: `POST /api/owner/restaurants/:id/dishes`

---

## Troubleshooting

### "Access denied. Restaurant owners only"
- **Cause**: User role is not 'owner'
- **Solution**: Register/login as owner or have admin change your role

### "Validation failed: name"
- **Cause**: Name is too short or too long
- **Solution**: Use name between 3-100 characters

### "Invalid email format"
- **Cause**: Email doesn't match standard format
- **Solution**: Use format like `user@domain.com`

### "A restaurant with this name already exists"
- **Cause**: Duplicate restaurant name
- **Solution**: Choose a unique restaurant name

### "Failed to create restaurant"
- **Cause**: Database or server error
- **Solution**: Check server logs, ensure database is running

---

## Best Practices

✅ **Do:**
- Validate all inputs before sending
- Use meaningful restaurant names
- Include contact information
- Upload a restaurant image
- Set accurate opening hours
- Include social media links
- Test with mock data first

❌ **Don't:**
- Send extremely long strings
- Use invalid email formats
- Leave required fields empty
- Use duplicate restaurant names
- Bypass validation on client
- Store sensitive data in opening_hours/social_links

---

**Last Updated**: January 22, 2026  
**Version**: 1.0.0
