import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { useDish } from '../context/DishContext';
import { useAuth } from '../context/AuthContext';
import DishCard from '../components/DishCard';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import './RestaurantDetails.css';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentRestaurant, 
    loading: restaurantLoading, 
    error: restaurantError, 
    fetchRestaurantById,
    clearError: clearRestaurantError 
  } = useRestaurant();
  
  const { 
    dishes, 
    loading: dishesLoading, 
    error: dishesError, 
    fetchDishesByRestaurant,
    clearError: clearDishesError 
  } = useDish();
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('menu');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fix: Add dependencies to useEffect
  useEffect(() => {
    if (id) {
      fetchRestaurantById(id);
      fetchDishesByRestaurant(id);
    }
  }, [id, fetchRestaurantById, fetchDishesByRestaurant]); // Add dependencies here

  const handleBack = () => {
    navigate(-1);
  };

  if (restaurantLoading) {
    return (
      <div className="loading-state">
        <LoadingSpinner />
        <p>Loading restaurant details...</p>
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="error-state">
        <ErrorMessage 
          message={restaurantError} 
          onClose={clearRestaurantError}
        />
        <button
          onClick={handleBack}
          className="back-button"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!currentRestaurant) {
    return (
      <div className="error-state">
        <h2>Restaurant not found</h2>
        <button
          onClick={handleBack}
          className="back-button"
        >
          Go Back to Restaurants
        </button>
      </div>
    );
  }

  const {
    name,
    description,
    address,
    phone,
    email,
    openingHours,
    rating, // This might be undefined, null, or a string
    totalReviews,
    imageUrl,
    cuisines = [],
    priceLevel,
    deliveryTime,
    amenities = []
  } = currentRestaurant;

  return (
    <div className="restaurant-details-container">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <img
          src={imageUrl || '/api/placeholder/1200/400'}
          alt={name}
          className="restaurant-image"
        />
        <button
          onClick={handleBack}
          className="back-nav"
        >
          ← Back
        </button>
        <div className="restaurant-info">
          <h1 className="restaurant-title">{name}</h1>
          
          <div className="restaurant-meta">
            <div className="restaurant-rating">
              ⭐ {!isNaN(Number(rating)) ? Number(rating).toFixed(1) : 'New'} ({totalReviews || 0} {totalReviews === 1 ? 'review' : 'reviews'})
            </div>
            
            <div className="delivery-time">
              ⏱️ {deliveryTime || '30-45'} min
            </div>
            
            <div className="price-level">
              💰 {'$'.repeat(priceLevel || 2)}
            </div>
          </div>
          
          <div className="restaurant-cuisines">
            {cuisines.map((cuisine, index) => (
              <span key={index} className="cuisine-tag">
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('menu')}
          className={`tab ${activeTab === 'menu' ? 'active' : ''}`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
        >
          Reviews
          {totalReviews > 0 && (
            <span className="tab-badge">{totalReviews}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="content-section">
        {activeTab === 'menu' && (
          <div className="menu-section">
            <div className="section-header">
              <h2 className="section-title">Menu</h2>
              <div className="items-count">
                {dishes.length} {dishes.length === 1 ? 'item' : 'items'}
              </div>
            </div>

            {dishesError && (
              <ErrorMessage 
                message={dishesError} 
                onClose={clearDishesError}
              />
            )}

            {dishesLoading ? (
              <div className="loading-state">
                <LoadingSpinner small />
                <p>Loading menu...</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="empty-state">
                <p>No dishes available yet.</p>
              </div>
            ) : (
              <div className="menu-grid">
                {dishes.map((dish, index) => (
                  <DishCard key={dish._id || dish.id || index} dish={dish} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-section">
            <h2 className="section-title">About {name}</h2>
            <p className="restaurant-description">
              {description || 'No description available.'}
            </p>
            
            <div className="contact-info">
              <div>
                <h3 className="section-subtitle">Contact Information</h3>
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <span>{address || 'Address not available'}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <span>{phone || 'Phone not available'}</span>
                </div>
                {email && (
                  <div className="contact-item">
                    <span className="contact-icon">✉️</span>
                    <span>{email}</span>
                  </div>
                )}
              </div>
              
              {openingHours && (
                <div>
                  <h3 className="section-subtitle">Opening Hours</h3>
                  {typeof openingHours === 'string' ? (
                    <p className="hours-text">{openingHours}</p>
                  ) : (
                    <ul className="opening-hours-list">
                      {openingHours.map((hours, index) => (
                        <li key={index} className="hours-item">
                          {hours}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            
            {amenities.length > 0 && (
              <div className="amenities-section">
                <h3 className="section-subtitle">Amenities</h3>
                <div className="amenities-list">
                  {amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <div className="section-header">
              <h2 className="section-title">Customer Reviews</h2>
              {user && !showReviewForm && (
                <button 
                  className="add-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  Add Review
                </button>
              )}
            </div>
            
            {showReviewForm ? (
              <ReviewForm 
                onSubmit={async (reviewData) => {
                  // TODO: Implement API call
                  console.log('Review submitted:', reviewData);
                  setShowReviewForm(false);
                  fetchRestaurantById(id); // Refresh data
                }}
                onCancel={() => setShowReviewForm(false)}
                restaurantId={id}
              />
            ) : (
              <ReviewList 
                reviews={currentRestaurant.reviews || []}
                onEdit={(review) => {
                  setShowReviewForm(true);
                  // TODO: Load review into form
                }}
                onDelete={async (reviewId) => {
                  // TODO: Implement API call
                  console.log('Delete review:', reviewId);
                  fetchRestaurantById(id); // Refresh data
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetails;