const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Database connection
const promisePool = require('../db');

// Validation utilities
const {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidRole,
  isValidBio,
  isValidLocation
} = require('../utils/validation');

const {
  validationError,
  multiFieldValidationError,
  conflictError,
  authError,
  serverError
} = require('../utils/errorHandler');

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

    // Comprehensive validation
    const errors = [];

    if (!email || !isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!password || !isValidPassword(password)) {
      errors.push({ 
        field: 'password', 
        message: 'Password must be at least 6 characters' 
      });
    }

    if (!name || !isValidName(name)) {
      errors.push({ 
        field: 'name', 
        message: 'Name must be 2-100 characters' 
      });
    }

    if (!isValidRole(role)) {
      errors.push({ 
        field: 'role', 
        message: 'Invalid role' 
      });
    }

    if (location && !isValidLocation(location)) {
      errors.push({ 
        field: 'location', 
        message: 'Location must be 2-100 characters' 
      });
    }

    if (bio && !isValidBio(bio)) {
      errors.push({ 
        field: 'bio', 
        message: 'Bio must be less than 500 characters' 
      });
    }

    if (errors.length > 0) {
      const response = multiFieldValidationError(errors);
      return res.status(response.statusCode).json(response);
    }

    // Check if user exists
    const [existingUsers] = await promisePool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      const response = conflictError('User already exists with this email');
      return res.status(response.statusCode).json(response);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await promisePool.execute(
      `INSERT INTO users (email, password_hash, name, role, location, bio) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email.toLowerCase(), hashedPassword, name.trim(), role, location || null, bio || null]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        email: email.toLowerCase(), 
        name: name.trim(), 
        role,
        location: location || null,
        bio: bio || null
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
    const response = serverError('Registration failed', error);
    res.status(response.statusCode).json(response);
  }
});

// LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    const errors = [];

    if (!email || !isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }

    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
      const response = multiFieldValidationError(errors);
      return res.status(response.statusCode).json(response);
    }

    // Find user
    const [users] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      const response = authError('Invalid credentials');
      return res.status(response.statusCode).json(response);
    }

    const user = users[0];

    // Check password
    const isValidPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isValidPasswordMatch) {
      const response = authError('Invalid credentials');
      return res.status(response.statusCode).json(response);
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
    const response = serverError('Login failed', error);
    res.status(response.statusCode).json(response);
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