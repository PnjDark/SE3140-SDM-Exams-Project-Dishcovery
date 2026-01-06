// client/src/context/DishContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const DishContext = createContext();

export const useDish = () => {
  const context = useContext(DishContext);
  if (!context) {
    throw new Error('useDish must be used within a DishProvider');
  }
  return context;
};

export const DishProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);
  const [currentDish, setCurrentDish] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 100,
    minRating: 0,
    restaurantId: '',
    sortBy: 'popularity',
    sortOrder: 'desc'
  });

  const fetchDishes = useCallback(async (queryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        ...filters,
        ...queryParams,
        page: queryParams.page || 1,
        limit: queryParams.limit || 20
      }).toString();

      const response = await fetch(`/api/dishes?${params}`);
      const data = await response.json();

      if (data.success) {
        setDishes(data.data.dishes || []);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to fetch dishes');
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

  const fetchDishById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dishes/${id}`);
      const data = await response.json();

      if (data.success) {
        setCurrentDish(data.data);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Dish not found');
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

  const searchDishes = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dishes/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success) {
        setDishes(data.data || []);
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

  const fetchDishesByRestaurant = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/dishes/restaurant/${restaurantId}`);
      const data = await response.json();

      if (data.success) {
        setDishes(data.data || []);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to fetch restaurant dishes');
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

  const createDish = useCallback(async (dishData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dishData)
      });

      const data = await response.json();

      if (data.success) {
        setDishes(prev => [data.data, ...prev]);
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to create dish');
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

  const updateDish = useCallback(async (id, dishData) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dishes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dishData)
      });

      const data = await response.json();

      if (data.success) {
        setDishes(prev => prev.map(dish => 
          dish._id === id ? data.data : dish
        ));
        if (currentDish?._id === id) {
          setCurrentDish(data.data);
        }
        return { success: true, data: data.data };
      } else {
        setError(data.error || 'Failed to update dish');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentDish]);

  const deleteDish = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dishes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDishes(prev => prev.filter(dish => dish._id !== id));
        if (currentDish?._id === id) {
          setCurrentDish(null);
        }
        return { success: true };
      } else {
        setError(data.error || 'Failed to delete dish');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [currentDish]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentDish = useCallback(() => {
    setCurrentDish(null);
  }, []);

  const value = {
    dishes,
    currentDish,
    loading,
    error,
    filters,
    fetchDishes,
    fetchDishById,
    searchDishes,
    fetchDishesByRestaurant,
    createDish,
    updateDish,
    deleteDish,
    updateFilters,
    clearError,
    clearCurrentDish
  };

  return (
    <DishContext.Provider value={value}>
      {children}
    </DishContext.Provider>
  );
};