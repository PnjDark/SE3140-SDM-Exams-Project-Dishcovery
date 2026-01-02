import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#27ae60';
    if (rating >= 4.0) return '#f39c12';
    if (rating >= 3.0) return '#e74c3c';
    return '#95a5a6';
  };

  const getCuisineIcon = (cuisine) => {
    const icons = {
      'Italian': '🍕',
      'Indian': '🍛',
      'Japanese': '🍣',
      'Mexican': '🌮',
      'French': '🥐',
      'Chinese': '🥢',
      'American': '🍔',
      'Thai': '🍜'
    };
    return icons[cuisine] || '🍽️';
  };

  return (
    <div className="restaurant-card" onClick={handleClick}>
      <div className="card-image">
        <div className="image-placeholder">
          <span className="cuisine-icon">
            {getCuisineIcon(restaurant.cuisine)}
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3>{restaurant.name}</h3>
          <div className="rating-badge" style={{ backgroundColor: getRatingColor(restaurant.rating) }}>
            ⭐ {restaurant.rating || 'New'}
          </div>
        </div>

        <div className="card-tags">
          <span className="tag cuisine">{restaurant.cuisine}</span>
          <span className="tag location">📍 {restaurant.location}</span>
          <span className="tag price">{'$'.repeat(restaurant.price_range || 3)}</span>
        </div>

        <p className="description">
          {restaurant.description?.substring(0, 120) || 'No description available.'}
          {restaurant.description?.length > 120 && '...'}
        </p>

        <div className="card-footer">
          <button className="view-details-btn">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;