const express = require('express');
const router = express.Router();
require('dotenv').config();
const { authenticateToken } = require('./auth');
const { 
  isValidRestaurantName, 
  isValidCuisine, 
  isValidLocation,
  isValidPriceRange
} = require('../utils/validation');
const { 
  multiFieldValidationError,
  forbiddenError,
  notFoundError
} = require('../utils/errorHandler');

// Database connection
const promisePool = require('../db');

// Middleware to check if user is owner
const isOwner = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Restaurant owners only.'
    });
  }
  next();
};

// ============ RESTAURANT MANAGEMENT ============

// GET owner's restaurants
router.get('/restaurants', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [restaurants] = await promisePool.execute(`
      SELECT r.*, 
             ro.role as owner_role,
             COUNT(DISTINCT d.id) as dish_count,
             COUNT(DISTINCT rev.id) as review_count,
             AVG(rev.rating) as avg_rating
      FROM restaurants r
      INNER JOIN restaurant_owners ro ON r.id = ro.restaurant_id
      LEFT JOIN dishes d ON r.id = d.restaurant_id
      LEFT JOIN reviews rev ON r.id = rev.restaurant_id
      WHERE ro.user_id = ?
      GROUP BY r.id, ro.role
      ORDER BY r.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants.map(r => ({
        ...r,
        avg_rating: r.avg_rating ? parseFloat(r.avg_rating).toFixed(1) : null
      }))
    });
  } catch (error) {
    console.error('Error fetching owner restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants'
    });
  }
});

// CREATE new restaurant
router.post('/restaurants', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, cuisine, location, description,
      price_range, contact_phone, contact_email,
      website, opening_hours, social_links, image_url
    } = req.body;
    
    // Comprehensive validation
    const errors = {};
    
    // Validate required fields
    if (!name || !name.trim()) {
      errors.name = 'Restaurant name is required';
    } else if (!isValidRestaurantName(name)) {
      errors.name = 'Restaurant name must be 3-100 characters';
    }
    
    if (!cuisine || !cuisine.trim()) {
      errors.cuisine = 'Cuisine type is required';
    } else if (!isValidCuisine(cuisine)) {
      errors.cuisine = 'Cuisine must be 2-50 characters';
    }
    
    if (!location || !location.trim()) {
      errors.location = 'Location is required';
    } else if (!isValidLocation(location)) {
      errors.location = 'Location must be 2-100 characters';
    }
    
    // Validate optional fields
    if (price_range !== undefined && !isValidPriceRange(price_range)) {
      errors.price_range = 'Price range must be 1-5';
    }
    
    if (contact_phone && contact_phone.trim().length > 20) {
      errors.contact_phone = 'Phone number must be 20 characters or less';
    }
    
    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      errors.contact_email = 'Invalid email format';
    }
    
    if (website && website.trim().length > 200) {
      errors.website = 'Website URL must be 200 characters or less';
    }
    
    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(multiFieldValidationError(errors));
    }
    
    // Create restaurant
    const [result] = await promisePool.execute(
      `INSERT INTO restaurants (
        name, cuisine, location, description, price_range,
        owner_id, contact_phone, contact_email, website,
        opening_hours, social_links, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        cuisine.trim(),
        location.trim(),
        description ? description.trim() : null,
        price_range || 3,
        userId,
        contact_phone ? contact_phone.trim() : null,
        contact_email ? contact_email.trim() : null,
        website ? website.trim() : null,
        opening_hours ? JSON.stringify(opening_hours) : null,
        social_links ? JSON.stringify(social_links) : null,
        image_url || null,
        'pending'
      ]
    );
    
    // Get created restaurant
    const [newRestaurant] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [result.insertId]
    );
    
    // Add owner to restaurant_owners table
    await promisePool.execute(
      'INSERT INTO restaurant_owners (user_id, restaurant_id, role) VALUES (?, ?, ?)',
      [userId, result.insertId, 'owner']
    );
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully and awaiting admin approval',
      data: {
        id: newRestaurant[0].id,
        name: newRestaurant[0].name,
        cuisine: newRestaurant[0].cuisine,
        location: newRestaurant[0].location,
        status: newRestaurant[0].status,
        owner_id: newRestaurant[0].owner_id,
        created_at: newRestaurant[0].created_at
      }
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    console.error('Error details:', { code: error.code, message: error.message, sqlMessage: error.sqlMessage });
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage && error.sqlMessage.includes('user_id')) {
        return res.status(409).json({
          success: false,
          error: 'You already own a restaurant. Each owner can only own one restaurant.',
          timestamp: new Date().toISOString()
        });
      }
      return res.status(409).json({
        success: false,
        error: 'A restaurant with this name already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to create restaurant',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// UPDATE restaurant
router.put('/restaurants/:id', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    const updates = req.body;
    
    // Check if user owns this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to edit this restaurant'
      });
    }
    
    // Build update query
    const updateFields = [];
    const values = [];
    
    const allowedFields = [
      'name', 'cuisine', 'location', 'description', 'price_range',
      'contact_phone', 'contact_email', 'website', 'opening_hours',
      'social_links', 'is_active'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'opening_hours' || field === 'social_links') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    values.push(restaurantId);
    
    const query = `UPDATE restaurants SET ${updateFields.join(', ')} WHERE id = ?`;
    await promisePool.execute(query, values);
    
    // Auto-create post for restaurant update
    const updateType = updates.name || updates.cuisine || updates.location ? 'profile_update' : 'update';
    const postTitle = `Restaurant ${updateType === 'profile_update' ? 'Profile' : 'Menu'} Updated`;
    const postContent = `Updated: ${Object.keys(updates).join(', ')}`;
    
    try {
      await promisePool.execute(
        `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [restaurantId, userId, 'menu_update', postTitle, postContent, true]
      );
    } catch (postError) {
      console.warn('Failed to create post for restaurant update:', postError);
      // Don't fail the entire update if post creation fails
    }
    
    // Get updated restaurant
    const [updatedRestaurant] = await promisePool.execute(
      'SELECT * FROM restaurants WHERE id = ?',
      [restaurantId]
    );
    
    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant[0]
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant'
    });
  }
});

// DELETE restaurant (soft delete)
router.delete('/restaurants/:id', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    
    // Check if user owns this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ? AND role = ?',
      [userId, restaurantId, 'owner']
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this restaurant'
      });
    }
    
    // Soft delete (mark as inactive)
    await promisePool.execute(
      'UPDATE restaurants SET is_active = false WHERE id = ?',
      [restaurantId]
    );
    
    res.json({
      success: true,
      message: 'Restaurant deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete restaurant'
    });
  }
});

// ============ MENU MANAGEMENT ============

// GET all dishes for owner's restaurant
router.get('/restaurants/:id/dishes', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    
    // Check ownership
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const [dishes] = await promisePool.execute(
      'SELECT * FROM dishes WHERE restaurant_id = ? ORDER BY category, name',
      [restaurantId]
    );
    
    res.json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error('Error fetching dishes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dishes'
    });
  }
});

// CREATE new dish
router.post('/restaurants/:id/dishes', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    const {
      name, description, price, category,
      is_vegetarian, is_spicy, image_url,
      calories, preparation_time, tags
    } = req.body;
    
    // Check ownership
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name and price are required'
      });
    }
    
    const [result] = await promisePool.execute(
      `INSERT INTO dishes (
        restaurant_id, name, description, price, category,
        is_vegetarian, is_spicy, image_url, calories,
        preparation_time, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurantId, name, description || null, price,
        category || 'Main Course', is_vegetarian || false,
        is_spicy || false, image_url || null,
        calories || null, preparation_time || null,
        tags ? JSON.stringify(tags) : null
      ]
    );
    
    // Get created dish
    const [newDish] = await promisePool.execute(
      'SELECT * FROM dishes WHERE id = ?',
      [result.insertId]
    );
    
    // Auto-create post for new dish (menu update)
    try {
      await promisePool.execute(
        `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          restaurantId,
          userId,
          'menu_update',
          `🆕 New Dish Added: ${name}`,
          `Added ${name} to the menu at $${price}`,
          true
        ]
      );
    } catch (postError) {
      console.warn('Failed to create post for new dish:', postError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Dish created successfully',
      data: newDish[0]
    });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dish'
    });
  }
});

// UPDATE dish
router.put('/dishes/:id', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const dishId = req.params.id;
    const updates = req.body;
    
    // Get dish and check ownership through restaurant
    const [dishes] = await promisePool.execute(
      `SELECT d.*, d.restaurant_id FROM dishes d
       JOIN restaurant_owners ro ON d.restaurant_id = ro.restaurant_id
       WHERE d.id = ? AND ro.user_id = ?`,
      [dishId, userId]
    );
    
    if (dishes.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied or dish not found'
      });
    }
    
    const restaurantId = dishes[0].restaurant_id;
    const values = [];
    const updateFields = [];
    
    const allowedFields = [
      'name', 'description', 'price', 'category',
      'is_vegetarian', 'is_spicy', 'image_url',
      'calories', 'preparation_time', 'tags', 'is_available'
    ];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'tags') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    values.push(dishId);
    
    const query = `UPDATE dishes SET ${updateFields.join(', ')} WHERE id = ?`;
    await promisePool.execute(query, values);
    
    // Auto-create post for dish update (menu update)
    if (Object.keys(updates).length > 0) {
      try {
        await promisePool.execute(
          `INSERT INTO posts (restaurant_id, user_id, type, title, content, is_published)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            restaurantId,
            userId,
            'menu_update',
            `📝 Menu Updated: ${updates.name || dishes[0].name}`,
            `Updated: ${Object.keys(updates).join(', ')}`,
            true
          ]
        );
      } catch (postError) {
        console.warn('Failed to create post for dish update:', postError);
      }
    }
    
    // Get updated dish
    const [updatedDish] = await promisePool.execute(
      'SELECT * FROM dishes WHERE id = ?',
      [dishId]
    );
    
    res.json({
      success: true,
      message: 'Dish updated successfully',
      data: updatedDish[0]
    });
  } catch (error) {
    console.error('Error updating dish:', error);
    console.error('Error details:', { message: error.message, sqlMessage: error.sqlMessage });
    res.status(500).json({
      success: false,
      error: 'Failed to update dish',
      details: error.message
    });
  }
});

