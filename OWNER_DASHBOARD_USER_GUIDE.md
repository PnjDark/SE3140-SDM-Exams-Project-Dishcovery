# Owner Dashboard User Guide

## Quick Start

### Accessing the Dashboard
Navigate to: `http://localhost:3000/owner-dashboard`

You must be logged in as an owner to access this page.

---

## Dashboard Tabs

### 1. Overview Tab
Shows quick statistics about your restaurant:
- Restaurant count
- Total dishes
- Total reviews
- Average rating

Includes shortcuts to manage your restaurant.

---

### 2. Restaurants Tab (Manage)

**What You See:**
- Your single restaurant displayed as a card
- Restaurant name, location, cuisine
- Current approval status
- Dish count and review count
- Action buttons

**Features:**
- View restaurant details at a glance
- See approval status (Pending/Approved/Rejected)
- Quick access to manage and view options

**Note:** The "+ Add Restaurant" button will be **disabled** if you already own a restaurant. This is by design - each owner can only own one restaurant.

---

### 3. Menu Tab (Menu Management)

**Step 1: Select Restaurant**
- Click the dropdown at the top
- Choose your restaurant
- Dishes will load automatically

**Step 2: View Current Menu**
- See all dishes you've added
- For each dish, view:
  - Dish name
  - Description
  - Price (formatted)
  - Category
  - Dietary tags (Vegetarian, Spicy)

**Step 3: Add New Dish**
- Click "+ Add Dish" button
- Fill out the form:

| Field | Required | Example |
|-------|----------|---------|
| Dish Name | Yes | Pasta Carbonara |
| Price | Yes | 12.99 |
| Category | No | Pasta |
| Description | No | Classic Italian pasta... |
| Vegetarian | No | ☑ Check if applicable |
| Spicy | No | ☑ Check if applicable |

- Click "Add Dish"
- Success message appears
- Dish added to menu
- **Auto-post created**: "🆕 New Dish Added: [Name]"

**Step 4: Delete Dishes**
- Find the dish in the menu
- Click "Delete" button
- Confirm deletion
- Dish removed from menu
- **Auto-post created**: "📝 Menu Updated: [Name]"

**Pro Tips:**
- Add all your signature dishes
- Use descriptions to entice customers
- Mark dietary restrictions clearly
- Prices update the menu immediately

---

### 4. Posts Tab (Activity Feed)

**What You See:**
- All auto-generated posts from your restaurant
- Posts are created automatically when you:
  - Add a new dish
  - Update a dish (price, description, etc.)
  - Update restaurant profile (hours, contact, etc.)

**Post Information:**
For each post, you can see:

| Element | What It Means |
|---------|--------------|
| Title | What happened (New Dish, Menu Updated, etc.) |
| Type Badge | Category (📝 Menu Update, 📢 Announcement, etc.) |
| Status Badge | ✅ Published or 🔒 Draft |
| Content | Details about the change |
| Date | When it was posted |
| Author | Who created the post (usually you) |

**Example Posts:**
```
📝 Menu Updated: Pasta Carbonara
[📝 Menu Update] [✅ Published]
Updated: price
by Test Owner, 1/22/2026
```

```
🆕 New Dish Added: Margherita Pizza
[📝 Menu Update] [✅ Published]
Added Margherita Pizza to the menu at $14.99
by Test Owner, 1/22/2026
```

**Pro Tips:**
- All posts are automatically published
- Followers will see these posts in their feed
- Use this to track your activity
- Monitor when you've made updates

---

## Important Rules

### ⚠️ The 1:1 Relationship
- **Each owner owns exactly ONE restaurant**
- **Each restaurant has exactly ONE owner**
- You cannot create a second restaurant
- If you try, you'll see: "You already own a restaurant. Each owner can only own one."
- This is a business requirement to ensure clear ownership

### 🔐 Automatic Post Creation
When you make changes to your restaurant or menu:
1. Change is saved to database
2. Post is automatically created
3. Followers are notified
4. Post appears in activity feed

**Example Triggers:**
- ✅ Adding a dish → Post created
- ✅ Deleting a dish → Post created
- ✅ Updating dish price → Post created
- ✅ Updating restaurant hours → Post created
- ✅ Changing contact info → Post created

---

## Common Tasks

### Task 1: Create Your First Dish
1. Go to "Menu" tab
2. Select your restaurant from dropdown
3. Click "+ Add Dish"
4. Fill in: Name (required), Price (required), Category, Description
5. Optionally check "Vegetarian" or "Spicy"
6. Click "Add Dish"
7. ✅ Done! Post automatically created

