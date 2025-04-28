import React from 'react';
import { useAuth } from './context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    console.log(`ProtectedRoute: Acesso negado a ${location.pathname}. Redirecionando para /login.`);

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
