# 🍽️ DISHCOVERY - RESTAURANT APPROVAL WORKFLOW

## Overview
The restaurant approval system ensures quality control and maintains platform integrity. Only **approved restaurants** are visible to customers, while pending and rejected restaurants are handled by owners and admins.

---

## 🔄 WORKFLOW STAGES

### Stage 1: Owner Creates Restaurant
**Actor:** Restaurant Owner  
**Location:** Owner Dashboard → Create Restaurant

```
Owner submits restaurant details
    ↓
Restaurant saved with status: PENDING
    ↓
Restaurant NOT visible to customers
    ↓
Owner can see it in their dashboard (pending)
    ↓
Admin receives notification (pending)
```

**Restaurant Details Required:**
- Name
- Cuisine type
- Location
- Description
- Price range (1-5)
- Contact phone/email (optional)
- Website (optional)

**Owner Dashboard View:**
- Shows all restaurants (pending, approved, rejected)
- Can edit/delete while pending
- Cannot delete once approved

---

### Stage 2: Admin Reviews & Moderates
**Actor:** Administrator  
**Location:** Admin Dashboard → Restaurants Tab

#### View Pending Restaurants
```bash
GET /api/admin/restaurants?status=pending
```

**Admin sees:**
- Restaurant name, cuisine, location
- Owner name
- Submission date
- Dish count
- Review count
- Average rating

#### Action: Approve
```bash
PUT /api/admin/restaurants/:id/status
Body: {"status": "approved"}
```

**Result:**
- Restaurant becomes visible to all customers
- Customers can browse menu and leave reviews
- Owner receives confirmation (future feature)

#### Action: Reject
```bash
PUT /api/admin/restaurants/:id/status
Body: {"status": "rejected"}
```

**Result:**
- Restaurant remains invisible to customers
- Owner can see rejection in dashboard
- Owner can update and resubmit (future feature)

#### Action: Delete
```bash
DELETE /api/admin/restaurants/:id
```

**Result:**
- Restaurant permanently removed
- All dishes and reviews deleted (cascading)
- Owner must create new restaurant entry

---

### Stage 3: Customer Browsing (Approved Only)
**Actor:** Customer  
**Location:** Home, Restaurants Page

#### Browse Restaurants
```javascript
// Customers see ONLY approved restaurants
GET /api/restaurants
// Returns: status = "approved"
```

**Customer Actions:**
- View restaurant details
- Browse menu (approved restaurants only)
- Leave reviews (only on approved)
- Follow restaurant

#### Dishes & Reviews
```javascript
// Only accessible from approved restaurants
GET /api/restaurants/:id/dishes
GET /api/restaurants/:id/reviews
POST /api/restaurants/:id/reviews
```

---

## 📊 STATUS SUMMARY

| Status | Visible to Customers | Visible to Owner | Owner Can Edit | Can Receive Reviews |
|--------|----------------------|------------------|----------------|---------------------|
| **Pending** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Approved** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Rejected** | ❌ No | ✅ Yes | ✅ Yes | ❌ No |

---

## 🔐 API RESTRICTIONS

### Customer-Facing Endpoints (Filter Applied)
```
GET /api/restaurants              → Only approved
GET /api/restaurants/:id          → Only approved
GET /api/restaurants/:id/dishes   → Only from approved
POST /api/restaurants/:id/reviews → Only to approved
```

### Owner-Facing Endpoints (No Filter)
```
GET /api/owner/restaurants        → All statuses
GET /api/owner/restaurants/:id    → All statuses
```

### Admin-Facing Endpoints (Includes All)
```
GET /api/admin/restaurants                   → All statuses
GET /api/admin/restaurants?status=pending    → Filter by status
PUT /api/admin/restaurants/:id/status        → Change status
DELETE /api/admin/restaurants/:id            → Remove
```

---

## 🧪 TESTING THE WORKFLOW

### Step 1: Create Test Owner Account
```bash
POST /api/auth/register
{
  "email": "testowner@test.com",
  "password": "password123",
  "name": "Test Owner",
  "role": "owner"
}
```

### Step 2: Owner Creates Restaurant
```bash
POST /api/owner/restaurants
Authorization: Bearer {owner_token}
{
  "name": "Pizza Palace",
  "cuisine": "Italian",
  "location": "Downtown",
  "description": "Authentic Italian pizza",
  "price_range": 3
}
```

