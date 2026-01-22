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
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showAddDish, setShowAddDish] = useState(false);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    is_vegetarian: false,
    is_spicy: false
  });
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
        // Set active restaurant to first one if not already set
        if (data.data.length > 0 && !activeRestaurant) {
          setActiveRestaurant(data.data[0]);
        }
      } else {
        console.error('Failed to fetch restaurants:', data.error);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantDishes = async (restaurantId) => {
    try {
      setDishesLoading(true);
      const response = await fetch(`/api/owner/restaurants/${restaurantId}/dishes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDishes(data.data);
      } else {
        console.error('Failed to fetch dishes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setDishesLoading(false);
    }
  };

  const fetchRestaurantPosts = async (restaurantId) => {
    try {
      setPostsLoading(true);
      const response = await fetch(`/api/restaurants/${restaurantId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (token && isOwner) {
      fetchOwnerRestaurants();
    }
  }, [token, isOwner]);

  // Fetch dishes when menu tab is active and restaurant is selected
  useEffect(() => {
    if (activeTab === 'menu' && activeRestaurant) {
      fetchRestaurantDishes(activeRestaurant.id);
    }
  }, [activeTab, activeRestaurant]);

  // Fetch posts when posts tab is active and restaurant is selected
  useEffect(() => {
    if (activeTab === 'posts' && activeRestaurant) {
      fetchRestaurantPosts(activeRestaurant.id);
    }
  }, [activeTab, activeRestaurant]);

  const handleAddDish = async (e) => {
    e.preventDefault();
    
    if (!activeRestaurant) {
      alert('❌ Please select a restaurant first');
      return;
    }

    try {
      const response = await fetch(`/api/owner/restaurants/${activeRestaurant.id}/dishes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dishFormData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Dish added successfully!');
        setDishFormData({
          name: '',
          description: '',
          price: '',
          category: 'Main Course',
          is_vegetarian: false,
          is_spicy: false
        });
        setShowAddDish(false);
        fetchRestaurantDishes(activeRestaurant.id);
      } else {
        alert('❌ ' + (data.error || 'Failed to add dish'));
      }
    } catch (error) {
      console.error('Error adding dish:', error);
      alert('❌ Error adding dish');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) {
      return;
    }

    try {
      const response = await fetch(`/api/owner/dishes/${dishId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Dish deleted successfully!');
        fetchRestaurantDishes(activeRestaurant.id);
      } else {
        alert('❌ ' + (data.error || 'Failed to delete dish'));
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('❌ Error deleting dish');
    }
  };

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

  const handleDishInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDishFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
                disabled={restaurants.length > 0}
                title={restaurants.length > 0 ? "You already own a restaurant. Each owner can only own one." : ""}
                style={{ opacity: restaurants.length > 0 ? 0.5 : 1, cursor: restaurants.length > 0 ? 'not-allowed' : 'pointer' }}
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
            <div style={{ marginBottom: '20px' }}>
              <h3>Menu Management</h3>
              
              {restaurants.length === 0 ? (
                <div className="empty-state">
                  <p>You don't have any restaurants yet.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Restaurant:</label>
                      <select 
                        value={activeRestaurant?.id || ''} 
                        onChange={(e) => {
                          const selected = restaurants.find(r => r.id === parseInt(e.target.value));
                          setActiveRestaurant(selected);
                        }}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="">Choose a restaurant...</option>
                        {restaurants.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      className="btn-primary"
                      onClick={() => setShowAddDish(!showAddDish)}
                    >
                      {showAddDish ? 'Cancel' : '+ Add Dish'}
                    </button>
                  </div>

                  {showAddDish && (
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '20px', 
                      borderRadius: '8px', 
                      marginBottom: '20px',
                      border: '1px solid #ddd'
                    }}>
                      <h4>Add New Dish</h4>
                      <form onSubmit={handleAddDish}>
                        <div className="form-group">
                          <label>Dish Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={dishFormData.name}
                            onChange={handleDishInputChange}
                            placeholder="e.g., Pasta Carbonara"
                            required
                            minLength="3"
                            maxLength="100"
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Price *</label>
                            <input
                              type="number"
                              name="price"
                              value={dishFormData.price}
                              onChange={handleDishInputChange}
                              placeholder="e.g., 12.99"
                              required
                              step="0.01"
                              min="0"
                            />
                          </div>

                          <div className="form-group">
                            <label>Category</label>
                            <select 
                              name="category" 
                              value={dishFormData.category}
                              onChange={handleDishInputChange}
                            >
                              <option>Main Course</option>
                              <option>Appetizer</option>
                              <option>Dessert</option>
                              <option>Drink</option>
                              <option>Soup</option>
                              <option>Salad</option>
                              <option>Pasta</option>
                              <option>Pizza</option>
                              <option>Sushi</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            name="description"
                            value={dishFormData.description}
                            onChange={handleDishInputChange}
                            placeholder="Describe your dish"
                            maxLength="500"
                            rows="3"
                          />
                        </div>

                        <div className="form-row" style={{ display: 'flex', gap: '20px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              name="is_vegetarian"
                              checked={dishFormData.is_vegetarian}
                              onChange={handleDishInputChange}
                              style={{ marginRight: '8px' }}
                            />
                            Vegetarian
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              name="is_spicy"
                              checked={dishFormData.is_spicy}
                              onChange={handleDishInputChange}
                              style={{ marginRight: '8px' }}
                            />
                            Spicy
                          </label>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                          <button type="submit" className="btn-primary">
                            Add Dish
                          </button>
                          <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => setShowAddDish(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {dishesLoading ? (
                    <p>Loading dishes...</p>
                  ) : dishes.length === 0 ? (
                    <div className="empty-state">
                      <p>No dishes in this menu yet. Add your first dish!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {dishes.map(dish => (
                        <div key={dish.id} style={{
                          backgroundColor: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '15px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'start'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 8px 0' }}>{dish.name}</h4>
                            <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '14px' }}>
                              {dish.description}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#999' }}>
                              <span>${parseFloat(dish.price).toFixed(2)}</span>
                              <span>•</span>
                              <span>{dish.category}</span>
                              {dish.is_vegetarian && <span>• 🌱 Vegetarian</span>}
                              {dish.is_spicy && <span>• 🌶️ Spicy</span>}
                            </div>
                          </div>
                          <button 
                            className="btn-small"
                            onClick={() => handleDeleteDish(dish.id)}
                            style={{ backgroundColor: '#ff4444', color: '#fff', marginLeft: '10px' }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-tab">
            <h3>Posts & Updates</h3>
            
            {restaurants.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any restaurants yet.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Select Restaurant:</label>
                  <select 
                    value={activeRestaurant?.id || ''} 
                    onChange={(e) => {
                      const selected = restaurants.find(r => r.id === parseInt(e.target.value));
                      setActiveRestaurant(selected);
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  >
                    <option value="">Choose a restaurant...</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {postsLoading ? (
                  <p>Loading posts...</p>
                ) : posts.length === 0 ? (
                  <div className="empty-state">
                    <p>No posts yet. Your automatic posts from menu updates will appear here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {posts.map(post => (
                      <div key={post.id} style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '15px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0' }}>{post.title}</h4>
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: '#f0f0f0',
                              color: '#666',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              marginRight: '10px'
                            }}>
                              {post.type === 'menu_update' && '📝 Menu Update'}
                              {post.type === 'announcement' && '📢 Announcement'}
                              {post.type === 'event' && '🎉 Event'}
                              {post.type === 'promotion' && '🎁 Promotion'}
                            </span>
                            <span style={{
                              display: 'inline-block',
                              backgroundColor: post.is_published ? '#e8f5e9' : '#fff3e0',
                              color: post.is_published ? '#2e7d32' : '#f57f17',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              {post.is_published ? '✅ Published' : '🔒 Draft'}
                            </span>
                          </div>
                          <span style={{ color: '#999', fontSize: '12px' }}>
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: '#333', margin: '10px 0', lineHeight: '1.5' }}>
                          {post.content}
                        </p>
                        <div style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
                          {post.author_name && <span>by {post.author_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;