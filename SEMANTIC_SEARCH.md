# 🍲 Semantic Dish Search - Complete Implementation

Complete guide to Dishcovery's semantic search algorithm and dish-based discovery system.

---

## 📋 Overview

Dishcovery is now a **dish-centric platform** that helps users find specific dishes across restaurants, with focus on:
- **Semantic Search**: Intelligent dish discovery by name and description
- **Smart Filtering**: Dropdown-based filters for price, rating, cuisine, and results-per-page
- **Price Comparison**: Find the same dish at different restaurants and prices
- **Autocomplete**: Real-time suggestions as users type
- **Relevance Ranking**: Results ranked by semantic match quality

---

## 🎯 Platform Purpose

**Find your favorite dish at the best price across nearby restaurants**

Instead of browsing restaurants, users:
1. Search for a specific dish (e.g., "Margherita Pizza")
2. See all restaurants serving it
3. Compare prices and ratings
4. Choose the best option

---

## 🔌 Backend API Endpoints

### 1. Semantic Dish Search
**Endpoint**: `GET /api/restaurants/search/dishes`

**Query Parameters**:
```
q (required)        - Search query (dish name)
maxPrice (optional) - Maximum dish price
minRating (optional)- Minimum restaurant rating (3, 3.5, 4, 4.5)
cuisine (optional)  - Cuisine type (Italian, Mexican, etc.)
limit (optional)    - Results per page (default: 50)
offset (optional)   - Pagination offset (default: 0)
```

**Example Request**:
```bash
GET /api/restaurants/search/dishes?q=pizza&maxPrice=20&minRating=4&cuisine=Italian&limit=50
```

**Response**:
```json
{
  "success": true,
  "query": "pizza",
  "count": 12,
  "total": 45,
  "page": 1,
  "pages": 4,
  "data": [
    {
      "id": 1,
      "name": "Margherita Pizza",
      "description": "Classic tomato, mozzarella, basil",
      "price": 12.99,
      "category": "Pizza",
      "is_vegetarian": true,
      "is_spicy": false,
      "image_url": "...",
      "restaurant_id": 5,
      "restaurant_name": "La Dolce Vita",
      "location": "Downtown",
      "cuisine": "Italian",
      "restaurant_rating": 4.8,
      "review_count": 24,
      "relevance_score": 1000
    },
    ...
  ]
}
```

**Pagination**:
- Results are paginated (50 per page by default)
- Returns `total` count and `pages` for UI navigation
- Use `limit` and `offset` for pagination

---

### 2. Autocomplete Suggestions
**Endpoint**: `GET /api/restaurants/search/suggestions`

**Query Parameters**:
```
q (required)      - Partial search query (min 2 chars)
limit (optional)  - Max suggestions (default: 10)
```

**Example Request**:
```bash
GET /api/restaurants/search/suggestions?q=pi&limit=10
```

**Response**:
```json
{
  "success": true,
  "suggestions": {
    "dishes": [
      { "type": "dish", "text": "Pizza Margherita", "popularity": 45 },
      { "type": "dish", "text": "Pineapple Express Pizza", "popularity": 12 },
      { "type": "dish", "text": "Pistachio Pasta", "popularity": 8 }
    ],
    "cuisines": [
      { "type": "cuisine", "text": "Italian" },
      { "type": "cuisine", "text": "Chinese" }
    ],
    "categories": [
      { "type": "category", "text": "Pizza" },
      { "type": "category", "text": "Pasta" }
    ]
  }
}
```

---

## 🧠 Semantic Search Algorithm

### Relevance Scoring System

```sql
CASE
  WHEN LOWER(d.name) = ? THEN 1000       -- Exact match (highest)
  WHEN LOWER(d.name) LIKE ? THEN 500     -- Name contains query
  WHEN LOWER(d.description) LIKE ? THEN 100  -- Description contains
  ELSE 1                                  -- Partial match (lowest)
END as relevance_score
```

