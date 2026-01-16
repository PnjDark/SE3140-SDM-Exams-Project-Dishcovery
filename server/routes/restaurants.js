const express = require('express');
const router = express.Router();

const db= require('../db'); // central connection
const promisePool = db.promise();

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.execute(
      'SELECT * FROM restaurants'
    );

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

// GET single restaurant
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
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

// GET dishes
router.get('/:id/dishes', async (req, res) => {
  try {
    const { id } = req.params;

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

// HOME STATS
router.get('/stats/home', async (req, res) => {
  try {

    const [[restaurants]] = await promisePool.execute(
      'SELECT COUNT(*) total FROM restaurants'
    );

    const [[reviews]] = await promisePool.execute(
      'SELECT COUNT(*) total FROM reviews'
    );

    const [[rating]] = await promisePool.execute(
      'SELECT AVG(rating) avg FROM reviews'
    );

    const [top] = await promisePool.execute(
      'SELECT * FROM restaurants ORDER BY rating DESC LIMIT 3'
    );

    res.json({
      success: true,
      data: {
        totalRestaurants: restaurants.total,
        totalReviews: reviews.total,
        averageRating: rating.avg
          ? rating.avg.toFixed(1)
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

// ADD REVIEW
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
