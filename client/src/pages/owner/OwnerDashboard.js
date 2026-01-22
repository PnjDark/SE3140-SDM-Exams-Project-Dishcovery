import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user, token: contextToken, isOwner } = useAuth();
  const navigate = useNavigate();
  
  // Use context token or fallback to localStorage
  const token = contextToken || localStorage.getItem('token');
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    location: '',
    description: '',
    price_range: 3,
    contact_phone: '',
    contact_email: ''
  });

  const fetchOwnerRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/owner/restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      // Handle token expiration
      if (response.status === 403 && data.error && data.error.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (data.success) {
        setRestaurants(data.data);
      } else {
        console.error('Failed to fetch restaurants:', data.error);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isOwner) {
      fetchOwnerRestaurants();
    }
  }, [token, isOwner]);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    
    // Check if token exists
    if (!token) {
      alert('❌ Error: You are not authenticated. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      return;
    }

    setCreateLoading(true);
    
    try {
      const response = await fetch('/api/owner/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      // Handle token expiration
      if (response.status === 403 && data.error && data.error.includes('token')) {
        alert('❌ Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (data.success) {
        alert('✅ Restaurant created successfully! It\'s awaiting admin approval.');
        setFormData({
          name: '',
          cuisine: '',
          location: '',
          description: '',
          price_range: 3,
          contact_phone: '',
          contact_email: ''
        });
        setShowCreateForm(false);
        setActiveTab('restaurants');
        fetchOwnerRestaurants();
      } else {
        // Handle validation errors
        if (data.details && data.details.fields) {
          const errorMessages = Object.entries(data.details.fields)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          alert('❌ Validation Errors:\n' + errorMessages);
        } else {
          alert('❌ Error: ' + (data.error || 'Failed to create restaurant'));
        }
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert('❌ Network Error: ' + error.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOwner) {
    return (
      <div className="not-owner">
        <h2>Access Denied</h2>
        <p>This dashboard is for restaurant owners only.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Restaurant Owner Dashboard</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>{restaurants.length}</h3>
            <p>Restaurants</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>
              {restaurants.reduce((total, r) => total + (r.dish_count || 0), 0)}
            </h3>
            <p>Total Dishes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>
              {restaurants.reduce((total, r) => total + (r.review_count || 0), 0)}
            </h3>
            <p>Total Reviews</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>
              {restaurants.length > 0 
                ? (restaurants.reduce((sum, r) => sum + (parseFloat(r.avg_rating) || 0), 0) / restaurants.length).toFixed(1)
                : '0.0'
              }
            </h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurants
        </button>
        <button 
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h3>Your Restaurants</h3>
            {restaurants.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any restaurants yet.</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowCreateForm(!showCreateForm);
                    setActiveTab('restaurants');
                  }}
                >
                  Add Your First Restaurant
                </button>
              </div>
            ) : (
              <div className="restaurants-list">
                {restaurants.map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card">
                    <h4>{restaurant.name}</h4>
                    <div className="restaurant-details">
                      <span className="detail">📍 {restaurant.location}</span>
                      <span className="detail">🍽️ {restaurant.cuisine}</span>
                      <span className="detail">⭐ {restaurant.avg_rating || 'N/A'}</span>
                      <span className={`detail status-${restaurant.status}`}>
                        {restaurant.status === 'approved' ? '✅ Approved' : 
                         restaurant.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </div>
                    <div className="restaurant-stats">
                      <span>{restaurant.dish_count || 0} dishes</span>
                      <span>{restaurant.review_count || 0} reviews</span>
                    </div>
                    <div className="restaurant-actions">
                      <button className="btn-small">Manage</button>
                      <button className="btn-small outline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="restaurants-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Manage Restaurants</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'Cancel' : '+ Add Restaurant'}
              </button>
            </div>

            {showCreateForm && (
              <div className="create-restaurant-form" style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                border: '1px solid #ddd'
              }}>
                <h4>Create New Restaurant</h4>
                <form onSubmit={handleCreateRestaurant}>
                  <div className="form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter restaurant name (3-100 characters)"
                      required
                      minLength="3"
                      maxLength="100"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cuisine Type *</label>
                      <input
                        type="text"
                        name="cuisine"
                        value={formData.cuisine}
                        onChange={handleInputChange}
                        placeholder="e.g., Italian, Mexican"
                        required
                        minLength="2"
                        maxLength="50"
                      />
                    </div>

                    <div className="form-group">
                      <label>Location *</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., Downtown District"
                        required
                        minLength="2"
                        maxLength="100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell customers about your restaurant"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price Range (1-5)</label>
                      <select
                        name="price_range"
                        value={formData.price_range}
                        onChange={handleInputChange}
                      >
                        <option value="1">$ - Budget Friendly</option>
                        <option value="2">$$ - Moderate</option>
                        <option value="3">$$$ - Standard</option>
                        <option value="4">$$$$ - Premium</option>
                        <option value="5">$$$$$ - Luxury</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        placeholder="+1-555-0000"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      placeholder="owner@restaurant.com"
                    />
                  </div>

                  <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={createLoading}
                    >
                      {createLoading ? 'Creating...' : 'Create Restaurant'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {restaurants.length === 0 ? (
              <p>No restaurants yet. Click "Add Restaurant" to create one.</p>
            ) : (
              <div className="restaurants-list">
                {restaurants.map(restaurant => (
                  <div key={restaurant.id} className="restaurant-card">
                    <h4>{restaurant.name}</h4>
                    <div className="restaurant-details">
                      <span className="detail">📍 {restaurant.location}</span>
                      <span className="detail">🍽️ {restaurant.cuisine}</span>
                      <span className="detail">⭐ {restaurant.avg_rating || 'N/A'}</span>
                      <span className={`detail status-${restaurant.status}`}>
                        {restaurant.status === 'approved' ? '✅ Approved' : 
                         restaurant.status === 'pending' ? '⏳ Pending' : '❌ Rejected'}
                      </span>
                    </div>
                    <div className="restaurant-stats">
                      <span>{restaurant.dish_count || 0} dishes</span>
                      <span>{restaurant.review_count || 0} reviews</span>
                    </div>
                    <div className="restaurant-actions">
                      <button className="btn-small">Manage</button>
                      <button className="btn-small outline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="menu-tab">
            <h3>Menu Management</h3>
            <p>Menu editor coming soon!</p>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-tab">
            <h3>Posts & Updates</h3>
            <p>Post management coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;