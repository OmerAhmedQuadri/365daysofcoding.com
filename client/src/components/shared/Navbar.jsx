import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-14 border-b border-gray-200 bg-white flex items-center px-6 gap-4">
      <Link to="/" className="font-semibold text-indigo-600 text-lg tracking-tight">
        HelloJS
      </Link>
      <div className="flex-1" />
      <span className="text-sm text-gray-600">{user?.name}</span>
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        Sign out
      </button>
    </nav>
  );
}
