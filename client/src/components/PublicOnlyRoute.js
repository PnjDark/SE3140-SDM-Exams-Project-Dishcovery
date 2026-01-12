import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    if (user.role === 'owner') {
      return <Navigate to="/dashboard/owner" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;