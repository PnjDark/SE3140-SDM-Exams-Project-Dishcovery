const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();
const { authenticateToken } = require('./auth');

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dishcovery',
  port: process.env.DB_PORT || 3306
});

const promisePool = pool.promise();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Administrators only.'
    });
  }
  next();
};

// ============ ADMIN DASHBOARD ============

// GET admin dashboard stats
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Total users
    const [[usersStats]] = await promisePool.execute(
      'SELECT COUNT(*) as total_users, SUM(CASE WHEN role = "customer" THEN 1 ELSE 0 END) as customers, SUM(CASE WHEN role = "owner" THEN 1 ELSE 0 END) as owners FROM users'
    );

    // Total restaurants
    const [[restaurantsStats]] = await promisePool.execute(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected FROM restaurants'
    );

    // Total reviews
    const [[reviewsStats]] = await promisePool.execute(
      'SELECT COUNT(*) as total_reviews, AVG(rating) as avg_rating FROM reviews'
    );

    // Recent activity
    const [recentUsers] = await promisePool.execute(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const [pendingRestaurants] = await promisePool.execute(
      'SELECT id, name, cuisine, location, owner_id, status, created_at FROM restaurants WHERE status = "pending" LIMIT 5'
    );

    res.json({
      success: true,
      data: {
        users: usersStats || { total_users: 0, customers: 0, owners: 0 },
        restaurants: restaurantsStats || { total: 0, approved: 0, pending: 0, rejected: 0 },
        reviews: reviewsStats || { total_reviews: 0, avg_rating: 0 },
        recent_users: recentUsers,
        pending_restaurants: pendingRestaurants
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
});

// ============ USER MANAGEMENT ============

// GET all users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await promisePool.execute(
      `SELECT id, name, email, role, is_verified, created_at, last_login 
       FROM users ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// GET single user details
router.get('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await promisePool.execute(
      `SELECT id, name, email, role, avatar_url, bio, location, is_verified, created_at, last_login 
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's restaurants if owner
    let restaurants = [];
    if (users[0].role === 'owner') {
      const [ownerRestaurants] = await promisePool.execute(
        'SELECT id, name, status FROM restaurants WHERE owner_id = ?',
        [id]
      );
      restaurants = ownerRestaurants;
    }

    res.json({
      success: true,
      data: {
        user: users[0],
        restaurants
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

// UPDATE user role
router.put('/users/:id/role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    if (!['customer', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be customer, owner, or admin'
      });
    }

    const [result] = await promisePool.execute(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
});

// DEACTIVATE user
router.put('/users/:id/deactivate', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to deactivate themselves
    if (id == req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot deactivate your own account'
      });
    }

    const [result] = await promisePool.execute(
      'UPDATE users SET is_verified = false WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User account deactivated'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    });
  }
});

// DELETE user (hard delete - use with caution)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id == req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const [result] = await promisePool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

// ============ RESTAURANT MODERATION ============

// GET all restaurants (with status filter)
router.get('/restaurants', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.id, r.name, r.cuisine, r.location, r.status, r.owner_id, r.created_at,
             u.name as owner_name, COUNT(DISTINCT d.id) as dish_count,
             COUNT(DISTINCT rev.id) as review_count, AVG(rev.rating) as avg_rating
      FROM restaurants r
      LEFT JOIN users u ON r.owner_id = u.id
      LEFT JOIN dishes d ON r.id = d.restaurant_id
      LEFT JOIN reviews rev ON r.id = rev.restaurant_id
    `;

    const params = [];

    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }

    query += ' GROUP BY r.id ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [restaurants] = await promisePool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM restaurants';
    const countParams = [];
    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    const [[countResult]] = await promisePool.execute(countQuery, countParams);

    res.json({
      success: true,
      count: restaurants.length,
      total: countResult.total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: restaurants
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants'
    });
  }
});

// UPDATE restaurant status (approve/reject)
router.put('/restaurants/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    const [result] = await promisePool.execute(
      'UPDATE restaurants SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: `Restaurant status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating restaurant status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant status'
    });
  }
});

// DELETE restaurant
router.delete('/restaurants/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.execute(
      'DELETE FROM restaurants WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      message: 'Restaurant deleted'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete restaurant'
    });
  }
});

// ============ REVIEW MODERATION ============

// GET all reviews (for moderation)
router.get('/reviews', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reviews] = await promisePool.execute(
      `SELECT rev.id, rev.restaurant_id, rev.user_id, rev.comment, rev.rating, rev.created_at,
              r.name as restaurant_name, u.name as user_name
       FROM reviews rev
       LEFT JOIN restaurants r ON rev.restaurant_id = r.id
       LEFT JOIN users u ON rev.user_id = u.id
       ORDER BY rev.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );

    const [[countResult]] = await promisePool.execute(
      'SELECT COUNT(*) as total FROM reviews'
    );

    res.json({
      success: true,
      count: reviews.length,
      total: countResult.total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews'
    });
  }
});

// DELETE review (moderation)
router.delete('/reviews/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await promisePool.execute(
      'DELETE FROM reviews WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review removed'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

module.exports = router;