// DELETE dish
router.delete('/dishes/:id', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const dishId = req.params.id;
    
    // Check ownership
    const [dishes] = await promisePool.execute(
      `SELECT d.*, d.restaurant_id FROM dishes d
       JOIN restaurant_owners ro ON d.restaurant_id = ro.restaurant_id
       WHERE d.id = ? AND ro.user_id = ?`,
      [dishId, userId]
    );
    
    if (dishes.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied or dish not found'
      });
    }
    
    await promisePool.execute('DELETE FROM dishes WHERE id = ?', [dishId]);
    
    res.json({
      success: true,
      message: 'Dish deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dish'
    });
  }
});

// ============ POST MANAGEMENT ============

// GET all posts for owner's restaurants
router.get('/posts', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [posts] = await promisePool.execute(`
      SELECT p.*, r.name as restaurant_name
      FROM posts p
      JOIN restaurants r ON p.restaurant_id = r.id
      JOIN restaurant_owners ro ON r.id = ro.restaurant_id
      WHERE ro.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    
    // Get counts for each post
    for (let post of posts) {
      const [likes] = await promisePool.execute(
        'SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?',
        [post.id]
      );
      const [comments] = await promisePool.execute(
        'SELECT COUNT(*) as count FROM post_comments WHERE post_id = ?',
        [post.id]
      );
      
      post.likes_count = likes[0].count;
      post.comments_count = comments[0].count;
    }
    
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

// CREATE new post
router.post('/posts', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      restaurant_id, type, title, content, image_url, is_published
    } = req.body;
    
    // Check ownership
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurant_id]
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Validation
    if (!restaurant_id || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID, type, and content are required'
      });
    }
    
    const [result] = await promisePool.execute(
      `INSERT INTO posts (
        restaurant_id, user_id, type, title, content,
        image_url, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id, userId, type, title || null,
        content, image_url || null, is_published !== false
      ]
    );
    
    // Get created post
    const [newPost] = await promisePool.execute(
      'SELECT p.*, r.name as restaurant_name FROM posts p JOIN restaurants r ON p.restaurant_id = r.id WHERE p.id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost[0]
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// ============ ANALYTICS ============

// GET restaurant analytics
router.get('/analytics/:restaurantId', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.restaurantId;
    
    // Check ownership
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    
    if (ownership.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    // Get basic stats
    const [stats] = await promisePool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM dishes WHERE restaurant_id = ?) as dish_count,
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = ?) as review_count,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = ?) as avg_rating,
        (SELECT COUNT(*) FROM posts WHERE restaurant_id = ?) as post_count,
        (SELECT COUNT(*) FROM restaurant_follows WHERE restaurant_id = ?) as follower_count
    `, [restaurantId, restaurantId, restaurantId, restaurantId, restaurantId]);
    
    // Get recent reviews
    const [recentReviews] = await promisePool.execute(`
      SELECT * FROM reviews 
      WHERE restaurant_id = ? 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [restaurantId]);
    
    // Get popular dishes (by hypothetical order count - you'd need an orders table)
    const [popularDishes] = await promisePool.execute(`
      SELECT * FROM dishes 
      WHERE restaurant_id = ? AND is_available = true
      ORDER BY id DESC 
      LIMIT 5
    `, [restaurantId]);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        avg_rating: stats[0].avg_rating ? parseFloat(stats[0].avg_rating).toFixed(1) : null,
        recent_reviews: recentReviews,
        popular_dishes: popularDishes
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// ============ MULTIPLE OWNERS MANAGEMENT ============

