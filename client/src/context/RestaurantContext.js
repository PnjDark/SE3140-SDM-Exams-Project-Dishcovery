// client/src/context/RestaurantContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    cuisine: '',
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    distance: 10,
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  const fetchRestaurants = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...filters,
        ...queryParams,
        page: queryParams.page || 1,
        limit: queryParams.limit || 12
      }).toString();

      const response = await fetch(`/api/restaurants?${params}`);
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data.restaurants || []);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to fetch restaurants');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchRestaurantById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/restaurants/${id}`);
      const data = await response.json();

      if (data.success) {
        setCurrentRestaurant(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Restaurant not found');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRestaurants = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/restaurants/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success) {
        setRestaurants(data.data || []);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Search failed');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const createRestaurant = useCallback(async (restaurantData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(restaurantData)
      });

      const data = await response.json();

      if (data.success) {
        setRestaurants(prev => [data.data, ...prev]);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to create restaurant');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRestaurant = useCallback(async (id, restaurantData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(restaurantData)
      });

      const data = await response.json();

      if (data.success) {
        setRestaurants(prev => prev.map(rest => 
          rest._id === id ? data.data : rest
        ));
        if (currentRestaurant?._id === id) {
          setCurrentRestaurant(data.data);
        }
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to update restaurant');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentRestaurant]);

  const deleteRestaurant = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRestaurants(prev => prev.filter(rest => rest._id !== id));
        if (currentRestaurant?._id === id) {
          setCurrentRestaurant(null);
        }
        return { success: true };
      } else {
        setError(data.error || 'Failed to delete restaurant');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentRestaurant]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentRestaurant = useCallback(() => {
    setCurrentRestaurant(null);
  }, []);

  const value = {
    restaurants,
    currentRestaurant,
    loading,
    error,
    filters,
    fetchRestaurants,
    fetchRestaurantById,
    searchRestaurants,
    updateFilters,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    clearError,
    clearCurrentRestaurant
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};

