const express = require('express');
const cors = require('cors');
const path = require('path');
const restaurantRoutes = require('./routes/restaurants');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const ownerRoutes = require('./routes/owner');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/owner', authenticateToken, ownerRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/upload', uploadRoutes);

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
      health: '/api/health',
      auth: '/api/auth',
      owner: '/api/owner',
      admin: '/api/admin',
      upload: '/api/upload'
    }
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`🍽️  Restaurants: http://localhost:${port}/api/restaurants`);
  console.log(`👨‍🍳 Owner routes: http://localhost:${port}/api/owner`);
  console.log(`🔐 Auth routes: http://localhost:${port}/api/auth`);
});