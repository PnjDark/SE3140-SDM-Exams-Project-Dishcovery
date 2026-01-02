const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
require('dotenv').config();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dishcovery',
  port: process.env.DB_PORT || 3306
});

const promisePool = pool.promise();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'customer', location, bio } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email, password, and name'
      });
    }

    // Check if user exists
    const [existingUsers] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await promisePool.execute(
      `INSERT INTO users (email, password_hash, name, role, location, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, name, role, location || null, bio || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        name, 
        role,
        location,
        bio
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get created user
    const [newUser] = await promisePool.execute(
      'SELECT id, email, name, role, location, bio, avatar_url, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: newUser[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user
    const [users] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    await promisePool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// GET CURRENT USER PROFILE (Protected)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await promisePool.execute(
      `SELECT id, email, name, role, location, bio, avatar_url, 
              preferences, is_verified, created_at, last_login
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// UPDATE USER PROFILE (Protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, location, bio, avatar_url, preferences } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (location !== undefined) {
      updates.push('location = ?');
      values.push(location);
    }
    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatar_url);
    }
    if (preferences !== undefined) {
      updates.push('preferences = ?');
      values.push(JSON.stringify(preferences));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(userId);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await promisePool.execute(query, values);

    // Get updated user
    const [updatedUser] = await promisePool.execute(
      `SELECT id, email, name, role, location, bio, avatar_url, 
              preferences, is_verified, created_at, last_login
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// CHANGE PASSWORD (Protected)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    // Get current password hash
    const [users] = await promisePool.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await promisePool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

module.exports = { router, authenticateToken };