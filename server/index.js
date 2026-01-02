const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurants');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const ownerRoutes = require('./routes/owner'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/owner', authenticateToken, ownerRoutes);

// Protected Test Route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: 'Dishcovery API',
    time: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Dishcovery API 🚀',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      health: '/api/health'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🍽️  Restaurants: http://localhost:${port}/api/restaurants`);
  console.log(`👨‍🍳 Owner routes: http://localhost:${port}/api/owner`);
});