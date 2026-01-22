# 🔍 DATA VALIDATION & ERROR HANDLING DOCUMENTATION

## Overview

All Dishcovery API endpoints now include comprehensive input validation and standardized error responses. This ensures data integrity, security, and consistent API behavior.

---

## VALIDATION RULES

### User/Account Fields

#### Email
- **Required:** Yes (for registration and login)
- **Format:** Must be valid email address
- **Max length:** 100 characters
- **Validation:** `isValidEmail()`

#### Password
- **Required:** Yes (for registration and login)
- **Min length:** 6 characters
- **Max length:** 255 characters
- **Note:** Plain text, hashed on server
- **Validation:** `isValidPassword()`

#### Name (User)
- **Required:** Yes (for registration)
- **Min length:** 2 characters
- **Max length:** 100 characters
- **Validation:** `isValidName()`

#### Role
- **Required:** No (defaults to 'customer')
- **Allowed values:** `customer`, `owner`, `admin`
- **Validation:** `isValidRole()`

#### Location
- **Required:** No (optional)
- **Min length:** 2 characters
- **Max length:** 100 characters
- **Validation:** `isValidLocation()`

#### Bio
- **Required:** No (optional)
- **Max length:** 500 characters
- **Validation:** `isValidBio()`

---

### Restaurant Fields

#### Name
- **Required:** Yes
- **Min length:** 3 characters
- **Max length:** 100 characters
- **Validation:** `isValidRestaurantName()`

#### Cuisine
- **Required:** Yes
- **Min length:** 2 characters
- **Max length:** 50 characters
- **Validation:** `isValidCuisine()`

#### Location
- **Required:** Yes
- **Min length:** 2 characters
- **Max length:** 100 characters
- **Validation:** `isValidLocation()`

#### Description
- **Required:** No (optional)
- **Max length:** 2000 characters
- **Validation:** `isValidDescription()`

#### Price Range
- **Required:** No (defaults to 3)
- **Allowed values:** 1-5 (scale)
- **Validation:** `isValidPriceRange()`

#### Status
- **Required:** No (defaults to 'pending')
- **Allowed values:** `pending`, `approved`, `rejected`
- **Validation:** `isValidStatus()`

#### Phone
- **Required:** No (optional)
- **Format:** 7-20 characters, digits and symbols allowed
- **Validation:** `isValidPhone()`

#### Website
- **Required:** No (optional)
- **Format:** Valid URL
- **Max length:** 255 characters
- **Validation:** `isValidUrl()`

---

### Dish Fields

#### Name
- **Required:** Yes
- **Min length:** 2 characters
- **Max length:** 100 characters
- **Validation:** `isValidDishName()`

#### Price
- **Required:** Yes
- **Format:** Positive decimal number
- **Max value:** 10,000
- **Validation:** `isValidPrice()`

#### Description
- **Required:** No (optional)
- **Max length:** 2000 characters
- **Validation:** `isValidDescription()`

#### Category
- **Required:** No (optional)
- **Max length:** 50 characters

#### Tags (Dietary/Preferences)
- **Required:** No (optional)
- **Format:** JSON array
- **Validation:** `isValidJSON()`

---

### Review Fields

#### Rating
- **Required:** Yes
- **Allowed values:** 1-5
- **Validation:** `isValidRating()`

#### Comment
- **Required:** No (optional)
- **Max length:** 2000 characters

---

### Pagination Fields

#### Page
- **Default:** 1
- **Min value:** 1
- **Validation:** `isValidPage()`

#### Limit
- **Default:** 10
- **Min value:** 1
- **Max value:** 100
- **Validation:** `isValidLimit()`

---

## STANDARDIZED ERROR RESPONSES

### Error Response Format

All errors follow this structure:

```json
{
  "statusCode": 400,
  "success": false,
  "error": "Human-readable error message",
  "details": {
    "field": "fieldName",
    "message": "Specific validation message"
  },
  "timestamp": "2026-01-22T10:30:45.123Z"
}
```

---

## ERROR TYPES & STATUS CODES

### 400 Bad Request
**When:** Input validation fails

```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "email",
    "message": "Valid email is required"
  }
}
```

### 400 Multiple Field Validation Error

```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation failed",
  "details": {
    "fields": [
      {
        "field": "email",
        "message": "Valid email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 6 characters"
      }
    ]
  }
}
```

### 401 Unauthorized
**When:** Authentication required but not provided or invalid

```json
{
  "statusCode": 401,
  "success": false,
  "error": "Invalid credentials"
}
```

### 403 Forbidden
**When:** User lacks permission for action

```json
{
  "statusCode": 403,
  "success": false,
  "error": "Access denied. Restaurant owners only."
}
```

### 404 Not Found
**When:** Resource doesn't exist

