const express = require('express');
const router = express.Router();

const promisePool = require('../db'); // central connection

// GET all approved restaurants (customer view)
// Can pass ?includeAll=true for admin/owner views
router.get('/', async (req, res) => {
  try {
    const { includeAll = false } = req.query;
    
    let query = 'SELECT * FROM restaurants';
    const params = [];
    
    // Only show approved restaurants to customers by default
    if (includeAll !== 'true') {
      query += ' WHERE status = "approved"';
    }
    
    query += ' ORDER BY rating DESC';
    
    const [rows] = await promisePool.execute(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants'
    });
  }
});

// GET single restaurant (only if approved)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE id = ? AND status = "approved"',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Get all owners of this restaurant
    const [owners] = await promisePool.execute(`
      SELECT u.id, u.name, u.email, ro.role, ro.created_at
      FROM restaurant_owners ro
      JOIN users u ON ro.user_id = u.id
      WHERE ro.restaurant_id = ?
      ORDER BY ro.created_at ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        owners: owners
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant'
    });
  }
});

// GET dishes from approved restaurants
router.get('/:id/dishes', async (req, res) => {
  try {
    const { id } = req.params;

    // First verify restaurant is approved
    const [restaurant] = await promisePool.execute(
      'SELECT id FROM restaurants WHERE id = ? AND status = "approved"',
      [id]
    );

    if (restaurant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found or not approved'
      });
    }

    const [rows] = await promisePool.execute(
      'SELECT * FROM dishes WHERE restaurant_id = ?',
      [id]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes'
    });
  }
});

// HOME STATS (only for approved restaurants)
router.get('/stats/home', async (req, res) => {
  try {

    const [[restaurants]] = await promisePool.execute(
      'SELECT COUNT(*) total FROM restaurants WHERE status = "approved"'
    );

    const [[reviews]] = await promisePool.execute(
      'SELECT COUNT(*) total FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE rest.status = "approved"'
    );

    const [[rating]] = await promisePool.execute(
      'SELECT AVG(r.rating) avg FROM reviews r JOIN restaurants rest ON r.restaurant_id = rest.id WHERE rest.status = "approved"'
    );

    const [top] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE status = "approved" ORDER BY rating DESC LIMIT 3'
    );

    res.json({
      success: true,
      data: {
        totalRestaurants: restaurants.total,
        totalReviews: reviews.total,
        averageRating: rating.avg
          ? parseFloat(rating.avg).toFixed(1)
          : 0,
        topRestaurants: top
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// ADD REVIEW (only to approved restaurants)
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, comment, rating } = req.body;

    if (!user_name || !rating) {
      return res.status(400).json({
        success: false,
        error: 'user_name & rating required'
      });
    }

    // Verify restaurant exists and is approved
    const [restaurant] = await promisePool.execute(
      'SELECT id FROM restaurants WHERE id = ? AND status = "approved"',
      [id]
    );

    if (restaurant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found or not approved for reviews'
      });
    }

    await promisePool.execute(
      `INSERT INTO reviews 
      (restaurant_id, user_name, comment, rating)
      VALUES (?, ?, ?, ?)`,
      [id, user_name, comment, rating]
    );

    res.status(201).json({
      success: true,
      message: 'Review added'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add review'
    });
  }
});

// GET personalized feed (followed → recommended → trending)
router.get('/feed/personalized', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // 1. Get followed restaurants
    const [followedRestaurants] = await promisePool.execute(
      `SELECT r.*, 
        COALESCE(AVG(rv.rating), 0) as rating,
        COUNT(rv.id) as review_count,
        'followed' as source,
        rf.created_at as follow_date
      FROM restaurants r
      LEFT JOIN reviews rv ON r.id = rv.restaurant_id
      INNER JOIN restaurant_follows rf ON r.id = rf.restaurant_id
      WHERE r.status = 'approved' AND rf.user_id = ?
      GROUP BY r.id
      ORDER BY rf.created_at DESC
      LIMIT 50`,
      [userId]
    );

    // 2. Get recommended restaurants (based on similar cuisines user has reviewed)
    const [recommendedRestaurants] = await promisePool.execute(
      `SELECT DISTINCT r.*,
        COALESCE(AVG(rv.rating), 0) as rating,
        COUNT(rv.id) as review_count,
        'recommended' as source
      FROM restaurants r
      LEFT JOIN reviews rv ON r.id = rv.restaurant_id
      WHERE r.status = 'approved'
      AND r.cuisine IN (
        SELECT DISTINCT r2.cuisine
        FROM restaurants r2
        INNER JOIN reviews rv2 ON r2.id = rv2.restaurant_id
        WHERE rv2.user_id = ? AND rv2.rating >= 4
      )
      AND r.id NOT IN (
        SELECT restaurant_id FROM restaurant_follows WHERE user_id = ?
      )
      GROUP BY r.id
      ORDER BY rating DESC, review_count DESC
      LIMIT 30`,
      [userId, userId]
    );

    // 3. Get trending restaurants (top rated this month)
    const [trendingRestaurants] = await promisePool.execute(
      `SELECT r.*,
        COALESCE(AVG(rv.rating), 0) as rating,
        COUNT(rv.id) as review_count,
        'trending' as source
      FROM restaurants r
      LEFT JOIN reviews rv ON r.id = rv.restaurant_id
      WHERE r.status = 'approved'
      AND rv.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND r.id NOT IN (
        SELECT restaurant_id FROM restaurant_follows WHERE user_id = ?
      )
      GROUP BY r.id
      HAVING COUNT(rv.id) > 0
      ORDER BY rating DESC, review_count DESC
      LIMIT 30`,
      [userId]
    );

    // Combine with priority: followed → recommended → trending
    const feed = [
      ...followedRestaurants,
      ...recommendedRestaurants,
      ...trendingRestaurants
    ];

    res.json({
      success: true,
      count: feed.length,
      data: feed,
      stats: {
        followed: followedRestaurants.length,
        recommended: recommendedRestaurants.length,
        trending: trendingRestaurants.length
      }
    });

  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalized feed'
    });
  }
});

// POST: Follow a restaurant
router.post('/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Check if restaurant exists and is approved
    const [restaurant] = await promisePool.execute(
      'SELECT id FROM restaurants WHERE id = ? AND status = "approved"',
      [id]
    );

    if (!restaurant.length) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    // Check if already following
    const [existing] = await promisePool.execute(
      'SELECT * FROM restaurant_follows WHERE user_id = ? AND restaurant_id = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Already following this restaurant'
      });
    }

    // Add follow
    await promisePool.execute(
      'INSERT INTO restaurant_follows (user_id, restaurant_id) VALUES (?, ?)',
      [userId, id]
    );

    res.status(201).json({
      success: true,
      message: 'Now following this restaurant'
    });

  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow restaurant'
    });
  }
});

// DELETE: Unfollow a restaurant
router.delete('/:id/follow', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await promisePool.execute(
      'DELETE FROM restaurant_follows WHERE user_id = ? AND restaurant_id = ?',
      [userId, id]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not following this restaurant'
      });
    }

    res.json({
      success: true,
      message: 'Unfollowed restaurant'
    });

  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unfollow restaurant'
    });
  }
});

// GET: Check if user follows a restaurant
router.get('/:id/is-following', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const [following] = await promisePool.execute(
      'SELECT * FROM restaurant_follows WHERE user_id = ? AND restaurant_id = ?',
      [userId, id]
    );

    res.json({
      success: true,
      isFollowing: following.length > 0
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check follow status'
    });
  }
});

// SEMANTIC SEARCH: Find dishes by name/description
// Uses fuzzy matching and relevance scoring
router.get('/search/dishes', async (req, res) => {
  try {
    const { q, maxPrice, minRating, cuisine, limit = 50, offset = 0 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchTerm = q.trim().toLowerCase();
    const searchPattern = `%${searchTerm}%`;

    let query = `
      SELECT 
        d.id,
        d.name,
        d.description,
        d.price,
        d.category,
        d.is_vegetarian,
        d.is_spicy,
        d.image_url,
        d.restaurant_id,
        r.name as restaurant_name,
        r.location,
        r.cuisine,
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
    `;

    const params = [searchTerm, searchPattern, searchPattern, searchPattern, searchPattern];

    // Add price filter
    if (maxPrice) {
      query += ' AND d.price <= ?';
      params.push(maxPrice);
    }

    // Add cuisine filter
    if (cuisine && cuisine !== 'all') {
      query += ' AND LOWER(r.cuisine) = ?';
      params.push(cuisine.toLowerCase());
    }

    // Add rating filter
    if (minRating) {
      query += ' HAVING restaurant_rating >= ?';
      params.push(minRating);
    }

    query += `
      GROUP BY d.id
      ORDER BY relevance_score DESC, restaurant_rating DESC, d.price ASC
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [dishes] = await promisePool.execute(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT d.id) as total
      FROM dishes d
      INNER JOIN restaurants r ON d.restaurant_id = r.id
      WHERE r.status = 'approved'
      AND (LOWER(d.name) LIKE ? OR LOWER(d.description) LIKE ?)
    `;
    const countParams = [searchPattern, searchPattern];

    if (maxPrice) {
      countQuery += ' AND d.price <= ?';
      countParams.push(maxPrice);
    }

    if (cuisine && cuisine !== 'all') {
      countQuery += ' AND LOWER(r.cuisine) = ?';
      countParams.push(cuisine.toLowerCase());
    }

    const [countResult] = await promisePool.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      query: searchTerm,
      count: dishes.length,
      total,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit),
      data: dishes
    });

  } catch (error) {
    console.error('Dish search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search dishes'
    });
  }
});

// SEMANTIC SEARCH: Get autocomplete suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query must be at least 2 characters'
      });
    }

    const searchPattern = `${q.trim().toLowerCase()}%`;

    // Get dish name suggestions
    const [dishSuggestions] = await promisePool.execute(`
      SELECT DISTINCT d.name, COUNT(*) as popularity
      FROM dishes d
      INNER JOIN restaurants r ON d.restaurant_id = r.id
      WHERE r.status = 'approved'
      AND LOWER(d.name) LIKE ?
      GROUP BY d.name
      ORDER BY popularity DESC
      LIMIT ?
    `, [searchPattern, parseInt(limit)]);

    // Get cuisine suggestions
    const [cuisineSuggestions] = await promisePool.execute(`
      SELECT DISTINCT r.cuisine
      FROM restaurants r
      WHERE r.status = 'approved'
      AND LOWER(r.cuisine) LIKE ?
      LIMIT ?
    `, [searchPattern, Math.ceil(limit / 2)]);

    // Get category suggestions
    const [categorySuggestions] = await promisePool.execute(`
      SELECT DISTINCT d.category
      FROM dishes d
      INNER JOIN restaurants r ON d.restaurant_id = r.id
      WHERE r.status = 'approved'
      AND LOWER(d.category) LIKE ?
      LIMIT ?
    `, [searchPattern, Math.ceil(limit / 2)]);

    res.json({
      success: true,
      suggestions: {
        dishes: dishSuggestions.map(d => ({ type: 'dish', text: d.name, popularity: d.popularity })),
        cuisines: cuisineSuggestions.map(c => ({ type: 'cuisine', text: c.cuisine })),
        categories: categorySuggestions.map(cat => ({ type: 'category', text: cat.category }))
      }
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get suggestions'
    });
  }
});

// GET restaurant posts/updates/announcements
router.get('/:id/posts', async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const [posts] = await promisePool.execute(
      `SELECT p.*, u.name as author_name, u.avatar_url
       FROM posts p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.restaurant_id = ?
       ORDER BY p.created_at DESC`,
      [restaurantId]
    );

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
});

module.exports = router;
