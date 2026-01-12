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
app.use('/api/owner', ownerRoutes); // Owner routes protected by authenticateToken middleware
app.use('/api/auth', authRoutes); // Auth routes
app.use('/api/restaurants', restaurantRoutes); // Restaurant routes
app.use('/api/owner', ownerRoutes); // Owner routes

// Protected Test Route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: req.user
  });
});

app.get('/api/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public route'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.get('/api/restaurants', (req, res) => {
  res.json({
    success: true,
    message: 'List of restaurants would be here'
  });
});

app.get('/api/owner/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `Welcome to the owner dashboard, ${req.user.name}`
  });
});

app.get('/api/owner/restaurants', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `List of your restaurants, ${req.user.name}`
  });
});

app.get('/api/owner/dishes', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `List of your dishes, ${req.user.name}`
  });
});

app.get('/api/owner/orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `List of your orders, ${req.user.name}`
  });
});

app.get('/api/owner/reports', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `Your reports, ${req.user.name}`
  });
});

app.get('/api/owner/settings', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `Your settings, ${req.user.name}`
  });
});

app.get('/api/owner/profile', authenticateToken, (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  res.json({
    success: true,
    message: `Your profile, ${req.user.name}`
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
      health: '/api/health',
      // Authentication: '/api/auth',
      owner: '/api/owner'
    }
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