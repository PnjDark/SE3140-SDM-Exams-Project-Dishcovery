import React, { useState } from 'react';
import './FilterBar.css';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    cuisine: '',
    minRating: '',
    maxPrice: '',
    sortBy: 'rating'
  });

  const cuisineOptions = [
    'All Cuisines', 'Italian', 'Indian', 'Japanese', 
    'Mexican', 'French', 'Chinese', 'American', 'Thai'
  ];

  const ratingOptions = [
    'Any Rating', '4+ Stars', '3+ Stars', '2+ Stars'
  ];

  const priceOptions = [
    'Any Price', '$', '$$', '$$$', '$$$$'
  ];

  const sortOptions = [
    { value: 'rating', label: '⭐ Highest Rated' },
    { value: 'name', label: '🔤 A-Z' },
    { value: 'price', label: '💰 Price: Low to High' },
    { value: 'price_desc', label: '💰 Price: High to Low' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value === 'All Cuisines' || value === 'Any Rating' || value === 'Any Price' 
        ? '' 
        : value
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      cuisine: '',
      minRating: '',
      maxPrice: '',
      sortBy: 'rating'
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <h3>🔍 Filter & Sort</h3>
        <button className="reset-btn" onClick={handleReset}>
          Reset Filters
        </button>
      </div>

      <div className="filter-grid">
        {/* Cuisine Filter */}
        <div className="filter-group">
          <label htmlFor="cuisine">Cuisine Type</label>
          <select
            id="cuisine"
            name="cuisine"
            value={filters.cuisine || 'All Cuisines'}
            onChange={handleChange}
            className="filter-select"
          >
            {cuisineOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label htmlFor="minRating">Minimum Rating</label>
          <select
            id="minRating"
            name="minRating"
            value={filters.minRating || 'Any Rating'}
            onChange={handleChange}
            className="filter-select"
          >
            {ratingOptions.map((option, index) => (
              <option key={index} value={index > 0 ? 5 - index : ''}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <label htmlFor="maxPrice">Maximum Price</label>
          <select
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice || 'Any Price'}
            onChange={handleChange}
            className="filter-select"
          >
            {priceOptions.map((option, index) => (
              <option key={index} value={index > 0 ? index : ''}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label htmlFor="sortBy">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="filter-select"
          >
            {sortOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;