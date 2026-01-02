import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [featuredCuisines, setFeaturedCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalReviews: 0,
    averageRating: 0
  });

  const features = [
    {
      icon: '🍽️',
      title: 'Discover Restaurants',
      description: 'Explore hundreds of restaurants with detailed menus and reviews'
    },
    {
      icon: '⭐',
      title: 'Read Reviews',
      description: 'See what others are saying about their dining experiences'
    },
    {
      icon: '🔍',
      title: 'Smart Filters',
      description: 'Find exactly what you want with advanced filtering options'
    },
    {
      icon: '💬',
      title: 'Share Experiences',
      description: 'Leave your own reviews and help others decide'
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

  useEffect(() => {
    fetchHomeData(); // Now this works because fetchHomeData is defined above
  }, []);

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
      {/* Hero Section with Stats */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover <span className="highlight">{stats.totalRestaurants}</span> Amazing Restaurants
          </h1>
          <p className="hero-subtitle">
            Join our community of food lovers exploring {stats.totalRestaurants} restaurants with {stats.totalReviews}+ reviews. 
            Average rating: <span className="rating-text">⭐ {stats.averageRating}/5</span>
          </p>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">{stats.totalRestaurants}</div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalReviews}+</div>
              <div className="stat-label">Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageRating}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
          
          <div className="hero-buttons">
            <Link to="/restaurants" className="btn btn-primary">
              Browse All Restaurants →
            </Link>
            <Link to="/restaurants" className="btn btn-secondary">
              🔍 Search Now
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

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Dishcovery?</h2>
          <p>Everything you need to find your perfect dining experience</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
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