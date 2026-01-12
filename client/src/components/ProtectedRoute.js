import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireOwner = false }) => {
  const { user, loading, isOwner } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireOwner && !isOwner) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;