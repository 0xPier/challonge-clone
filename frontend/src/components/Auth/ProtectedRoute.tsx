import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'superuser';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'superuser') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-8 max-w-md">
          <h2 className="text-2xl font-heading font-semibold text-white mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-slate-300/80">
            You don't have permission to access this page. Contact an administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
