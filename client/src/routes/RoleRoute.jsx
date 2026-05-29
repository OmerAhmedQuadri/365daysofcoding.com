import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function RoleRoute({ children, roles }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}
