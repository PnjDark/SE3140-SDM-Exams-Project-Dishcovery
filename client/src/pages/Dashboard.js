import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDishes: 0,
    totalRecipes: 0,
    favoriteCount: 0,
    recentActivity: []
  });

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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to Dishcovery</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3>Total Dishes</h3>
            <p className="stat-number">{stats.totalDishes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>Recipes</h3>
            <p className="stat-number">{stats.totalRecipes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-content">
            <h3>Favorites</h3>
            <p className="stat-number">{stats.favoriteCount}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {stats.recentActivity.length > 0 ? (
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
            <button className="action-btn primary">+ Add New Dish</button>
            <button className="action-btn secondary">Browse Recipes</button>
            <button className="action-btn secondary">My Favorites</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
