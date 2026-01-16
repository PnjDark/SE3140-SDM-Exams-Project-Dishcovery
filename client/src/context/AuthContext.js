import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { redirect } from 'react-router-dom';


const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

   // Initialize auth from localStorage
  const initializeAuth = useCallback(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);

        // Clear any saved redirect path
        localStorage.removeItem('redirectAfterLogin');

        return {  success: true, 
                  user: data.user,
                  redirectTo: data.user.role === 'owner' ? '/dashboard/owner' : '/dashboard'};
      } else {
        setError(data.error || 'Login failed');
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        
        return { 
          success: true, 
          user: data.user,
          redirectTo: data.user.role === 'owner' ? '/dashboard/owner' : '/dashboard'
        };
      } else {
        setError(data.error || 'Registration failed');
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    // Save current path for potential redirect after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/register') {
      localStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        setError(data.error || 'Profile update failed');
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (error) {
      const errorMsg = error.message || 'Network error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const getRedirectPath = () => {
    // Check if there's a saved redirect path
    const savedPath = localStorage.getItem('redirectAfterLogin');
    if (savedPath) {
      localStorage.removeItem('redirectAfterLogin');
      return savedPath;
    }
    
    // Default redirect based on role
    if (user?.role === 'owner') {
      return '/dashboard/owner';
    }
    return '/dashboard';
  };

  useEffect(() => {
 if(user) redirect("/dashboard");
}, [user])


  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    getRedirectPath,
    error,
    clearError,
    isAuthenticated: !!user && !!token,
    isOwner: user?.role === 'owner',
    isCustomer: user?.role === 'customer' || !!user?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};