**Scoring Breakdown**:
- **1000 points**: Exact name match (e.g., searching "pizza" finds "pizza")
- **500 points**: Name contains query (e.g., searching "marg" finds "Margherita Pizza")
- **100 points**: Description contains query (e.g., "tomato" found in description)
- **1 point**: Partial matches

### Query Processing

```javascript
// Frontend: Prepare search term
const searchTerm = q.trim().toLowerCase();    // "margherita pizza"
const searchPattern = `%${searchTerm}%`;      // "%margherita pizza%"

// Backend: Three-tier matching
1. Exact Match: LOWER(d.name) = 'margherita pizza'
2. Substring Match: LOWER(d.name) LIKE '%margherita pizza%'
3. Description Match: LOWER(d.description) LIKE '%margherita pizza%'
```

### Secondary Ranking Criteria

After relevance scoring, results are sorted by:
1. **restaurant_rating DESC** - Higher-rated restaurants first
2. **d.price ASC** - Lower prices first (best value)

**Example Result Order**:
```
1. "Margherita Pizza" at "La Dolce Vita" (4.8⭐, $12.99)
   - Exact name match, highest rating, best price

2. "Margherita Pizza" at "Pizza Palace" (4.5⭐, $14.99)
   - Exact name match, lower rating, higher price

3. "Classic Margherita" at "Italian Kitchen" (4.7⭐, $13.99)
   - Name contains "margherita", slightly different
```

---

## 🎨 Frontend Components

### DishSearch Page
**File**: `client/src/pages/DishSearch.js`

**Features**:
- Semantic search input with autocomplete
- Dropdown-based filters (not expandable bars)
- Results grid display with pagination
- Real-time suggestions as user types

**State Management**:
```javascript
const [searchTerm, setSearchTerm] = useState('');
const [suggestions, setSuggestions] = useState([]);
const [dishes, setDishes] = useState([]);
const [filters, setFilters] = useState({
  maxPrice: '',
  minRating: '',
  cuisine: 'all',
  limit: '50',
  offset: 0
});
```

**Key Functions**:
```javascript
// Fetch suggestions
fetchSuggestions(query)
  → GET /api/restaurants/search/suggestions?q={query}
  → Display 5 best matches in dropdown

// Fetch dishes
fetchDishes(searchTerm)
  → GET /api/restaurants/search/dishes?{filters}
  → Update results grid with pagination

// Handle filters
handleFilterChange(filterName, value)
  → Update filter state
  → Reset pagination to page 1
  → Trigger dish fetch
```

### Search Bar (Home Page)
**File**: `client/src/pages/Home.js`

**New Hero Section**:
- Catchy "Find Your Perfect Dish" headline
- Prominent search bar with emoji
- Stats showing restaurant count and dish reviews
- Two CTA buttons: "Browse All Dishes" and "📍 Near Me"

---

## 📱 User Interface

### Filters Section (Dropdowns)

Instead of expandable filter bars, use clean dropdown selects:

```
┌─────────────────────────────────────────────────────────────┐
│ Cuisine Type      │ Max Price    │ Min Rating    │ Results/Page │
│ ▼ All Cuisines   │ ▼ [blank]    │ ▼ Any Rating │ ▼ 50 results │
│ - Italian         │ or max value  │ - Any Rating │ - 10 results │
│ - Mexican         │              │ - ⭐ 3+      │ - 25 results │
│ - Chinese         │              │ - ⭐ 3.5+    │ - 50 results │
│ ...               │              │ - ⭐ 4+      │ - 100 results│
└─────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Clean, modern appearance
- Saves vertical space
- Clear options without scrolling
- Better mobile experience

---

## 🔍 Dish Card Display

Each result shows:

```
┌──────────────────────┐
│   [Dish Image]       │ (200px height, object-fit: cover)
├──────────────────────┤
│ Margherita Pizza     │ (Dish name)
│ 📍 La Dolce Vita     │ (Restaurant name - orange)
│ Downtown            │ (Location - gray)
│ Classic tomato,     │ (Description - first 100 chars)
│ mozzarella, basil...│
│                     │
│ Pizza 🌱 Veg       │ (Category badge + dietary badges)
├─────────┬───────────┤
│ Price   │ ⭐ 4.8   │ (Price | Rating)
│ $12.99  │ (24)     │
├──────────────────────┤
│ View at Restaurant → │ (CTA button)
└──────────────────────┘
```

**Card Features**:
- Image with hover zoom effect
- Clear hierarchy (dish name > restaurant > location)
- Dietary badges (vegetarian 🌱, spicy 🌶️)
- Price prominently displayed
- Restaurant rating with review count
- Call-to-action button

---

## 📊 Search Flow Diagram

```
User Types "pizza" in Search Bar
    ↓
