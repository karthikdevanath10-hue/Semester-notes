import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        color: 'var(--text-secondary)'
      }}>
        <div className="spinner">Loading authorization...</div>
      </div>
    );
  }

  // Only allow admin role to pass through to /admin
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
