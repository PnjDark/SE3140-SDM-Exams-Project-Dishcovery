import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserManagementTable from '../../components/admin/UserManagementTable';
import RestaurantModerationTable from '../../components/admin/RestaurantModerationTable';
import ReviewModerationTable from '../../components/admin/ReviewModerationTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import '../Dashboard.css';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Platform Management & Moderation</p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`nav-btn ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          🍽️ Restaurants
        </button>
        <button
          className={`nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews
        </button>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.users?.total_users || 0}</p>
                <small>
                  {stats.users?.customers || 0} Customers • {stats.users?.owners || 0} Owners
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-info">
                <h3>Restaurants</h3>
                <p className="stat-value">{stats.restaurants?.total || 0}</p>
                <small>
                  ✅ {stats.restaurants?.approved || 0} Approved • ⏳ {stats.restaurants?.pending || 0} Pending
                </small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <h3>Reviews</h3>
                <p className="stat-value">{stats.reviews?.total_reviews || 0}</p>
                <small>
                  Avg Rating: {stats.reviews?.avg_rating 
                    ? parseFloat(stats.reviews.avg_rating).toFixed(1) 
                    : 'N/A'}/5
                </small>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-section">
            <h2>📋 Recent Activity</h2>

            <div className="activity-subsection">
              <h3>New Users</h3>
              {stats.recent_users?.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">No recent users</p>
              )}
            </div>

            <div className="activity-subsection">
              <h3>Pending Restaurants</h3>
              {stats.pending_restaurants?.length > 0 ? (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Restaurant</th>
                      <th>Owner</th>
                      <th>Cuisine</th>
                      <th>Location</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pending_restaurants.map(restaurant => (
                      <tr key={restaurant.id}>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.owner_id || 'N/A'}</td>
                        <td>{restaurant.cuisine}</td>
                        <td>{restaurant.location}</td>
                        <td>{new Date(restaurant.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">No pending restaurants</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <UserManagementTable token={token} />
      )}

      {/* Restaurant Moderation Tab */}
      {activeTab === 'restaurants' && (
        <RestaurantModerationTable token={token} />
      )}

      {/* Review Moderation Tab */}
      {activeTab === 'reviews' && (
        <ReviewModerationTable token={token} />
      )}
    </div>
  );
};

export default AdminDashboard;