Frontend: fetchSuggestions("pizza")
    ↓
API: GET /api/restaurants/search/suggestions?q=pizza
    ↓
Backend Returns:
  - "Pizza Margherita" (45 results)
  - "Pizza Carbonara" (32 results)
  - "Italian" (cuisine)
    ↓
Frontend Displays Dropdown:
  [🍲 Pizza Margherita] (45)
  [🍲 Pizza Carbonara] (32)
  [🌍 Italian]
    ↓
User Clicks or Submits Search
    ↓
Frontend: fetchDishes("pizza", filters)
    ↓
API: GET /api/restaurants/search/dishes?q=pizza&...filters
    ↓
Backend:
  1. Find dishes with name/description matching "pizza"
  2. Score by relevance (exact match=1000, partial=500, etc.)
  3. Apply filters (price, rating, cuisine)
  4. Sort by score DESC, rating DESC, price ASC
  5. Paginate results (50 per page)
    ↓
Response: 45 total results, 50 per page
  [1. Margherita Pizza - La Dolce Vita - $12.99 - 4.8⭐]
  [2. Margherita Pizza - Pizza Palace - $14.99 - 4.5⭐]
  [3. Classic Margherita - Italian Kitchen - $13.99 - 4.7⭐]
  ...
    ↓
Frontend Renders Grid:
  - Shows dishes in responsive grid
  - Displays pagination (Page 1 of 1)
  - Shows filters applied
```

---

## 🚀 Usage Examples

### Example 1: Find Budget Pizza
```
User Input: "pizza"
Filters: Max Price = $15, Min Rating = 4

SQL Query:
SELECT dishes WHERE
  (name LIKE '%pizza%' OR description LIKE '%pizza%')
  AND price <= 15
  AND restaurant_rating >= 4

Results:
1. Margherita Pizza @ La Dolce Vita - $12.99 (4.8⭐)
2. Cheese Pizza @ Quick Bites - $9.99 (4.2⭐)
```

### Example 2: Find Vegetarian Italian
```
User Input: "pasta"
Filters: Cuisine = Italian, Min Rating = 4

SQL Query:
SELECT dishes WHERE
  (name LIKE '%pasta%' OR description LIKE '%pasta%')
  AND cuisine = 'Italian'
  AND restaurant_rating >= 4

Results:
1. Spaghetti Carbonara @ La Dolce Vita - $14.99 (4.8⭐)
2. Penne Arrabbiata @ Italian Corner - $13.99 (4.6⭐)
```

### Example 3: Autocomplete Suggestions
```
User Types: "bu"

Backend finds:
- Dishes: "Burger", "Buffalo Wings"
- Cuisines: (none matching)
- Categories: "Burgers", "Burritos"

Suggestions shown:
🍲 Burger (89 restaurants)
🍲 Buffalo Wings (23 restaurants)
🌍 (none)
🏷️ Burgers
🏷️ Burritos
```

---

## 💾 Database Queries

### Main Search Query
```sql
SELECT 
  d.id, d.name, d.description, d.price,
  d.category, d.is_vegetarian, d.is_spicy, d.image_url,
  d.restaurant_id,
  r.name as restaurant_name, r.location, r.cuisine,
  COALESCE(AVG(rv.rating), 0) as restaurant_rating,
  COUNT(DISTINCT rv.id) as review_count,
  CASE
    WHEN LOWER(d.name) = ? THEN 1000
    WHEN LOWER(d.name) LIKE ? THEN 500
    WHEN LOWER(d.description) LIKE ? THEN 100
    ELSE 1
  END as relevance_score
