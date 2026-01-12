const express = require('express');
const router = express.Router();

// Import db directly in this file
const mysql = require('mysql2');
require('dotenv').config();

const db = require('../db'); // Use centralized connection


const promisePool = pool.promise();

// GET all restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await promisePool.execute('SELECT * FROM restaurants');
    
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

// GET single restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
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
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant'
    });
  }
});

// GET dishes for a restaurant
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
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes'
    });
  }
});

// GET home page statistics (SIMPLIFIED VERSION)
router.get('/stats/home', async (req, res) => {
  try {
    // Get total restaurants count
    const [restaurantCount] = await promisePool.execute('SELECT COUNT(*) as total FROM restaurants');
    
    // Get total reviews count
    const [reviewCount] = await promisePool.execute('SELECT COUNT(*) as total FROM reviews');
    
    // Get average rating
    const [avgRating] = await promisePool.execute('SELECT AVG(rating) as avg_rating FROM reviews');
    
    // Get top 3 restaurants (simplified - just get highest rated)
    const [topRestaurants] = await promisePool.execute(`
      SELECT * FROM restaurants 
      ORDER BY rating DESC 
      LIMIT 3
    `);
    
    // Get unique cuisines
    const [cuisines] = await promisePool.execute(`
      SELECT DISTINCT cuisine 
      FROM restaurants 
      WHERE cuisine IS NOT NULL AND cuisine != ''
      LIMIT 4
    `);
    
    res.json({
      success: true,
      data: {
        totalRestaurants: restaurantCount[0].total || 0,
        totalReviews: reviewCount[0].total || 0,
        averageRating: avgRating[0].avg_rating ? parseFloat(avgRating[0].avg_rating).toFixed(1) : 0,
        topRestaurants: topRestaurants.map(r => ({
          ...r,
          rating: r.rating ? parseFloat(r.rating).toFixed(1) : 0
        })),
        featuredCuisines: cuisines.map(c => c.cuisine).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Error fetching home stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch home statistics'
    });
  }
});

// POST add a review
router.post('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, comment, rating } = req.body;
    
    // Validate
    if (!user_name || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Please provide user_name and rating'
      });
    }
    
    // Check if restaurant exists
    const [restaurant] = await promisePool.execute(
      'SELECT id FROM restaurants WHERE id = ?',
      [id]
    );
    
    if (restaurant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
    
    // Insert review
    const [result] = await promisePool.execute(
      'INSERT INTO reviews (restaurant_id, user_name, comment, rating) VALUES (?, ?, ?, ?)',
      [id, user_name, comment, rating]
    );
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add review'
    });
  }
});

module.exports = router;