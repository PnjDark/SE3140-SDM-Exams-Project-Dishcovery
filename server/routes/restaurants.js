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

    res.json({
      success: true,
      data: rows[0]
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

module.exports = router;
