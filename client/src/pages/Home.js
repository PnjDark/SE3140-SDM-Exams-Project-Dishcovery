import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [featuredCuisines, setFeaturedCuisines] = useState([]);
  const [personalizedFeed, setPersonalizedFeed] = useState([]);
  const [feedStats, setFeedStats] = useState({ followed: 0, recommended: 0, trending: 0 });
  const [loading, setLoading] = useState(true);
  const [followedRestaurants, setFollowedRestaurants] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalReviews: 0,
    averageRating: 0
  });

  const features = [
    {
      icon: '🍲',
      title: 'Find Dishes',
      description: 'Search for your favorite dishes across hundreds of restaurants'
    },
    {
      icon: '💰',
      title: 'Best Prices',
      description: 'Compare prices and find the most affordable options'
    },
    {
      icon: '⭐',
      title: 'Top Rated',
      description: 'Discover highest-rated dishes from verified reviews'
    },
    {
      icon: '📍',
      title: 'Near You',
      description: 'Find dishes at restaurants closest to your location'
    }
  ];

  // Define fetchHomeData BEFORE using it in useEffect
  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // First try the stats endpoint
      try {
        const response = await fetch('/api/restaurants/stats/home');
        const data = await response.json();
        
        if (data.success) {
          setTopRestaurants(data.data.topRestaurants || []);
          setFeaturedCuisines(data.data.featuredCuisines || []);
          setStats({
            totalRestaurants: data.data.totalRestaurants || 0,
            totalReviews: data.data.totalReviews || 0,
            averageRating: data.data.averageRating || 0
          });
          setLoading(false);
          return;
        }
      } catch (statsError) {
        console.log('Stats endpoint not available, falling back...');
      }
      
      // Fallback: Fetch regular restaurants
      const restaurantsResponse = await fetch('/api/restaurants');
      const restaurantsData = await restaurantsResponse.json();
      
      if (restaurantsData.success) {
        // Get top 3 rated restaurants
        const sortedByRating = [...restaurantsData.data]
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3);
        setTopRestaurants(sortedByRating);
        
        // Calculate statistics
        const total = restaurantsData.data.length;
        const avgRating = restaurantsData.data.length > 0 
          ? restaurantsData.data.reduce((sum, r) => sum + (r.rating || 0), 0) / total 
          : 0;
        
        // Get unique cuisines
        const cuisines = [...new Set(restaurantsData.data.map(r => r.cuisine).filter(Boolean))].slice(0, 4);
        setFeaturedCuisines(cuisines);
        
        setStats({
          totalRestaurants: total,
          totalReviews: total * 5, // Estimate
          averageRating: avgRating.toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch personalized feed for authenticated users
  const fetchPersonalizedFeed = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      const response = await fetch(`/api/restaurants/feed/personalized?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPersonalizedFeed(data.data);
        setFeedStats(data.stats);
        
        // Extract followed restaurants
        const followed = new Set(
          data.data
            .filter(r => r.source === 'followed')
            .map(r => r.id)
        );
        setFollowedRestaurants(followed);
      }
    } catch (error) {
      console.error('Error fetching personalized feed:', error);
    }
  }, [isAuthenticated, user?.id]);

  const handleFollowToggle = async (restaurantId, isCurrentlyFollowing) => {
    if (!isAuthenticated || !user?.id) {
      alert('Please login to follow restaurants');
      return;
    }

    try {
      const method = isCurrentlyFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/restaurants/${restaurantId}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        // Update local state
        const newFollowed = new Set(followedRestaurants);
        if (isCurrentlyFollowing) {
          newFollowed.delete(restaurantId);
        } else {
          newFollowed.add(restaurantId);
        }
        setFollowedRestaurants(newFollowed);
        
        // Refresh feed
        await fetchPersonalizedFeed();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPersonalizedFeed();
    }
  }, [isAuthenticated, user?.id]);

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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#27ae60';
    if (rating >= 4.0) return '#f39c12';
    if (rating >= 3.0) return '#e74c3c';
    return '#95a5a6';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dishes/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading delicious content...</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section with Search */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Perfect <span className="highlight">Dish</span>
          </h1>
          <p className="hero-subtitle">
            Discover dishes served across {stats.totalRestaurants} restaurants. Compare prices, find the best quality, and order from nearby locations.
          </p>
          
          {/* Search Bar */}
          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search for pizzas, burgers, sushi... 🍕🍔🍣"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn">
                🔍 Search
              </button>
            </div>
          </form>

          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.totalRestaurants}</div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalReviews}+</div>
              <div className="stat-label">Dishes Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageRating}</div>
              <div className="stat-label">Avg Quality</div>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/restaurants" className="btn btn-primary">
              Browse All Dishes →
            </Link>
            <Link to="/restaurants" className="btn btn-secondary">
              📍 Near Me
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          {topRestaurants.slice(0, 3).map((restaurant, index) => (
            <div 
              key={restaurant.id} 
              className={`floating-card card-${index + 1}`}
              style={{ 
                animationDelay: `${index * 0.3}s`,
                borderTop: `4px solid ${getRatingColor(restaurant.rating)}`
              }}
            >
              <div className="card-icon">{getCuisineIcon(restaurant.cuisine)}</div>
              <h4>{restaurant.name}</h4>
              <p style={{ color: getRatingColor(restaurant.rating) }}>
                ⭐ {restaurant.rating || 'New'}
              </p>
              <small>{restaurant.cuisine}</small>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Cuisines */}
      {featuredCuisines.length > 0 && (
        <section className="cuisines-section">
          <div className="section-header">
            <h2>Explore Cuisines</h2>
            <p>Discover restaurants by cuisine type</p>
          </div>
          <div className="cuisines-grid">
            {featuredCuisines.map((cuisine, index) => (
              <Link 
                key={index} 
                to={`/restaurants?cuisine=${encodeURIComponent(cuisine)}`}
                className="cuisine-card"
              >
                <div className="cuisine-icon">{getCuisineIcon(cuisine)}</div>
                <h3>{cuisine}</h3>
                <p>Explore {cuisine} restaurants</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Feed Section (for authenticated users) */}
      {isAuthenticated && personalizedFeed.length > 0 && (
        <section className="personalized-feed">
          <div className="section-header">
            <h2>🎯 Your Personalized Feed</h2>
            <p>Curated just for you: Followed → Recommended → Trending</p>
          </div>
          
          <div className="feed-stats">
            {feedStats.followed > 0 && (
              <div className="feed-stat-item">
                <span className="stat-label">👥 Following</span>
                <span className="stat-count">{feedStats.followed}</span>
              </div>
            )}
            {feedStats.recommended > 0 && (
              <div className="feed-stat-item">
                <span className="stat-label">💡 Recommended</span>
                <span className="stat-count">{feedStats.recommended}</span>
              </div>
            )}
            {feedStats.trending > 0 && (
              <div className="feed-stat-item">
                <span className="stat-label">🔥 Trending</span>
                <span className="stat-count">{feedStats.trending}</span>
              </div>
            )}
          </div>

          <div className="feed-container">
            {personalizedFeed.map((restaurant) => {
              const isFollowing = followedRestaurants.has(restaurant.id);
              return (
                <div key={restaurant.id} className={`feed-card source-${restaurant.source}`}>
                  <div className="feed-source-badge">
                    {restaurant.source === 'followed' && '👥 Following'}
                    {restaurant.source === 'recommended' && '💡 Recommended'}
                    {restaurant.source === 'trending' && '🔥 Trending'}
                  </div>

                  <div className="feed-header">
                    <h3>{restaurant.name}</h3>
                    <span 
                      className="rating-badge"
                      style={{ backgroundColor: getRatingColor(restaurant.rating) }}
                    >
                      ⭐ {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}
                    </span>
                  </div>

                  <p className="cuisine">
                    <span className="cuisine-icon-small">{getCuisineIcon(restaurant.cuisine)}</span>
                    {restaurant.cuisine}
                  </p>
                  <p className="location">📍 {restaurant.location}</p>
                  <p className="description">
                    {restaurant.description?.substring(0, 100) || 'No description available.'}
                    {restaurant.description?.length > 100 && '...'}
                  </p>

                  <div className="feed-footer">
                    <Link to={`/restaurants/${restaurant.id}`} className="feed-link">
                      View Details
                    </Link>
                    <button 
                      className={`follow-btn ${isFollowing ? 'following' : ''}`}
                      onClick={() => handleFollowToggle(restaurant.id, isFollowing)}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="center-button">
            <Link to="/restaurants" className="btn btn-large">
              Browse All Restaurants
            </Link>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Dishcovery?</h2>
          <p>Everything you need to find your perfect dining experience</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-card-inner">
                {/* Front of card */}
                <div className="feature-card-front">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                </div>
                {/* Back of card */}
                <div className="feature-card-back">
                  <p>{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Restaurants from Database */}
      {topRestaurants.length > 0 && (
        <section className="top-restaurants">
          <div className="section-header">
            <h2>Top Rated Restaurants</h2>
            <p>Based on user reviews and ratings</p>
          </div>
          <div className="restaurants-preview">
            {topRestaurants.map(restaurant => (
              <div key={restaurant.id} className="restaurant-preview-card">
                <div className="preview-header">
                  <h3>{restaurant.name}</h3>
                  <span 
                    className="rating-badge"
                    style={{ backgroundColor: getRatingColor(restaurant.rating) }}
                  >
                    ⭐ {restaurant.rating || 'New'}
                  </span>
                </div>
                <p className="cuisine">
                  <span className="cuisine-icon-small">
                    {getCuisineIcon(restaurant.cuisine)}
                  </span>
                  {restaurant.cuisine}
                </p>
                <p className="location">📍 {restaurant.location}</p>
                <p className="description">
                  {restaurant.description?.substring(0, 80) || 'No description available.'}
                  {restaurant.description?.length > 80 && '...'}
                </p>
                <Link to={`/restaurants/${restaurant.id}`} className="preview-link">
                  View Details →
                </Link>
              </div>
            ))}
          </div>
          <div className="center-button">
            <Link to="/restaurants" className="btn btn-large">
              View All {stats.totalRestaurants} Restaurants
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to explore?</h2>
          <p>Join our community of {stats.totalReviews}+ reviews and counting.</p>
          <Link to="/restaurants" className="btn btn-primary btn-xl">
            Start Exploring Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;