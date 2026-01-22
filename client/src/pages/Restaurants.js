import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import './Restaurants.css';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    cuisine: 'all',
    minRating: '',
    maxPrice: '',
    sortBy: 'rating'
  });

  const cuisines = [
    'Italian', 'Indian', 'Japanese', 'Mexican', 'French',
    'Chinese', 'American', 'Thai', 'Korean', 'Mediterranean'
  ];

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
    if (filters.cuisine && filters.cuisine !== 'all') {
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

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      cuisine: 'all',
      minRating: '',
      maxPrice: '',
      sortBy: 'rating'
    });
  };

  if (loading) {
    return (
      <div className="restaurants-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurants-page">
        <div className="error-container">
          <h3>Error Loading Restaurants</h3>
          <p>{error}</p>
          <button onClick={fetchRestaurants} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      {/* Header */}
      <div className="search-header">
        <h1>🏪 Browse All Restaurants</h1>
        <p>Explore {restaurants.length} amazing restaurants in your area</p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-header">
          <h3>🔍 Filter & Sort Restaurants</h3>
          <div className="filter-controls">
            <button 
              className="advanced-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              ⚙️ {showAdvancedFilters ? 'Hide' : 'Advanced Filters'}
            </button>
            <button 
              className="reset-btn"
              onClick={handleResetFilters}
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="filters-section">
          <div className="filter-container">
            <label htmlFor="cuisine-filter">🍽️ Cuisine Type</label>
            <select
              id="cuisine-filter"
              className="filter-dropdown"
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            >
              <option value="all">All Cuisines</option>
              {cuisines.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-container">
            <label htmlFor="min-rating">⭐ Minimum Rating</label>
            <select
              id="min-rating"
              className="filter-dropdown"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <div className="filter-container">
            <label htmlFor="max-price">💰 Maximum Price</label>
            <input
              id="max-price"
              type="number"
              className="filter-input"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>

          <div className="filter-container">
            <label htmlFor="sort-by">📊 Sort By</label>
            <select
              id="sort-by"
              className="filter-dropdown"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="name">🔤 A-Z</option>
              <option value="price">💰 Price: Low to High</option>
              <option value="price_desc">💰 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <h4>⚙️ Advanced Filters</h4>
            <div className="advanced-content">
              <div className="filter-group">
                <label>🏆 Rating Range</label>
                <div className="filter-chips">
                  <button className="filter-chip">Recently Added</button>
                  <button className="filter-chip">Most Reviewed</button>
                  <button className="filter-chip">Top Rated</button>
                </div>
              </div>
              <div className="filter-group">
                <label>🏪 Restaurant Type</label>
                <div className="filter-chips">
                  <button className="filter-chip">Dine-in</button>
                  <button className="filter-chip">Takeaway</button>
                  <button className="filter-chip">Delivery</button>
                  <button className="filter-chip">Outdoor</button>
                </div>
              </div>
              <div className="filter-group">
                <label>🥗 Dietary Options</label>
                <div className="filter-chips">
                  <button className="filter-chip">Vegetarian</button>
                  <button className="filter-chip">Vegan</button>
                  <button className="filter-chip">Gluten-Free</button>
                  <button className="filter-chip">Halal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Found <strong>{filteredRestaurants.length}</strong> restaurants
          {filters.cuisine !== 'all' && ` with ${filters.cuisine} cuisine`}
          {filters.minRating && ` rated ${filters.minRating}+ stars`}
          {filters.maxPrice && ` under $${filters.maxPrice}`}
        </p>
      </div>

      {/* Results Grid */}
      {filteredRestaurants.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No restaurants found</h3>
          <p>Try adjusting your filters to see more options.</p>
          <button 
            onClick={handleResetFilters}
            className="clear-filters-btn"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="restaurants-grid">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;