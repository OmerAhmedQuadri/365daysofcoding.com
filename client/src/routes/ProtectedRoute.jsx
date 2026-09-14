import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import ServerUnavailable from '../components/shared/ServerUnavailable.jsx';

export default function ProtectedRoute({ children }) {
  const { user, isLoading, authError, retryAuth, logout } = useAuth();

  if (isLoading) return null;
  if (authError) return <ServerUnavailable message={authError} onRetry={retryAuth} onSignOut={logout} />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