// GET restaurant owners
router.get('/restaurants/:id/owners', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    
    // Check if user is an owner of this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [userId, restaurantId]
    );
    
    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to manage this restaurant'
      });
    }
    
    // Get all owners of this restaurant
    const [owners] = await promisePool.execute(`
      SELECT u.id, u.name, u.email, ro.role, ro.created_at
      FROM restaurant_owners ro
      JOIN users u ON ro.user_id = u.id
      WHERE ro.restaurant_id = ?
      ORDER BY ro.created_at ASC
    `, [restaurantId]);
    
    res.json({
      success: true,
      count: owners.length,
      data: owners
    });
  } catch (error) {
    console.error('Error fetching restaurant owners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant owners'
    });
  }
});

// ADD owner to restaurant
router.post('/restaurants/:id/owners', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    const { email, role = 'manager' } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Check if current user is an owner of this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ? AND role = ?',
      [userId, restaurantId, 'owner']
    );
    
    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        error: 'Only owners can add new owners to the restaurant'
      });
    }
    
    // Find user by email
    const [users] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ? AND role IN ("owner", "manager")',
      [email.trim()]
    );
    
    if (!users.length) {
      return res.status(404).json({
        success: false,
        error: 'User not found or does not have owner/manager role'
      });
    }
    
    const newOwnerId = users[0].id;
    
    // Check if user is already an owner
    const [existing] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [newOwnerId, restaurantId]
    );
    
    if (existing.length) {
      return res.status(409).json({
        success: false,
        error: 'This user is already an owner of this restaurant'
      });
    }
    
    // Add new owner
    await promisePool.execute(
      'INSERT INTO restaurant_owners (user_id, restaurant_id, role) VALUES (?, ?, ?)',
      [newOwnerId, restaurantId, role]
    );
    
    res.status(201).json({
      success: true,
      message: 'Owner added successfully'
    });
  } catch (error) {
    console.error('Error adding owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add owner'
    });
  }
});

