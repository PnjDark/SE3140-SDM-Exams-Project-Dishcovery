# Implementation Changes: 1 Owner = 1 Restaurant Model

## Summary

Updated Dishcovery to implement the 1:1 owner-to-restaurant relationship with automatic post creation on updates.

---

## Database Changes

### 1. Restaurant Owners Table - Added Uniqueness
**File**: `database/schema.sql`

```sql
-- BEFORE: Multiple owners could own same restaurant
restaurant_owners (
    user_id INT,           -- Could be duplicated
    restaurant_id INT      -- Could be duplicated
)

-- AFTER: Enforced 1:1 relationship
restaurant_owners (
    user_id INT UNIQUE,           -- Each owner owns exactly 1 restaurant
    restaurant_id INT UNIQUE      -- Each restaurant has 1 owner
)
```

---

## Backend Changes

### 2. Restaurant Update - Auto Post Creation
**File**: `server/routes/owner.js`
**Endpoint**: `PUT /api/owner/restaurants/:id`

**Changes**:
- When owner updates restaurant (profile, cuisine, location, etc.)
- Automatically creates a post in the `posts` table
- Post type: `menu_update`
- Post title: "Restaurant Profile Updated"
- Post content: Lists the updated fields

```javascript
// Auto-create post for restaurant update
const postTitle = `Restaurant Profile Updated`;
const postContent = `Updated: ${Object.keys(updates).join(', ')}`;

await promisePool.execute(
  `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [restaurantId, userId, 'menu_update', postTitle, postContent, true]
);
```

---

### 3. Dish Creation - Auto Post Creation
**File**: `server/routes/owner.js`
**Endpoint**: `POST /api/owner/restaurants/:id/dishes`

**Changes**:
- When owner adds new dish to menu
- Automatically creates a post
- Post type: `menu_update`
- Post title: "🆕 New Dish Added: {dishName}"
- Post content: Includes price and details

```javascript
// Auto-create post for new dish
await promisePool.execute(
  `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    restaurantId,
    userId,
    'menu_update',
    `🆕 New Dish Added: ${name}`,
    `Added ${name} to the menu at $${price}`,
    true
  ]
);
```

---

### 4. Dish Update - Auto Post Creation
**File**: `server/routes/owner.js`
**Endpoint**: `PUT /api/owner/dishes/:id`

**Changes**:
- When owner edits existing dish (price, description, etc.)
- Automatically creates a post
- Post type: `menu_update`
- Post title: "📝 Menu Updated: {dishName}"
- Post content: Lists the updated fields

```javascript
// Auto-create post for dish update
await promisePool.execute(
  `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    restaurantId,
    userId,
    'menu_update',
    `📝 Menu Updated: ${updates.name || dishes[0].name}`,
    `Updated: ${Object.keys(updates).join(', ')}`,
    true
  ]
);
```

---

## Frontend Readiness

The following components already support this model:

### OwnerDashboard
- ✅ Shows owner's restaurant
- ✅ Allows editing restaurant profile
- ✅ Displays menu (dishes)
- ✅ Can add new dishes
- ✅ Shows posts/activity

### DishSearch & Restaurants Pages
- ✅ Display restaurant info
- ✅ Show menu items with prices
- ✅ Link to owner profiles

### Activity Feed
- ✅ Displays posts
- ✅ Shows post engagement

---

## Implementation Details

### What Happens When Owner Updates

#### Scenario 1: Updates Restaurant Profile
```
Owner Action: Changes opening_hours and contact_phone
↓
Backend: Update restaurant record
↓
Trigger: Auto-create post
  - Type: menu_update
  - Title: "Restaurant Profile Updated"
  - Content: "Updated: opening_hours, contact_phone"
↓
Followers: See post in their feed
```

#### Scenario 2: Adds New Dish
```
Owner Action: Adds "Margherita Pizza - $12.99"
↓
Backend: Insert into dishes table
↓
Trigger: Auto-create post
  - Type: menu_update
  - Title: "🆕 New Dish Added: Margherita Pizza"
  - Content: "Added Margherita Pizza to the menu at $12.99"
↓
Followers: See announcement of new dish
```

#### Scenario 3: Updates Dish Price
```
Owner Action: Changes Margherita from $12.99 to $14.99
↓
Backend: Update dishes record
↓
Trigger: Auto-create post
  - Type: menu_update
  - Title: "📝 Menu Updated: Margherita Pizza"
  - Content: "Updated: price"
↓
Followers: See the price change notification
```

---

## Data Flow

### Creation Flow
```
Owner Creates Restaurant
  ↓
INSERT restaurants
INSERT restaurant_owners (with unique constraints)
↓
Status: pending (awaits admin approval)
```

### Update Flow
```
Owner Updates Restaurant/Dishes
  ↓
UPDATE restaurants / UPDATE dishes
  ↓
INSERT posts (auto-triggered)
  ↓
Followers notified via feed
```

---

## Constraints Enforced

### Database Level
- `restaurant_owners.user_id` UNIQUE
  - Each user can own max 1 restaurant
  
- `restaurant_owners.restaurant_id` UNIQUE
  - Each restaurant can have max 1 owner

### Application Level
- Ownership check on all restaurant operations
- Validation of 1:1 relationship before updates

---

## Testing Scenarios

### Test Case 1: Owner Restaurant Creation
```bash
POST /api/owner/restaurants
{
  "name": "Test Restaurant",
  "cuisine": "Italian",
  "location": "Downtown"
}

Expected:
- Restaurant created (status: pending)
- Entry in restaurant_owners
- Post created in posts table
```

### Test Case 2: Menu Update
```bash
POST /api/owner/restaurants/1/dishes
{
  "name": "Pasta Carbonara",
  "price": 15.99,
  "description": "Classic Roman pasta"
}

Expected:
- Dish created
- Post created: "🆕 New Dish Added: Pasta Carbonara"
- Followers see update
```

### Test Case 3: Price Update
```bash
PUT /api/owner/dishes/1
{
  "price": 16.99
}

Expected:
- Dish updated
- Post created: "📝 Menu Updated: Pasta Carbonara"
- Post content: "Updated: price"
```

---

## Files Modified

1. **database/schema.sql**
   - Added UNIQUE constraints to `restaurant_owners`

2. **server/routes/owner.js**
   - Updated `PUT /api/owner/restaurants/:id`
   - Updated `POST /api/owner/restaurants/:id/dishes`
   - Updated `PUT /api/owner/dishes/:id`
   - All now auto-create posts

---

## Documentation Created

**File**: `BUSINESS_MODEL.md`
- Complete business model documentation
- Workflow examples
- Authorization rules
- Future enhancements

---

## Backward Compatibility

✅ All existing endpoints remain functional
✅ New post creation doesn't break existing logic
✅ If post creation fails, restaurant update still succeeds (logged as warning)

---

## Completion Status

✅ Database schema updated
✅ Backend endpoints modified
✅ Automatic post creation implemented
✅ Validation enforced
✅ Documentation created

**Ready for Testing**

