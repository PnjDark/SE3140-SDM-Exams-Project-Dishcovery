# 🎯 Personalized Feed Feature - Complete Documentation

Complete guide to the personalized restaurant feed feature with smart prioritization.

---

## 📋 Overview

The personalized feed provides authenticated users with a curated list of restaurants organized by three priority levels:

1. **👥 Followed Restaurants** (Priority 1)
   - Restaurants the user explicitly follows
   - Newest followed restaurants appear first
   - Exclusive for authenticated users

2. **💡 Recommended Restaurants** (Priority 2)
   - Based on user's past reviews
   - Similar cuisines to restaurants user rated 4+ stars
   - Machine learning-ready for future expansion

3. **🔥 Trending Restaurants** (Priority 3)
   - Top-rated restaurants from last 30 days
   - High recent review activity
   - Community favorites

---

## 🗄️ Database Schema

### restaurant_follows Table
```sql
CREATE TABLE restaurant_follows (
    user_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, restaurant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

**Purpose**: Tracks which restaurants each user is following

**Queries**:
- Get all restaurants followed by a user
- Check if user follows a restaurant
- Get all followers of a restaurant

### Related Tables
- `restaurants` - Core restaurant data
- `reviews` - User reviews and ratings
- `users` - User profiles
- `posts` - Restaurant updates (future expansion)

---

## 🔌 Backend API Endpoints

### 1. Get Personalized Feed
**Endpoint**: `GET /api/restaurants/feed/personalized`

**Query Parameters**:
```
userId (required) - User ID to fetch feed for
```

**Response**:
```json
{
  "success": true,
  "count": 110,
  "data": [
    {
      "id": 5,
      "name": "La Dolce Vita",
      "cuisine": "Italian",
      "location": "Downtown",
      "rating": 4.8,
      "review_count": 24,
      "source": "followed",
      "description": "Authentic Italian restaurant..."
    },
    {
      "id": 12,
      "name": "Taco Fiesta",
      "cuisine": "Mexican",
      "location": "Midtown",
      "rating": 4.6,
      "review_count": 18,
      "source": "recommended",
      "description": "Best tacos in town..."
    },
    {
      "id": 8,
      "name": "The Burger Joint",
      "cuisine": "American",
      "location": "Main St",
      "rating": 4.7,
      "review_count": 32,
      "source": "trending",
      "description": "Classic burgers done right..."
    }
  ],
  "stats": {
    "followed": 3,
    "recommended": 45,
    "trending": 62
  }
}
```

**Algorithm**:
```
1. Followed Restaurants:
   - SELECT from restaurants WHERE status = 'approved'
   - JOIN with restaurant_follows for logged-in user
   - ORDER BY follow_date DESC
   - LIMIT 50

2. Recommended Restaurants:
   - SELECT from restaurants WHERE status = 'approved'
   - WHERE cuisine IN (cuisines user has reviewed with 4+ stars)
   - EXCLUDE already-followed restaurants
   - ORDER BY rating DESC, review_count DESC
   - LIMIT 30

3. Trending Restaurants:
   - SELECT from restaurants WHERE status = 'approved'
   - WITH reviews created in last 30 days
   - EXCLUDE already-followed restaurants
   - HAVING at least 1 recent review
   - ORDER BY rating DESC, review_count DESC
   - LIMIT 30

4. Combine results → Followed + Recommended + Trending
```

---

### 2. Follow a Restaurant
**Endpoint**: `POST /api/restaurants/:id/follow`

**Request Body**:
```json
{
  "userId": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Now following this restaurant"
}
```

**Status Codes**:
- `201` - Successfully followed
- `400` - Missing userId
- `404` - Restaurant not found
- `409` - Already following this restaurant
- `500` - Server error

---

### 3. Unfollow a Restaurant
**Endpoint**: `DELETE /api/restaurants/:id/follow`

**Request Body**:
```json
{
  "userId": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Unfollowed restaurant"
}
```

**Status Codes**:
- `200` - Successfully unfollowed
- `400` - Missing userId
- `404` - Not following this restaurant
- `500` - Server error

---

### 4. Check Follow Status
**Endpoint**: `GET /api/restaurants/:id/is-following`

**Query Parameters**:
```
userId (required) - User ID to check
```

**Response**:
```json
{
  "success": true,
  "isFollowing": true
}
```

---

## 🎨 Frontend Components

### Home Page Feed Integration

**File**: `client/src/pages/Home.js`

**Features**:
- Displays personalized feed only for authenticated users
- Shows feed statistics (followed, recommended, trending counts)
- Individual follow/unfollow buttons per restaurant
- Responsive card layout
- Source badge on each restaurant card

**State Management**:
```javascript
const [personalizedFeed, setPersonalizedFeed] = useState([]);
const [feedStats, setFeedStats] = useState({ 
  followed: 0, 
  recommended: 0, 
  trending: 0 
});
const [followedRestaurants, setFollowedRestaurants] = useState(new Set());
```

**Key Functions**:
```javascript
// Fetch personalized feed
const fetchPersonalizedFeed = async () => {
  // Fetches from /api/restaurants/feed/personalized?userId={user.id}
  // Updates state with feed data and followed restaurants set
}

