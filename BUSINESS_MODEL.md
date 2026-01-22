# 🏪 Dishcovery Business Model

## Core Concept: 1 Owner = 1 Restaurant

Dishcovery operates on a **1:1 owner-to-restaurant relationship** where:
- Each restaurant owner has exactly ONE restaurant
- Owner profile = Restaurant profile (they are linked identities)
- Restaurant data is managed through owner dashboard
- All restaurant activities are tracked as owner activities

---

## 📊 Database Relationships

### Users ↔ Restaurants ↔ Dishes

```
┌─────────────────────────────────────────────────┐
│                    USER (Owner)                 │
│  - email, password, name, avatar, bio, etc     │
└─────────────────┬───────────────────────────────┘
                  │
            UNIQUE LINK (1:1)
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│                 RESTAURANT                      │
│  - name, cuisine, location, description        │
│  - contact_phone, contact_email, website       │
│  - opening_hours, social_links, image_url      │
│  - status (pending/approved/rejected)          │
└─────────────────┬───────────────────────────────┘
                  │
           ONE-TO-MANY
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│                DISHES (Menu)                    │
│  - name, description, price                    │
│  - category, is_vegetarian, is_spicy           │
│  - image_url, calories, preparation_time       │
└─────────────────────────────────────────────────┘
```

### Restaurant Ownership Table (1:1 Constraint)

```sql
CREATE TABLE restaurant_owners (
    user_id INT NOT NULL UNIQUE,        -- Each owner can own exactly ONE restaurant
    restaurant_id INT NOT NULL UNIQUE,  -- Each restaurant has exactly ONE owner
    role ENUM('owner', 'manager', 'staff') DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
```

---

## 🍽️ Restaurant Management

### Creating a Restaurant

When an owner creates a restaurant:

1. **Restaurant Entry** - Created in `restaurants` table
2. **Ownership Link** - Entry created in `restaurant_owners` with 1:1 uniqueness
3. **Status** - Set to `pending` (awaiting admin approval)
4. **Initial Post** - Post created announcing restaurant profile

**Endpoint**: `POST /api/owner/restaurants`

```bash
curl -X POST http://localhost:5000/api/owner/restaurants \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d {
    "name": "La Dolce Vita",
    "cuisine": "Italian",
    "location": "Downtown",
    "description": "Authentic Italian cuisine",
    "price_range": 3,
    "contact_phone": "+1-555-0100",
    "contact_email": "info@ladolcevita.com",
    "website": "www.ladolcevita.com",
    "image_url": "..."
  }
```

---

## 🔄 Automatic Post Creation on Updates

Posts are **automatically created** when owner updates:

### 1️⃣ Profile Updates (Restaurant Info)
```
✓ Name changed
✓ Cuisine type changed
✓ Location changed
✓ Description updated
✓ Contact info updated
✓ Website/Social links updated
✓ Opening hours modified

Post Type: menu_update
Title: "🏢 Restaurant Profile Updated"
Example: "Updated: name, contact_email, opening_hours"
```

### 2️⃣ Menu Updates (Dishes)
```
✓ New dish added
✓ Dish price changed
✓ Dish description updated
✓ Dish availability toggled
✓ Category changed

Post Type: menu_update
Title: "🆕 New Dish Added: {dishName}" or "📝 Menu Updated: {dishName}"
Example: "Added Margherita Pizza to the menu at $12.99"
```

### 3️⃣ Milestone Announcements (Manual)
```
Owner can create manual posts for:
✓ Grand opening
✓ Anniversary celebrations
✓ Special events
✓ Promotions
✓ New location opening

Post Type: announcement/event/promotion
Title: User-defined
Content: User-defined
```

---

## 📱 Owner Dashboard Features

The Owner Dashboard displays:

