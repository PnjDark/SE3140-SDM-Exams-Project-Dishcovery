import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

const ReviewModerationTable = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reviews?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        alert('Review removed');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="management-section">
      <h2>⭐ Review Moderation</h2>

      <div className="table-wrapper">
        <table className="management-table">
          <thead>
            <tr>
              <th>Review</th>
              <th>Restaurant</th>
              <th>User</th>
              <th>Rating</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id}>
                <td>
                  <div className="review-comment">
                    {review.comment?.substring(0, 50)}...
                  </div>
                </td>
                <td>{review.restaurant_name || 'Unknown'}</td>
                <td>{review.user_name || 'Anonymous'}</td>
                <td>
                  <span className="rating-badge">
                    {'⭐'.repeat(review.rating)} {review.rating}/5
                  </span>
                </td>
                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => deleteReview(review.id)}
                    className="btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reviews.length === 0 && (
        <p className="empty-state">No reviews to moderate</p>
      )}
    </div>
  );
};

export default ReviewModerationTable;
