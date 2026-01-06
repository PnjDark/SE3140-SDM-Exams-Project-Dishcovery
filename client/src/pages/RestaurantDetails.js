import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { useDish } from '../context/DishContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DishCard from '../components/DishCard';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

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

  useEffect(() => {
    if (id) {
      fetchRestaurantById(id);
      fetchDishesByRestaurant(id);
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (restaurantLoading) {
    return <LoadingSpinner fullPage />;
  }

  if (restaurantError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage 
          message={restaurantError} 
          onClose={clearRestaurantError}
        />
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!currentRestaurant) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
    rating,
    totalReviews,
    imageUrl,
    cuisines = [],
    priceLevel,
    deliveryTime,
    amenities = []
  } = currentRestaurant;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={imageUrl || '/api/placeholder/1600/400'}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto">
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Restaurants
            </button>
            
            <h1 className="text-4xl font-bold mb-2">{name}</h1>
            
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">⭐ {rating?.toFixed(1) || 'New'}</span>
                <span className="text-gray-200">({totalReviews || 0} reviews)</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{deliveryTime || '30-45'} min</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{'$'.repeat(priceLevel || 2)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {cuisines.map((cuisine, index) => (
                <span key={index} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {cuisine}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Restaurant Info */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="mb-8 border-b border-gray-200">
              <nav className="flex space-x-8">
                {['menu', 'about', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'reviews' && (
                      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {totalReviews || 0}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'menu' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
                  <div className="text-sm text-gray-600">
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
                  <LoadingSpinner />
                ) : dishes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-600">No dishes available yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dishes.map(dish => (
                      <DishCard key={dish._id || dish.id} dish={dish} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About {name}</h3>
                <p className="text-gray-700 mb-6">{description || 'No description available.'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {address || 'Address not available'}
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {phone || 'Phone not available'}
                      </li>
                      {email && (
                        <li className="flex items-center">
                          <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89-5.26a2 2 0 012.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2