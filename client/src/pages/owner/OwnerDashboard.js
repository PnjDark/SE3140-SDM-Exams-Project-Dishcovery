import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const { user, token, isOwner } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchOwnerRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/owner/restaurants', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setRestaurants(data.data);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && isOwner) {
      fetchOwnerRestaurants();
    }
  }, [token, isOwner]);

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
                <button className="btn-primary">
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
            <h3>Manage Restaurants</h3>
            <p>Restaurant management features coming soon!</p>
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