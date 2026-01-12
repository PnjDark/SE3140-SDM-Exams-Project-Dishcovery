import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './ReviewForm.css';

const ReviewForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  restaurantId,
  dishId 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: initialData.rating || 5,
    comment: initialData.comment || '',
    title: initialData.title || '',
    ...initialData
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please login to submit a review');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please add a review title');
      return;
    }

    if (!formData.comment.trim()) {
      setError('Please add your review comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData = {
        ...formData,
        restaurantId,
        dishId,
        userId: user.id,
        userName: user.username || user.email
      };

      await onSubmit(reviewData);
      
      // Reset form for new reviews
      if (!initialData.id) {
        setFormData({
          rating: 5,
          comment: '',
          title: ''
        });
      }
      
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-button ${i <= formData.rating ? 'active' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => {
            // Optional: Add hover effect
          }}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="review-form-container">
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-header">
          <h3>{initialData.id ? 'Edit Your Review' : 'Write a Review'}</h3>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="close-button"
              aria-label="Close review form"
            >
              ×
            </button>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summarize your experience (e.g., 'Amazing food!', 'Great service')"
            className="form-input"
            maxLength="100"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Rating *
          </label>
          <div className="rating-container">
            <div className="stars-container">
              {renderStars()}
            </div>
            <span className="rating-text">
              {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Share details about your experience. What did you like or dislike?"
            className="form-textarea"
            rows="5"
            maxLength="500"
            required
          />
          <div className="char-count">
            {formData.comment.length}/500 characters
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Submitting...
              </>
            ) : initialData.id ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;