### Restaurant Section
- **Restaurant Profile** (read from owner's profile data)
- Restaurant name, image, cuisine, location
- Contact information
- Operating status (pending/approved/rejected)

### Menu Management
- **View all dishes** (browse current menu)
- **Add new dish** → Auto-creates post: "🆕 New Dish Added"
- **Edit dish** (price, description, availability) → Auto-creates post: "📝 Menu Updated"
- **Delete dish** (removes from menu)

### Activity Feed
- **All posts** created by this restaurant
- Posts about profile updates
- Posts about menu changes
- Engagement metrics (likes, comments)

### Followers
- Users following this restaurant
- Following count displayed

---

## 🌐 Customer View

When users browse restaurants:

### Restaurant Profile Page
Shows:
- Restaurant name, image, description
- Cuisine, location, contact info
- Menu (dishes with prices)
- Reviews and ratings
- Recent posts (updates, promotions)
- Follow button

### Dish Search
Users can:
- Search for specific dishes
- See which restaurants serve them
- Compare prices across restaurants
- See dish details (description, price, vegetarian/spicy status)

---

## 🔔 Post Feed (Activity)

### For Followers
When a user follows a restaurant, they see:
- New dishes added to the menu
- Restaurant profile updates
- Announcements and promotions
- Special events and milestones

### Post Types
```
TYPE: menu_update
- New dish added
- Menu changed
- Dish prices updated

TYPE: announcement
- Important notices
- New location opening
- Restaurant news

TYPE: promotion
- Special offers
- Discounts
- Limited-time deals

TYPE: event
- Grand opening
- Anniversary
- Special celebration
```

---

## 🔒 Authorization Rules

### Only Owner Can:
- ✅ Edit restaurant profile
- ✅ Add/edit/delete dishes
- ✅ View restaurant analytics
- ✅ Manage followers

### Admin Can:
- ✅ Approve/reject restaurant
- ✅ View all restaurants
- ✅ Moderate posts/content

### Customers Can:
- ✅ View restaurant profile
- ✅ Search dishes
- ✅ Read posts
- ✅ Follow restaurant
- ✅ Leave reviews

---

## 🎯 Workflow Example

### Alice Opens a Restaurant

1. **Sign up as Owner** → Email: alice@example.com
2. **Create Restaurant**
   ```
   Name: "Alice's Bistro"
   Cuisine: French
   Location: Midtown
   Status: pending
   ```
3. **Admin approves** → Status changes to: approved

4. **Alice Adds Dishes**
   ```
   Dish 1: Coq au Vin - $18.99
   ✓ Post created: "🆕 New Dish Added: Coq au Vin"
   
   Dish 2: Crème Brûlée - $8.99
   ✓ Post created: "🆕 New Dish Added: Crème Brûlée"
   ```

5. **Alice Updates Restaurant Info**
   ```
   Updates: opening_hours, contact_phone
   ✓ Post created: "🏢 Restaurant Profile Updated"
   ```

6. **Users follow Alice's Bistro**
   - They see all posts about new dishes
   - They see profile updates
   - They can search for Coq au Vin and find Alice's Bistro

---

## 📋 Database Constraints

### Unique Constraints Enforced
```
restaurant_owners.user_id UNIQUE
  ↳ Each owner owns exactly 1 restaurant

restaurant_owners.restaurant_id UNIQUE
  ↳ Each restaurant has exactly 1 owner
```

### Cascade Rules
```
DELETE user → DELETE restaurant (via restaurant_owners)
DELETE restaurant → DELETE dishes, posts, reviews
```

---

## 🚀 Future Enhancements

- [ ] Multi-location support (same owner, multiple restaurants)
- [ ] Staff management (allow managers/staff to help)
- [ ] Menu scheduling (daily specials, seasonal items)
- [ ] Analytics dashboard (dish popularity, sales trends)
- [ ] Reservation system
- [ ] Delivery partnerships
- [ ] Loyalty program management

---

**Status**: ✅ Fully Implemented (Jan 22, 2026)  
**Version**: 1.0
