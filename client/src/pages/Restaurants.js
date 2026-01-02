import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import FilterBar from '../components/FilterBar';
import './Restaurants.css';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: '',
    minRating: '',
    maxPrice: '',
    sortBy: 'rating'
  });

  // Fetch restaurants from backend API
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Apply filters when filters or restaurants change
  useEffect(() => {
    if (restaurants.length > 0) {
      applyFilters();
    }
  }, [restaurants, filters]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      
      if (data.success) {
        setRestaurants(data.data);
      } else {
        setError(data.error || 'Failed to fetch restaurants');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...restaurants];

    // Filter by cuisine
    if (filters.cuisine) {
      result = result.filter(restaurant => 
        restaurant.cuisine?.toLowerCase() === filters.cuisine.toLowerCase()
      );
    }

    // Filter by minimum rating
    if (filters.minRating) {
      const minRating = parseFloat(filters.minRating);
      result = result.filter(restaurant => 
        (restaurant.rating || 0) >= minRating
      );
    }

    // Filter by maximum price
    if (filters.maxPrice) {
      const maxPrice = parseInt(filters.maxPrice);
      result = result.filter(restaurant => 
        (restaurant.price_range || 3) <= maxPrice
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'price':
          return (a.price_range || 3) - (b.price_range || 3);
        
        case 'price_desc':
          return (b.price_range || 3) - (a.price_range || 3);
        
        case 'rating':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

    setFilteredRestaurants(result);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getStats = () => {
    const total = restaurants.length;
    const showing = filteredRestaurants.length;
    const hidden = total - showing;
    
    return { total, showing, hidden };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading restaurants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Restaurants</h3>
        <p>{error}</p>
        <button onClick={fetchRestaurants} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      <div className="page-header">
        <h1>Discover Amazing Restaurants</h1>
        <p className="subtitle">
          {stats.total} restaurants available • Showing {stats.showing}
          {stats.hidden > 0 && ` (${stats.hidden} hidden by filters)`}
        </p>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      {filteredRestaurants.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No restaurants match your filters</h3>
          <p>Try adjusting your filters or clear them to see all restaurants.</p>
          <button 
            onClick={() => handleFilterChange({
              cuisine: '',
              minRating: '',
              maxPrice: '',
              sortBy: 'rating'
            })}
            className="clear-filters-btn"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="restaurants-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant}
              />
            ))}
          </div>

          <div className="results-footer">
            <p>Showing {filteredRestaurants.length} of {restaurants.length} restaurants</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Restaurants;