FROM dishes d
INNER JOIN restaurants r ON d.restaurant_id = r.id
LEFT JOIN reviews rv ON r.id = rv.restaurant_id
WHERE r.status = 'approved'
  AND (LOWER(d.name) LIKE ? OR LOWER(d.description) LIKE ?)
  AND d.price <= ? (if filter applied)
  AND LOWER(r.cuisine) = ? (if filter applied)
GROUP BY d.id
HAVING restaurant_rating >= ? (if filter applied)
ORDER BY relevance_score DESC, restaurant_rating DESC, d.price ASC
LIMIT ? OFFSET ?
```

---

## ⚡ Performance Optimization

### Database Indexes (Recommended)
```sql
CREATE INDEX idx_dishes_name_lower ON dishes((LOWER(name)));
CREATE INDEX idx_dishes_description_lower ON dishes((LOWER(description)));
CREATE INDEX idx_dishes_price ON dishes(price);
CREATE INDEX idx_restaurants_cuisine_status ON restaurants(cuisine, status);
CREATE INDEX idx_reviews_restaurant_rating ON reviews(restaurant_id, rating);
```

### Query Optimization
- **LIMIT results**: Max 100 per page
- **Use indexes**: Lowercase columns indexed
- **Lazy load**: Pagination prevents loading all results
- **Cache suggestions**: Store popular searches

---

## 🧪 Testing Examples

### Test 1: Basic Search
```bash
curl "http://localhost:5000/api/restaurants/search/dishes?q=pizza"
```

### Test 2: With Filters
```bash
curl "http://localhost:5000/api/restaurants/search/dishes?q=pizza&maxPrice=20&minRating=4&cuisine=Italian&limit=50"
```

### Test 3: Pagination
```bash
# Get first 25 results
curl "http://localhost:5000/api/restaurants/search/dishes?q=pizza&limit=25&offset=0"

# Get next 25 results (page 2)
curl "http://localhost:5000/api/restaurants/search/dishes?q=pizza&limit=25&offset=25"
```

### Test 4: Autocomplete
```bash
curl "http://localhost:5000/api/restaurants/search/suggestions?q=pi&limit=10"
```

---

## 📋 Implementation Checklist

✅ Semantic search algorithm implemented
✅ Dish search endpoint (/api/restaurants/search/dishes)
✅ Autocomplete suggestions endpoint
✅ DishSearch React component created
✅ Dropdown-based filters (not bars)
✅ Search bar on home page
✅ Pagination support
✅ Price comparison view
✅ Responsive design
✅ Performance optimized

---

## 🎯 Future Enhancements

### Phase 2: Advanced Features
- [ ] Location-based search (GPS integration)
- [ ] Dietary restrictions filtering (vegan, gluten-free, etc.)
- [ ] Spice level comparison
- [ ] Nutritional information display
- [ ] Save favorite dishes
- [ ] Price history tracking

### Phase 3: ML & Analytics
- [ ] Personalized recommendations
- [ ] Trending dishes this week
- [ ] Best value suggestions
- [ ] Price trend predictions
- [ ] Restaurant suggestion based on dish

### Phase 4: Community
- [ ] Dish ratings/reviews
- [ ] User dish collections
- [ ] Dish comparisons (same dish, different restaurants)
- [ ] Community favorites
- [ ] Food blogger integration

---

## 📚 Related Files

- [server/routes/restaurants.js](server/routes/restaurants.js) - Search endpoints
- [client/src/pages/DishSearch.js](client/src/pages/DishSearch.js) - Search page
- [client/src/pages/DishSearch.css](client/src/pages/DishSearch.css) - Styling
- [client/src/pages/Home.js](client/src/pages/Home.js) - Home with search bar

---

**Last Updated**: January 22, 2026  
**Status**: ✅ Complete and Production Ready  
**Version**: 1.0