```json
{
  "statusCode": 404,
  "success": false,
  "error": "Restaurant not found"
}
```

### 409 Conflict
**When:** Resource already exists (e.g., duplicate email)

```json
{
  "statusCode": 409,
  "success": false,
  "error": "User already exists with this email"
}
```

### 429 Too Many Requests
**When:** Rate limit exceeded (future feature)

```json
{
  "statusCode": 429,
  "success": false,
  "error": "Too many requests. Please try again later.",
  "details": {
    "retryAfter": 60
  }
}
```

### 500 Internal Server Error
**When:** Server-side error occurs

```json
{
  "statusCode": 500,
  "success": false,
  "error": "Internal server error"
}
```

---

## VALIDATION EXAMPLES

### Example 1: Register with Invalid Email

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "not-an-email",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation failed",
  "details": {
    "fields": [
      {
        "field": "email",
        "message": "Valid email is required"
      }
    ]
  },
  "timestamp": "2026-01-22T10:30:45.123Z"
}
```

---

### Example 2: Create Restaurant with Missing Required Fields

**Request:**
```bash
POST /api/owner/restaurants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Restaurant",
  // Missing: cuisine, location
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation failed",
  "details": {
    "fields": [
      {
        "field": "cuisine",
        "message": "Valid cuisine type is required"
      },
      {
        "field": "location",
        "message": "Location is required"
      }
    ]
  }
}
```

---

### Example 3: Create Dish with Invalid Price

**Request:**
```bash
POST /api/owner/restaurants/1/dishes
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Pasta",
  "price": -10,
  "category": "Main Course"
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "success": false,
  "error": "Validation error",
  "details": {
    "field": "price",
    "message": "Price must be a positive number"
  }
}
```

---

### Example 4: Duplicate User Registration

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "existing@email.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (409):**
```json
{
  "statusCode": 409,
  "success": false,
  "error": "User already exists with this email"
}
```

---

## VALIDATION UTILITIES

All validation is centralized in [server/utils/validation.js](server/utils/validation.js)

### Using in Routes

```javascript
const {
  isValidEmail,
  isValidPassword,
  isValidRestaurantName
} = require('../utils/validation');

// Validate email
if (!isValidEmail(email)) {
  return res.status(400).json({...});
}

// Validate password
if (!isValidPassword(password)) {
  return res.status(400).json({...});
}
```

### Custom Validation

```javascript
// Generic string length validation
const isValid = isValidStringLength(name, 2, 100);

// Create validation result
const result = createValidationResult(true, null);
// or
const result = createValidationResult(false, 'Error message');
```

---

## ERROR HANDLER UTILITIES

All error responses use [server/utils/errorHandler.js](server/utils/errorHandler.js)

### Creating Error Responses

```javascript
const {
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  serverError
} = require('../utils/errorHandler');

// Validation error
const err1 = validationError('email', 'Invalid email');

// Auth error
const err2 = authError('Invalid credentials');

// Access denied
const err3 = forbiddenError('Admin access required');

// Resource not found
const err4 = notFoundError('Restaurant');

// Server error
const err5 = serverError('Failed to process request', error);
```

---

## BEST PRACTICES

1. **Always validate** input on the server, never trust client
2. **Sanitize** strings by trimming whitespace
3. **Normalize** emails to lowercase
4. **Validate types** - ensure numbers are actually numbers
5. **Check ranges** - ensure values are within acceptable bounds
6. **Provide specific errors** - tell users exactly what's wrong
7. **Log errors** - but don't expose sensitive details to clients
8. **Fail fast** - validate before database operations
9. **Rate limit** - prevent abuse (future feature)
10. **Document rules** - keep validation rules consistent

---

## FUTURE ENHANCEMENTS

- [ ] Rate limiting by IP/user
- [ ] Request schema validation with JSON Schema
- [ ] Async validation (check uniqueness, etc.)
- [ ] Custom validation rules per role
- [ ] Audit logging of validation failures
- [ ] Input sanitization (HTML escaping, etc.)
- [ ] Field-level encryption for sensitive data
- [ ] CAPTCHA for suspicious activity

---

## TESTING VALIDATION

### Manual Testing with cURL

```bash
# Test invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"pwd123","name":"User"}'

# Test missing fields
curl -X POST http://localhost:5000/api/owner/restaurants \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Restaurant"}'

# Test invalid rating
curl -X POST http://localhost:5000/api/restaurants/1/reviews \
  -H "Content-Type: application/json" \
  -d '{"rating":10,"user_name":"User","comment":"Test"}'
```

---

## SUPPORT

For validation issues or questions, refer to:
- [server/utils/validation.js](server/utils/validation.js) - Validation functions
- [server/utils/errorHandler.js](server/utils/errorHandler.js) - Error responses
- Individual route files for endpoint-specific validation
