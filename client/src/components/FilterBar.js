// import React, { useState } from 'react';
// import './FilterBar.css';

// const FilterBar = ({ onFilterChange }) => {
//   const [filters, setFilters] = useState({
//     cuisine: '',
//     minRating: '',
//     maxPrice: '',
//     sortBy: 'rating'
//   });

//   const cuisineOptions = [
//     'All Cuisines', 'Italian', 'Indian', 'Japanese', 
//     'Mexican', 'French', 'Chinese', 'American', 'Thai'
//   ];

//   const ratingOptions = [
//     'Any Rating', '4+ Stars', '3+ Stars', '2+ Stars'
//   ];

//   const priceOptions = [
//     'Any Price', '$', '$$', '$$$', '$$$$'
//   ];

//   const sortOptions = [
//     { value: 'rating', label: '⭐ Highest Rated' },
//     { value: 'name', label: '🔤 A-Z' },
//     { value: 'price', label: '💰 Price: Low to High' },
//     { value: 'price_desc', label: '💰 Price: High to Low' }
//   ];

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     const newFilters = {
//       ...filters,
//       [name]: value === 'All Cuisines' || value === 'Any Rating' || value === 'Any Price' 
//         ? '' 
//         : value
//     };
    
//     setFilters(newFilters);
//     onFilterChange(newFilters);
//   };

//   const handleReset = () => {
//     const resetFilters = {
//       cuisine: '',
//       minRating: '',
//       maxPrice: '',
//       sortBy: 'rating'
//     };
//     setFilters(resetFilters);
//     onFilterChange(resetFilters);
//   };

//   return (
//     <div className="filter-bar">
//       <div className="filter-header">
//         <h3>🔍 Filter & Sort</h3>
//         <button className="reset-btn" onClick={handleReset}>
//           Reset Filters
//         </button>
//       </div>

//       <div className="filter-grid">
//         {/* Cuisine Filter */}
//         <div className="filter-group">
//           <label htmlFor="cuisine">Cuisine Type</label>
//           <select
//             id="cuisine"
//             name="cuisine"
//             value={filters.cuisine || 'All Cuisines'}
//             onChange={handleChange}
//             className="filter-select"
//           >
//             {cuisineOptions.map((option, index) => (
//               <option key={index} value={option}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Rating Filter */}
//         <div className="filter-group">
//           <label htmlFor="minRating">Minimum Rating</label>
//           <select
//             id="minRating"
//             name="minRating"
//             value={filters.minRating || 'Any Rating'}
//             onChange={handleChange}
//             className="filter-select"
//           >
//             {ratingOptions.map((option, index) => (
//               <option key={index} value={index > 0 ? 5 - index : ''}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Price Filter */}
//         <div className="filter-group">
//           <label htmlFor="maxPrice">Maximum Price</label>
//           <select
//             id="maxPrice"
//             name="maxPrice"
//             value={filters.maxPrice || 'Any Price'}
//             onChange={handleChange}
//             className="filter-select"
//           >
//             {priceOptions.map((option, index) => (
//               <option key={index} value={index > 0 ? index : ''}>
//                 {option}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Sort Options */}
//         <div className="filter-group">
//           <label htmlFor="sortBy">Sort By</label>
//           <select
//             id="sortBy"
//             name="sortBy"
//             value={filters.sortBy}
//             onChange={handleChange}
//             className="filter-select"
//           >
//             {sortOptions.map((option, index) => (
//               <option key={index} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FilterBar;

import React, { useState } from 'react';
import './FilterBar.css'; // Using your CSS

const FilterBar = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    cuisine: initialFilters.cuisine || '',
    minRating: initialFilters.minRating || '',
    maxPrice: initialFilters.maxPrice || '',
    sortBy: initialFilters.sortBy || 'rating',
    ...initialFilters
  });

  const cuisineOptions = [
    'All Cuisines', 'Italian', 'Indian', 'Japanese', 
    'Mexican', 'French', 'Chinese', 'American', 'Thai',
    'African', 'Mediterranean', 'Vegetarian', 'Vegan'
  ];

  const ratingOptions = [
    'Any Rating', '4+ Stars', '3.5+ Stars', '3+ Stars', '2+ Stars'
  ];

  const priceOptions = [
    'Any Price', '$ (Budget)', '$$ (Moderate)', '$$$ (Expensive)', '$$$$ (Luxury)'
  ];

  const sortOptions = [
    { value: 'rating', label: '⭐ Highest Rated' },
    { value: 'popularity', label: '🔥 Most Popular' },
    { value: 'name', label: '🔤 A-Z' },
    { value: 'price', label: '💰 Price: Low to High' },
    { value: 'price_desc', label: '💰 Price: High to Low' },
    { value: 'delivery_time', label: '⏱️ Fastest Delivery' },
    { value: 'distance', label: '📍 Nearest' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Handle special cases
    if (name === 'cuisine' && value === 'All Cuisines') processedValue = '';
    if (name === 'minRating' && value === 'Any Rating') processedValue = '';
    if (name === 'maxPrice' && value === 'Any Price') processedValue = '';
    
    // Convert rating string to number
    if (name === 'minRating' && value.startsWith('Any')) processedValue = '';
    if (name === 'minRating' && value.includes('+')) {
      processedValue = parseFloat(value);
    }
    
    // Convert price symbol to number
    if (name === 'maxPrice' && value.includes('$')) {
      processedValue = value.split(' ')[0].length; // Count $ symbols
    }
    
    const newFilters = {
      ...filters,
      [name]: processedValue
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

  // Additional filters for advanced filtering
  const [advancedFilters, setAdvancedFilters] = useState({
    deliveryTime: '',
    dietaryRestrictions: [],
    serviceType: ''
  });

  const serviceTypes = [
    'All', 'Dine-in', 'Takeaway', 'Delivery', 'Outdoor'
  ];

  const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'
  ];

  const deliveryTimes = [
    'Any Time', 'Under 30 min', '30-45 min', '45-60 min', '60+ min'
  ];

  const handleAdvancedFilterChange = (type, value) => {
    const newAdvancedFilters = { ...advancedFilters };
    
    if (type === 'dietaryRestrictions') {
      // Toggle selection
      if (newAdvancedFilters.dietaryRestrictions.includes(value)) {
        newAdvancedFilters.dietaryRestrictions = 
          newAdvancedFilters.dietaryRestrictions.filter(item => item !== value);
      } else {
        newAdvancedFilters.dietaryRestrictions = [
          ...newAdvancedFilters.dietaryRestrictions,
          value
        ];
      }
    } else {
      newAdvancedFilters[type] = value === 'Any Time' || value === 'All' ? '' : value;
    }
    
    setAdvancedFilters(newAdvancedFilters);
    onFilterChange({ ...filters, ...newAdvancedFilters });
  };

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <h3>🔍 Filter & Sort</h3>
        <button className="reset-btn" onClick={handleReset}>
          Reset All
        </button>
      </div>

      <div className="filter-grid">
        {/* Cuisine Filter */}
        <div className="filter-group">
          <label htmlFor="cuisine">🍽️ Cuisine Type</label>
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
          <label htmlFor="minRating">⭐ Minimum Rating</label>
          <select
            id="minRating"
            name="minRating"
            value={filters.minRating || 'Any Rating'}
            onChange={handleChange}
            className="filter-select"
          >
            {ratingOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <label htmlFor="maxPrice">💰 Maximum Price</label>
          <select
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice || 'Any Price'}
            onChange={handleChange}
            className="filter-select"
          >
            {priceOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label htmlFor="sortBy">📊 Sort By</label>
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

      {/* Advanced Filters Section */}
      <div className="advanced-filters">
        <h4>⚙️ Advanced Filters</h4>
        
        {/* Delivery Time */}
        <div className="filter-group">
          <label>⏱️ Delivery Time</label>
          <div className="filter-chips">
            {deliveryTimes.map((time, index) => (
              <button
                key={index}
                className={`filter-chip ${advancedFilters.deliveryTime === (time === 'Any Time' ? '' : time) ? 'active' : ''}`}
                onClick={() => handleAdvancedFilterChange('deliveryTime', time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Service Type */}
        <div className="filter-group">
          <label>🏪 Service Type</label>
          <div className="filter-chips">
            {serviceTypes.map((service, index) => (
              <button
                key={index}
                className={`filter-chip ${advancedFilters.serviceType === (service === 'All' ? '' : service) ? 'active' : ''}`}
                onClick={() => handleAdvancedFilterChange('serviceType', service)}
              >
                {service}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="filter-group">
          <label>🥗 Dietary Preferences</label>
          <div className="filter-chips">
            {dietaryRestrictions.map((diet, index) => (
              <button
                key={index}
                className={`filter-chip ${advancedFilters.dietaryRestrictions.includes(diet) ? 'active' : ''}`}
                onClick={() => handleAdvancedFilterChange('dietaryRestrictions', diet)}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.cuisine || filters.minRating || filters.maxPrice || 
        advancedFilters.deliveryTime || advancedFilters.serviceType || 
        advancedFilters.dietaryRestrictions.length > 0) && (
        <div className="active-filters">
          <h5>Active Filters:</h5>
          <div className="active-filters-list">
            {filters.cuisine && (
              <span className="active-filter-tag">
                {filters.cuisine} <button onClick={() => handleChange({ target: { name: 'cuisine', value: 'All Cuisines' }})}>×</button>
              </span>
            )}
            {filters.minRating && (
              <span className="active-filter-tag">
                Rating: {filters.minRating}+ <button onClick={() => handleChange({ target: { name: 'minRating', value: 'Any Rating' }})}>×</button>
              </span>
            )}
            {filters.maxPrice && (
              <span className="active-filter-tag">
                Max: {'$'.repeat(filters.maxPrice)} <button onClick={() => handleChange({ target: { name: 'maxPrice', value: 'Any Price' }})}>×</button>
              </span>
            )}
            {advancedFilters.deliveryTime && (
              <span className="active-filter-tag">
                {advancedFilters.deliveryTime} <button onClick={() => handleAdvancedFilterChange('deliveryTime', 'Any Time')}>×</button>
              </span>
            )}
            {advancedFilters.serviceType && (
              <span className="active-filter-tag">
                {advancedFilters.serviceType} <button onClick={() => handleAdvancedFilterChange('serviceType', 'All')}>×</button>
              </span>
            )}
            {advancedFilters.dietaryRestrictions.map((diet, index) => (
              <span key={index} className="active-filter-tag">
                {diet} <button onClick={() => handleAdvancedFilterChange('dietaryRestrictions', diet)}>×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;