// Toggle follow status
const handleFollowToggle = async (restaurantId, isCurrentlyFollowing) => {
  // POST to follow or DELETE to unfollow
  // Refreshes feed after change
}
```

---

## 🎨 Styling

### Feed CSS Classes

**File**: `client/src/pages/Home.css`

**Key Classes**:
```css
.personalized-feed               /* Main feed container */
.feed-stats                      /* Statistics display */
.feed-container                  /* Grid layout for cards */
.feed-card                       /* Individual restaurant card */
.feed-card.source-followed       /* Purple styling for followed */
.feed-card.source-recommended    /* Orange styling for recommended */
.feed-card.source-trending       /* Red styling for trending */
.feed-source-badge               /* Source label on card */
.feed-footer                     /* Buttons section */
.follow-btn                      /* Follow/Unfollow button */
.feed-link                       /* View details link */
```

**Responsive Design**:
- Desktop: 3-column grid (320px min-width cards)
- Tablet: 2-column grid
- Mobile: 1-column grid with full-width buttons

**Visual Hierarchy**:
- Followed: Purple/Blue accent with gradient background
- Recommended: Orange accent with gradient background
- Trending: Red accent with gradient background

---

## 📱 User Experience Flow

### Viewing Personalized Feed

1. **User logs in**
   - Home page loads
   - If authenticated, personalized feed section appears

2. **Feed loads with data**
   - Shows statistics (# followed, # recommended, # trending)
   - Displays up to 110 restaurants (50 followed + 30 recommended + 30 trending)
   - Each card shows source badge (👥, 💡, or 🔥)

3. **User interacts with feed**
   - **View Details**: Click card to go to restaurant page
   - **Follow**: Click "+ Follow" button to follow restaurant
   - **Unfollow**: Click "✓ Following" button to unfollow

4. **Feed updates**
   - After follow/unfollow, feed refreshes
   - Statistics update
   - Cards reorganize by priority

### Follow/Unfollow Flow

**Following a Restaurant**:
```
1. User clicks "+ Follow" button
2. POST to /api/restaurants/:id/follow with userId
3. Database adds entry to restaurant_follows table
4. Frontend button changes to "✓ Following"
5. Feed refreshes (restaurant moves to "followed" category)
```

**Unfollowing a Restaurant**:
```
1. User clicks "✓ Following" button
2. DELETE to /api/restaurants/:id/follow with userId
3. Database removes entry from restaurant_follows table
4. Frontend button changes to "+ Follow"
5. Feed refreshes (restaurant moves to "recommended/trending" or disappears)
```

---

## 🔄 Data Flow Diagram

```
User Login
    ↓
[useEffect] isAuthenticated = true
    ↓
fetchPersonalizedFeed() called
    ↓
GET /api/restaurants/feed/personalized?userId=X
    ↓
Backend:
  - Query followed restaurants (user_id = X)
  - Query recommended restaurants (based on cuisine preferences)
  - Query trending restaurants (last 30 days)
  - Combine: followed + recommended + trending
    ↓
Response with 110 restaurants sorted by priority
    ↓
Frontend renders feed:
  - Groups by source badge
  - Shows follow/unfollow buttons
  - Displays statistics
    ↓
User clicks follow/unfollow
    ↓
POST/DELETE /api/restaurants/:id/follow
    ↓
handleFollowToggle():
  - Updates local state (followedRestaurants Set)
  - Refreshes feed
    ↓
Feed updates with new data
```

---

## 💡 Algorithm Details

### Recommendation Algorithm

**How Recommended Restaurants are Selected**:

```sql
1. Get user's cuisine preferences
   - Find all restaurants user has reviewed
   - Filter reviews with rating >= 4 stars
   - Extract cuisines from these restaurants
   
2. Find similar restaurants
   - SELECT restaurants matching these cuisines
   - WHERE status = 'approved'
   - EXCLUDE already-followed restaurants
   - EXCLUDE restaurants user has already reviewed
   
3. Rank by relevance
   - ORDER BY average_rating DESC
   - ORDER BY review_count DESC
   
4. Return top 30
```

**Example**:
- User reviews: "Italian (5⭐)", "Italian (4⭐)", "Mexican (4⭐)"
- Preferred cuisines: Italian, Mexican
- Recommendations: Other Italian and Mexican restaurants sorted by rating

### Trending Algorithm

**How Trending Restaurants are Selected**:

```sql
1. Get recent activity
   - Find all restaurants with reviews in last 30 days
   - Count review frequency
   - Calculate average rating from recent reviews
   
2. Filter quality restaurants
   - WHERE rating >= 3.5 (quality threshold)
   - HAVING review_count > 0 (has recent activity)
   
3. Rank by momentum
   - ORDER BY recent_rating DESC
   - ORDER BY recent_review_count DESC
   
