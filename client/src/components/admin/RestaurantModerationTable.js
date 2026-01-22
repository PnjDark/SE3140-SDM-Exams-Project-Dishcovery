import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const RestaurantModerationTable = ({ token }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/restaurants?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRestaurants(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurantStatus = async (restaurantId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        setRestaurants(restaurants.map(r =>
          r.id === restaurantId ? { ...r, status: newStatus } : r
        ));
        alert('Restaurant status updated');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRestaurants(restaurants.filter(r => r.id !== restaurantId));
        alert('Restaurant deleted');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="management-section">
      <h2>🍽️ Restaurant Moderation</h2>

      <div className="filter-controls">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="status-filter"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>Owner</th>
              <th>Cuisine</th>
              <th>Status</th>
              <th>Dishes</th>
              <th>Reviews</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map(restaurant => (
              <tr key={restaurant.id}>
                <td><strong>{restaurant.name}</strong></td>
                <td>{restaurant.owner_name || 'N/A'}</td>
                <td>{restaurant.cuisine}</td>
                <td>
                  <select
                    value={restaurant.status}
                    onChange={(e) => updateRestaurantStatus(restaurant.id, e.target.value)}
                    className={`status-select status-${restaurant.status}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td>{restaurant.dish_count || 0}</td>
                <td>{restaurant.review_count || 0}</td>
                <td>
                  {restaurant.avg_rating ? parseFloat(restaurant.avg_rating).toFixed(1) : 'N/A'} ⭐
                </td>
                <td>
                  <button
                    onClick={() => deleteRestaurant(restaurant.id)}
                    className="btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {restaurants.length === 0 && (
        <p className="empty-state">No restaurants found</p>
      )}
    </div>
  );
};

export default RestaurantModerationTable;