### Task 2: Remove a Dish
1. Go to "Menu" tab
2. Find the dish in your menu
3. Click "Delete" button
4. Confirm deletion
5. ✅ Done! Dish removed, post created

### Task 3: View Your Activity
1. Go to "Posts" tab
2. Select your restaurant (if not already selected)
3. View all your auto-generated posts
4. See when changes were made and by whom

### Task 4: Update Restaurant Profile
1. Go to "Restaurants" tab (or "Manage" in Overview)
2. Click "Manage" button on your restaurant
3. Update details (hours, phone, email, etc.)
4. Save changes
5. ✅ Post automatically created

---

## Troubleshooting

**Q: Why is "Add Restaurant" button disabled?**
A: You already own a restaurant. The system enforces a 1:1 relationship (one owner, one restaurant).

**Q: Why can't I add a second restaurant?**
A: By design, each owner owns exactly one restaurant. This ensures clear ownership and accountability.

**Q: When I add a dish, nothing happens?**
A: Check that:
- You selected a restaurant from the dropdown
- All required fields (name, price) are filled
- You clicked "Add Dish" button
- Check browser console for errors

**Q: Where do my posts appear?**
A: Posts appear in:
- Your own activity feed (Posts tab)
- Your followers' feeds
- Restaurant's public feed

**Q: Can I delete posts?**
A: Currently, posts are read-only. They document your restaurant's activity history.

**Q: How do followers see my posts?**
A: When customers follow your restaurant, they'll see all your posts in their personalized feed.

---

## Best Practices

### Menu Management
✅ **DO:**
- Add high-quality descriptions
- Use clear pricing
- Mark dietary restrictions
- Keep menu organized by category
- Update frequently with specials

❌ **DON'T:**
- Leave descriptions blank
- Use inconsistent pricing
- Forget about dietary needs
- Add duplicate dishes
- Ignore menu feedback

### Activity
✅ **DO:**
- Check your activity feed regularly
- Monitor when posts are created
- Respond to customer engagement
- Share special announcements
- Keep followers informed

❌ **DON'T:**
- Ignore your feed
- Make updates without tracking
- Spam followers with too many posts
- Delete important posts
- Hide activity from customers

---

## Screenshots Guide

### Menu Tab - Empty State
```
┌─ Menu Tab ─────────────────────────┐
│ Select Restaurant: [Dropdown ▼]   │
│                           [+Add Dish]
│                                    │
│ No dishes in this menu yet.        │
│ Add your first dish!               │
└────────────────────────────────────┘
```

### Menu Tab - With Dishes
```
┌─ Menu Tab ─────────────────────────────────┐
│ Select: [Test Rest ▼]        [+Add Dish]   │
│                                            │
│ ┌─────────────────────────────────────────┐│
│ │ Pasta Carbonara                 [Delete]││
│ │ Classic Italian pasta with bacon...     ││
│ │ $12.99 • Pasta • 🌶️ Spicy            ││
│ └─────────────────────────────────────────┘│
│                                            │
│ ┌─────────────────────────────────────────┐│
│ │ Margherita Pizza                [Delete]││
│ │ Tomato, mozzarella, basil...          ││
│ │ $14.99 • Pizza • 🌱 Vegetarian       ││
│ └─────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

### Posts Tab
```
┌─ Posts Tab ─────────────────────────────────┐
│ Select: [Test Rest ▼]                       │
│                                             │
│ ┌──────────────────────────────────────────┐│
│ │ 📝 Menu Updated: Pasta Carbonara         ││
│ │ [📝 Menu Update] [✅ Published]          ││
│ │                                          ││
│ │ Updated: price                           ││
│ │ by Test Owner • 1/22/2026                ││
│ └──────────────────────────────────────────┘│
│                                             │
│ ┌──────────────────────────────────────────┐│
│ │ 🆕 New Dish Added: Pasta Carbonara       ││
│ │ [📝 Menu Update] [✅ Published]          ││
│ │                                          ││
│ │ Added Pasta Carbonara to menu at $12.99  ││
│ │ by Test Owner • 1/22/2026                ││
│ └──────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in the app
3. Check browser console (F12) for errors
4. Contact administrator if problem persists

---

## Summary

The Owner Dashboard lets you:
- ✅ Manage your single restaurant
- ✅ Build and edit your menu
- ✅ Track all activity and posts
- ✅ Stay connected with followers
- ✅ Build your restaurant brand

Get started by going to the **Menu** tab and adding your first dish! 🍽️