// REMOVE owner from restaurant
router.delete('/restaurants/:id/owners/:ownerId', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    const ownerToRemoveId = req.params.ownerId;
    
    // Check if current user is an owner of this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ? AND role = ?',
      [userId, restaurantId, 'owner']
    );
    
    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        error: 'Only owners can remove owners from the restaurant'
      });
    }
    
    // Prevent removing the last owner
    const [allOwners] = await promisePool.execute(
      'SELECT COUNT(*) as count FROM restaurant_owners WHERE restaurant_id = ? AND role = "owner"',
      [restaurantId]
    );
    
    if (allOwners[0].count <= 1) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove the last owner. At least one owner is required.'
      });
    }
    
    // Remove owner
    const [result] = await promisePool.execute(
      'DELETE FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
      [ownerToRemoveId, restaurantId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found for this restaurant'
      });
    }
    
    res.json({
      success: true,
      message: 'Owner removed successfully'
    });
  } catch (error) {
    console.error('Error removing owner:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove owner'
    });
  }
});

// UPDATE owner role
router.patch('/restaurants/:id/owners/:ownerId', authenticateToken, isOwner, async (req, res) => {
  try {
    const userId = req.user.id;
    const restaurantId = req.params.id;
    const ownerToUpdateId = req.params.ownerId;
    const { role } = req.body;
    
    if (!role || !['owner', 'manager', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be owner, manager, or staff'
      });
    }
    
    // Check if current user is an owner of this restaurant
    const [ownership] = await promisePool.execute(
      'SELECT * FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ? AND role = ?',
      [userId, restaurantId, 'owner']
    );
    
    if (!ownership.length) {
      return res.status(403).json({
        success: false,
        error: 'Only owners can modify owner roles'
      });
    }
    
    // Prevent downgrading the last owner
    if (role !== 'owner') {
      const [ownerCount] = await promisePool.execute(
        'SELECT COUNT(*) as count FROM restaurant_owners WHERE restaurant_id = ? AND role = "owner"',
        [restaurantId]
      );
      
      const [isLastOwner] = await promisePool.execute(
        'SELECT role FROM restaurant_owners WHERE user_id = ? AND restaurant_id = ?',
        [ownerToUpdateId, restaurantId]
      );
      
      if (ownerCount[0].count <= 1 && isLastOwner[0]?.role === 'owner') {
        return res.status(400).json({
          success: false,
          error: 'Cannot downgrade the last owner. At least one owner is required.'
        });
      }
    }
    
    // Update role
    const [result] = await promisePool.execute(
      'UPDATE restaurant_owners SET role = ? WHERE user_id = ? AND restaurant_id = ?',
      [role, ownerToUpdateId, restaurantId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Owner not found for this restaurant'
      });
    }
    
    res.json({
      success: true,
      message: 'Owner role updated successfully'
    });
  } catch (error) {
    console.error('Error updating owner role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update owner role'
    });
  }
});

module.exports = router;