4. Return top 30
```

**Example**:
- Restaurant A: 2 reviews last 30 days, 4.9 avg rating → Trending!
- Restaurant B: 15 reviews last 30 days, 4.8 avg rating → Trending!
- Restaurant C: 0 reviews in 30 days → Not trending

---

## 🔒 Security & Access Control

### Authentication
- ✅ Requires valid JWT token
- ✅ Token must be in `Authorization: Bearer {token}` header
- ✅ User ID extracted from decoded token

### Authorization
- ✅ Users can only follow approved restaurants
- ✅ Cannot follow same restaurant twice (database constraint)
- ✅ Cannot see other users' follow data directly

### Data Validation
- ✅ userId validation
- ✅ restaurantId validation
- ✅ Restaurant status check (must be 'approved')
- ✅ Duplicate follow prevention

---

## 📊 Performance Optimization

### Database Indexes
```sql
-- Recommend adding these indexes for performance
CREATE INDEX idx_restaurant_follows_user ON restaurant_follows(user_id);
CREATE INDEX idx_restaurant_follows_restaurant ON restaurant_follows(restaurant_id);
CREATE INDEX idx_reviews_restaurant_rating ON reviews(restaurant_id, rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_restaurants_status_rating ON restaurants(status, rating);
```

### Query Optimization
- **Limit Results**: Each category limited to 50, 30, 30
- **JOIN Efficiency**: Uses indexed foreign keys
- **Group By**: Minimizes duplicate results
- **HAVING Clause**: Filters after aggregation for efficiency

### Frontend Optimization
- **Set Data Structure**: O(1) lookup for followed restaurants
- **Memoization**: useCallback prevents unnecessary re-renders
- **Lazy Loading**: Can add pagination for more results

---

## 🧪 Testing

### API Testing Examples

**Get Personalized Feed**:
```bash
curl "http://localhost:5000/api/restaurants/feed/personalized?userId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Follow a Restaurant**:
```bash
curl -X POST http://localhost:5000/api/restaurants/5/follow \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Unfollow a Restaurant**:
```bash
curl -X DELETE http://localhost:5000/api/restaurants/5/follow \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

**Check Follow Status**:
```bash
curl "http://localhost:5000/api/restaurants/5/is-following?userId=1"
```

---

## 🚀 Future Enhancements

### Phase 2: Advanced Recommendations
- [ ] Collaborative filtering (users with similar tastes)
- [ ] Content-based filtering (dish preferences)
- [ ] Machine learning model for ranking
- [ ] A/B testing recommendation algorithms

### Phase 3: Social Features
- [ ] Follow other users
- [ ] See recommendations from followed users
- [ ] Social activity feed
- [ ] Shared restaurant collections

### Phase 4: Analytics
- [ ] Track follow/unfollow patterns
- [ ] Measure recommendation accuracy
- [ ] User engagement analytics
- [ ] Restaurant popularity trends

### Phase 5: Real-time Updates
- [ ] WebSocket notifications for new posts
- [ ] Real-time feed updates
- [ ] New reviews from followed restaurants
- [ ] Special offers and promotions

---

## 📚 Related Files

- [server/routes/restaurants.js](server/routes/restaurants.js) - Backend endpoints
- [client/src/pages/Home.js](client/src/pages/Home.js) - Frontend component
- [client/src/pages/Home.css](client/src/pages/Home.css) - Styling
- [database/schema.sql](database/schema.sql) - Database schema

---

## 💬 User Stories

### Story 1: Following Restaurants
**As a** food enthusiast  
**I want to** follow my favorite restaurants  
**So that** I can see their latest updates in one place

**Acceptance Criteria**:
- ✅ Can click follow button on any approved restaurant
- ✅ Button changes to "✓ Following" after clicking
- ✅ Can unfollow by clicking the button again
- ✅ Followed restaurants appear at top of feed

### Story 2: Personalized Recommendations
**As a** restaurant explorer  
**I want to** see restaurants similar to ones I've rated highly  
**So that** I can discover new favorite places

**Acceptance Criteria**:
- ✅ Recommendations based on cuisine preferences
- ✅ Only high-rated restaurants (4+ stars) affect recommendations
- ✅ Can see why a restaurant is recommended (similar cuisine)
- ✅ Can follow recommended restaurants

### Story 3: Trending Restaurants
**As a** community member  
**I want to** know which restaurants are popular right now  
**So that** I can try new places getting buzz

**Acceptance Criteria**:
- ✅ See restaurants with recent positive reviews
- ✅ Trending section shows current hot spots
- ✅ Trending updates as new reviews come in
- ✅ Limited to last 30 days of reviews

---

## 📈 Usage Metrics

### Key Performance Indicators
- **Follow Rate**: % of users who follow at least 1 restaurant
- **Average Follows per User**: Mean restaurants followed per user
- **Feed Engagement**: % of users clicking feed restaurants
- **Recommendation Accuracy**: % of recommended restaurants that users interact with

### Monitoring
```
- Track API response times
- Monitor database query performance
- Count follow/unfollow operations
- Measure feed load times
```

---

**Last Updated**: January 22, 2026  
**Status**: ✅ Complete and Tested  
**Version**: 1.0