**Result:** `"status": "pending"`

### Step 3: Verify Not Visible to Customers
```bash
GET /api/restaurants
Authorization: Bearer {customer_token}
```

**Result:** Pizza Palace NOT in list

### Step 4: Admin Approves Restaurant
```bash
PUT /api/admin/restaurants/1/status
Authorization: Bearer {admin_token}
{
  "status": "approved"
}
```

### Step 5: Verify Visible to Customers
```bash
GET /api/restaurants
Authorization: Bearer {customer_token}
```

**Result:** Pizza Palace NOW in list ✅

### Step 6: Customer Can Leave Review
```bash
POST /api/restaurants/1/reviews
{
  "user_name": "Customer",
  "comment": "Great pizza!",
  "rating": 5
}
```

**Result:** Review added successfully ✅

---

## 📋 PENDING FEATURES (Future Enhancements)

- [ ] Email notifications to owners when restaurant is approved/rejected
- [ ] Automatic approval for repeat restaurant owners with good history
- [ ] Appeals workflow for rejected restaurants
- [ ] Inspection checklist for admins
- [ ] Restaurant verification badges
- [ ] Scheduled auto-cleanup of old rejected restaurants
- [ ] Bulk import/approval for trusted partners

---

## 🚨 EDGE CASES HANDLED

### 1. Customer Tries to Access Rejected Restaurant
```
GET /api/restaurants/1 (rejected)
Response: 404 Not Found
```

### 2. Owner Tries to See Approval Stats
```
GET /api/owner/restaurants/1 (their pending restaurant)
Response: ✅ Shows with status: "pending"
```

### 3. Admin Deletes Restaurant
```
DELETE /api/admin/restaurants/1
All related data deleted:
- Dishes (CASCADE DELETE)
- Reviews (CASCADE DELETE)
```

### 4. Customer Reviews Before Approval
```
POST /api/restaurants/1/reviews (pending)
Response: 404 - "Restaurant not found or not approved for reviews"
```

---

## 💡 WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESTAURANT LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

OWNER: Creates Restaurant
    │
    ├─→ Status: PENDING
    │   └─→ Visible to: Owner only
    │       Actions: Edit, Delete, View in Dashboard
    │
    ├─→ [ADMIN REVIEW]
    │   ├─→ Approve?
    │   │   ├─→ Status: APPROVED ✅
    │   │   │   └─→ Visible to: Everyone
    │   │   │       Actions: Browse, Review, Follow
    │   │   │
    │   │   ├─→ Reject?
    │   │   │   └─→ Status: REJECTED ❌
    │   │   │       Visible to: Owner only
    │   │   │       Actions: Edit, Resubmit
    │   │   │
    │   │   └─→ Delete?
    │   │       └─→ DELETED 🗑️
    │   │           Visible to: No one
    │   │           All data removed
    │
    └─→ [ONGOING]
        ├─→ Owner: Can edit/manage menu
        ├─→ Customers: Browse, review, follow
        └─→ Admin: Monitor, moderate reviews, change status
```

---

## 🛠️ IMPLEMENTATION CHECKLIST

- ✅ Database schema includes `status` column
- ✅ Backend API filters restaurants by approval status
- ✅ Owner can see all their restaurants regardless of status
- ✅ Admin can moderate all restaurants
- ✅ Customer endpoints enforce approval requirement
- ✅ Reviews only allowed on approved restaurants
- ✅ Dishes only visible from approved restaurants
- ⏳ (Future) Email notifications to owners
- ⏳ (Future) Frontend displays pending status to owner
- ⏳ (Future) Admin notification system

---

## 📞 SUPPORT & TROUBLESHOOTING

### Problem: Restaurant not visible after creation
**Solution:** Check status in owner dashboard. If pending, ask admin to approve.

### Problem: Can't leave review on restaurant
**Solution:** Restaurant may not be approved yet. Check admin dashboard.

### Problem: Admin can't find restaurant to approve
**Solution:** Filter by `?status=pending` in admin restaurants view.

### Problem: Deleted restaurant data still showing
**Solution:** Clear browser cache or wait for database cache refresh.
