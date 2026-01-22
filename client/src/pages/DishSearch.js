import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import './DishSearch.css';

const DishSearch = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filters (now as dropdowns)
  const [filters, setFilters] = useState({
    maxPrice: '',
    minRating: '',
    cuisine: 'all',
    limit: '50',
    offset: 0
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/restaurants/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, []);

  // Fetch dishes
  const fetchDishes = useCallback(async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: filters.limit,
        offset: filters.offset,
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.cuisine !== 'all' && { cuisine: filters.cuisine })
      });

      const response = await fetch(`/api/restaurants/search/dishes?${params}`);
      const data = await response.json();

      if (data.success) {
        setDishes(data.data);
        setPagination({
          currentPage: data.page,
          totalPages: data.pages,
          total: data.total
        });
      }
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    fetchSuggestions(value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setFilters(prev => ({ ...prev, offset: 0 }));
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setFilters(prev => ({ ...prev, offset: 0 }));
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      offset: 0 // Reset to first page on filter change
    }));
  };

  // Initial search on page load
  useEffect(() => {
    if (searchTerm.trim()) {
      fetchDishes(searchTerm);
    }
  }, [searchTerm, filters, fetchDishes]);

  // Handle pagination
  const goToPage = (pageNum) => {
    const offset = (pageNum - 1) * parseInt(filters.limit);
    setFilters(prev => ({ ...prev, offset }));
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#27ae60';
    if (rating >= 4.0) return '#f39c12';
    if (rating >= 3.0) return '#e74c3c';
    return '#95a5a6';
  };

  const cuisines = [
    'Italian', 'Indian', 'Japanese', 'Mexican', 'French',
    'Chinese', 'American', 'Thai', 'Korean', 'Mediterranean'
  ];

  return (
    <div className="dish-search-page">
      {/* Search Header */}
      <div className="search-header">
        <h1>🍽️ Find Your Perfect Dish</h1>
        <p>Search across thousands of dishes at the best prices</p>

        {/* Search Form */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search for dishes... (pizza, burgers, sushi)"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" className="search-submit">
              🔍 Search
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.dishes?.length > 0 || suggestions.cuisines?.length > 0) && (
            <div className="suggestions-dropdown">
              {suggestions.dishes?.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-title">Dishes</div>
                  {suggestions.dishes.slice(0, 5).map((s, idx) => (
                    <button
                      key={`dish-${idx}`}
                      type="button"
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      🍲 {s.text}
                    </button>
                  ))}
                </div>
              )}
              {suggestions.cuisines?.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-title">Cuisines</div>
                  {suggestions.cuisines.slice(0, 5).map((s, idx) => (
                    <button
                      key={`cuisine-${idx}`}
                      type="button"
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      🌍 {s.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="filter-header">
          <h3>🔍 Filter & Sort Results</h3>
          <button 
            className="advanced-toggle"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            ⚙️ {showAdvancedFilters ? 'Hide' : 'Advanced Filters'}
          </button>
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
              placeholder="e.g., 50"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>

          <div className="filter-container">
            <label htmlFor="results-limit">📊 Results Per Page</label>
            <select
              id="results-limit"
              className="filter-dropdown"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value="10">10 results</option>
              <option value="25">25 results</option>
              <option value="50">50 results</option>
              <option value="100">100 results</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            <h4>⚙️ Advanced Filters</h4>
            <div className="advanced-content">
              <div className="filter-group">
                <label>🥗 Dietary Preferences</label>
                <div className="filter-chips">
                  <button className="filter-chip">Vegetarian</button>
                  <button className="filter-chip">Vegan</button>
                  <button className="filter-chip">Gluten-Free</button>
                  <button className="filter-chip">Halal</button>
                </div>
              </div>
              <div className="filter-group">
                <label>🌶️ Spice Level</label>
                <div className="filter-chips">
                  <button className="filter-chip">Mild</button>
                  <button className="filter-chip">Medium</button>
                  <button className="filter-chip">Spicy</button>
                  <button className="filter-chip">Extra Spicy</button>
                </div>
              </div>
              <div className="filter-group">
                <label>🏪 Service Type</label>
                <div className="filter-chips">
                  <button className="filter-chip active">All</button>
                  <button className="filter-chip">Dine-in</button>
                  <button className="filter-chip">Takeaway</button>
                  <button className="filter-chip">Delivery</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        {loading ? (
          <p>🔍 Searching for dishes...</p>
        ) : (
          <p>
            Found <strong>{pagination.total}</strong> dishes matching "{searchTerm}"
            {filters.cuisine !== 'all' && ` in ${filters.cuisine} cuisine`}
            {filters.maxPrice && ` under $${filters.maxPrice}`}
          </p>
        )}
      </div>

      {/* Results Grid */}
      <div className="dishes-grid">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching delicious dishes...</p>
          </div>
        ) : dishes.length > 0 ? (
          dishes.map(dish => (
            <div key={dish.id} className="dish-card">
              {dish.image_url && (
                <div className="dish-image">
                  <img src={dish.image_url} alt={dish.name} />
                </div>
              )}

              <div className="dish-content">
                <h3 className="dish-name">{dish.name}</h3>

                <p className="restaurant-name">
                  📍 {dish.restaurant_name}
                </p>

                <p className="restaurant-location">
                  {dish.location}
                </p>

                {dish.description && (
                  <p className="dish-description">
                    {dish.description.substring(0, 100)}
                    {dish.description.length > 100 && '...'}
                  </p>
                )}

                <div className="dish-meta">
                  <span className="category">{dish.category}</span>
                  {dish.is_vegetarian && <span className="badge vegetarian">🌱 Vegetarian</span>}
                  {dish.is_spicy && <span className="badge spicy">🌶️ Spicy</span>}
                </div>

                <div className="dish-footer">
                  <div className="dish-price">
                    <span className="price-label">Price</span>
                    <span className="price">${dish.price.toFixed(2)}</span>
                  </div>

                  <div className="dish-rating">
                    <span
                      className="rating-badge"
                      style={{ backgroundColor: getRatingColor(dish.restaurant_rating) }}
                    >
                      ⭐ {dish.restaurant_rating.toFixed(1)}
                    </span>
                    <span className="review-count">({dish.review_count})</span>
                  </div>
                </div>

                <button className="view-btn">View at Restaurant →</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="empty-state">
              <p>🔍 No dishes found</p>
              <p>Try searching for something different or adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={pagination.currentPage === 1}
            onClick={() => goToPage(pagination.currentPage - 1)}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <button
            className="pagination-btn"
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => goToPage(pagination.currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default DishSearch;
