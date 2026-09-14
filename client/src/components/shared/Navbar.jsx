import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import Brand from './Brand.jsx';
import UserMenu from './UserMenu.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-14 border-b border-line bg-surface flex items-center px-6 gap-3">
      <Link to="/">
        <Brand />
      </Link>
      <div className="flex-1" />
      {user?.is_demo && (
        <span
          title="Everyone trying the app shares this account. Progress is shared, and your code resets when you leave a lab."
          className="text-xs font-medium border rounded-full px-2 py-0.5 bg-amber-500/10 text-amber-300 border-amber-500/30"
        >
          Demo account · code isn&apos;t saved
        </span>
      )}
      <UserMenu />
      <button
        onClick={logout}
        className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium text-fg-muted hover:bg-raised hover:text-fg transition-colors"
      >
        Sign out
      </button>
    </nav>
  );
}
