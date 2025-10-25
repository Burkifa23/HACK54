// Protected route component for role-based access control

import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../utils/types';

interface ProtectedRouteProps {
  user: User | null;
  requiredRole?: UserRole;
  children: React.ReactNode;
}

export function ProtectedRoute({ user, requiredRole, children }: ProtectedRouteProps) {
  // If no user and route requires authentication
  if (!user && requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required role
  if (user && requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
