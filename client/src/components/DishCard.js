import React, { useState } from 'react';
import './DishCard.css';

const DishCard = ({ dish }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const {
    name,
    description,
    price,
    rating,
    // imageUrl,
    category,
    dietaryInfo = [],
    spicyLevel,
    preparationTime
  } = dish;

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="dish-card">
      <div className="dish-header">
        <h4 className="dish-name">{name}</h4>
        <div className="dish-price">
          ${price?.toFixed(2)}
        </div>
      </div>
      
      <p className="dish-description">
        {description}
      </p>
      
      <div className="dish-meta">
        {category && (
          <span className="category-tag">
            {category}
          </span>
        )}
        
        {rating && (
          <span className="dish-rating">
            ⭐ {rating.toFixed(1)}
          </span>
        )}
        
        {preparationTime && (
          <span className="prep-time">
            ⏱️ {preparationTime} min
          </span>
        )}
      </div>
      
      {(dietaryInfo.length > 0 || spicyLevel) && (
        <div className="dietary-tags">
          {dietaryInfo.map((tag, index) => (
            <span key={index} className="dietary-tag">
              {tag}
            </span>
          ))}
          {spicyLevel && (
            <span className="spicy-tag">
              {spicyLevel === 1 ? '🌶️ Mild' : 
               spicyLevel === 2 ? '🌶️🌶️ Medium' : 
               '🌶️🌶️🌶️ Hot'}
            </span>
          )}
        </div>
      )}
      
      <div className="dish-footer">
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>
        <button className="order-btn">
          Add to Order
        </button>
      </div>
    </div>
  );
};

export default DishCard;