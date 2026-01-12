import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ReviewList.css';

const ReviewList = ({ reviews, onEdit, onDelete, showRestaurant = false }) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('date');
  const [filterRating, setFilterRating] = useState('all');
  const [helpfulReviews, setHelpfulReviews] = useState({});

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    const aDate = new Date(a.createdAt || a.date || Date.now());
    const bDate = new Date(b.createdAt || b.date || Date.now());
    
    switch (sortBy) {
      case 'rating_desc':
        return b.rating - a.rating;
      case 'rating_asc':
        return a.rating - b.rating;
      case 'helpful':
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      case 'date':
      default:
        return bDate - aDate;
    }
  });

  // Filter reviews
  const filteredReviews = sortedReviews.filter(review => {
    if (filterRating === 'all') return true;
    const rating = parseInt(filterRating);
    return Math.floor(review.rating) === rating;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const handleHelpfulClick = (reviewId) => {
    setHelpfulReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star full">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>);
    }
    
    return stars;
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rounded = Math.round(review.rating);
      distribution[rounded]++;
    });
    return distribution;
  };

  if (reviews.length === 0) {
    return (
      <div className="no-reviews">
        <div className="no-reviews-icon">📝</div>
        <h3 className="no-reviews-title">No reviews yet</h3>
        <p className="no-reviews-message">
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  const averageRating = getAverageRating();
  const ratingDistribution = getRatingDistribution();

  return (
    <div className="review-list">
      <div className="reviews-header">
        <div className="reviews-summary">
          <div className="average-rating">
            <span className="average-number">{averageRating}</span>
            <div className="average-stars">
              {renderStars(parseFloat(averageRating))}
            </div>
            <span className="total-reviews">{reviews.length} reviews</span>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="distribution-row">
                <span className="stars-label">{stars} ★</span>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill"
                    style={{ 
                      width: `${(ratingDistribution[stars] / reviews.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="distribution-count">
                  {ratingDistribution[stars]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-filters">
          <div className="filter-group">
            <label htmlFor="sortBy" className="filter-label">Sort by:</label>
            <select 
              id="sortBy" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Most Recent</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="rating_asc">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filterRating" className="filter-label">Rating:</label>
            <select 
              id="filterRating" 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map(rating => (
                <option key={rating} value={rating}>
                  {rating} ★
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="reviews-container">
        {filteredReviews.map((review, index) => {
          const isHelpful = helpfulReviews[review._id || review.id];
          const helpfulCount = (review.helpfulCount || 0) + (isHelpful ? 1 : 0);
          
          return (
            <div key={review._id || review.id || index} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {getUserInitials(review.user?.username || review.userName)}
                  </div>
                  <div className="reviewer-details">
                    <div className="reviewer-name">
                      {review.user?.username || review.userName || 'Anonymous'}
                    </div>
                    <div className="review-date">
                      {formatDate(review.createdAt || review.date)}
                    </div>
                  </div>
                </div>

                <div className="review-rating">
                  <div className="review-stars">
                    {renderStars(review.rating)}
                  </div>
                  <span className="rating-number">{review.rating.toFixed(1)}</span>
                </div>
              </div>

              {review.title && (
                <h4 className="review-title">
                  {review.title}
                </h4>
              )}

              <p className="review-comment">
                {review.comment}
              </p>

              {review.reply && (
                <div className="review-reply">
                  <div className="reply-header">
                    <span className="reply-label">Owner's Reply</span>
                    {review.replyDate && (
                      <span className="reply-date">
                        {formatDate(review.replyDate)}
                      </span>
                    )}
                  </div>
                  <p className="reply-content">{review.reply}</p>
                </div>
              )}

              <div className="review-footer">
                <div className="review-actions">
                  <button 
                    className={`helpful-button ${isHelpful ? 'active' : ''}`}
                    onClick={() => handleHelpfulClick(review._id || review.id)}
                  >
                    <span className="helpful-icon">👍</span>
                    Helpful ({helpfulCount})
                  </button>
                </div>

                {(user?.id === review.userId || user?.role === 'admin') && (
                  <div className="review-management">
                    {user?.id === review.userId && onEdit && (
                      <button 
                        onClick={() => onEdit(review)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                    )}
                    {(user?.id === review.userId || user?.role === 'admin') && onDelete && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this review?')) {
                            onDelete(review._id || review.id);
                          }
                        }}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination if needed */}
      {reviews.length > 10 && (
        <div className="reviews-pagination">
          <button className="pagination-button prev">Previous</button>
          <div className="pagination-pages">
            {[1, 2, 3].map(page => (
              <button 
                key={page} 
                className={`pagination-page ${page === 1 ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          <button className="pagination-button next">Next</button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;