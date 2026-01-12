import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalRecipes: 0,
    favoriteCount: 0,
    recentActivity: []
  });
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container dashboard">
      <header className="dashboard-header">
        <h1>{user?.name}'s Dashboard</h1>
        <p>Welcome to Dishcovery</p>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">⭐</div>
            <h3>Your Reviews</h3>
            <p>View and manage your restaurant reviews</p>
            <Link to="/reviews" className="card-link">View Reviews →</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">❤️</div>
            <h3>Favorite Restaurants</h3>
            <p>See restaurants you've followed and liked</p>
            <Link to="/favorites" className="card-link">View Favorites →</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Recent Activity</h3>
            <p>Check your recent interactions and updates</p>
            <Link to="/activity" className="card-link">View Activity →</Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Account Settings</h3>
            <p>Update your profile and preferences</p>
            <Link to="/profile" className="card-link">Go to Profile →</Link>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recommended For You</h2>
          <p>Based on your preferences and history</p>
          <div className="recommendations">
            <p>Recommendations coming soon! Explore restaurants to get personalized suggestions.</p>
            <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <section className="dashboard-stats">
          <h2>Recent Activity</h2>
          <div className="activity-list">
  {stats?.recentActivity?.length > 0 ? (
    stats.recentActivity.map((activity, index) => (
      <div key={index} className="activity-item">
        <span className="activity-time">{activity.time}</span>
        <span className="activity-description">{activity.description}</span>
      </div>
    ))
  ) : (
    <p className="no-activity">No recent activity</p>
  )}
</div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn btn-primary">+ Add New Dish</button>
            <button className="action-btn btn-primary">Browse Recipes</button>
            <button className="action-btn btn-primary">My Favorites</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
