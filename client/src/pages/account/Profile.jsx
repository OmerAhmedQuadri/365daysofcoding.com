import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth.js';
import Navbar from '../../components/shared/Navbar.jsx';

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <dt className="text-sm text-fg-subtle">{label}</dt>
      <dd className="truncate text-right text-sm text-fg">{value}</dd>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const role = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : '—';
  // The shared demo account always reads as new to whoever is using it
  const memberSince = user?.is_demo
    ? 'Today'
    : user?.created_at
      ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl mx-auto px-4 py-10"
      >
        <h1 className="text-2xl font-semibold text-fg">Profile</h1>
        <p className="mt-1 mb-8 text-sm text-fg-muted">Your account details.</p>

        {user?.is_demo && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
            You&apos;re using the shared demo account.{' '}
            <Link to="/register" className="font-medium underline hover:text-amber-200">
              Create your own account
            </Link>{' '}
            now and start saving your progress.
          </div>
        )}

        <dl className="divide-y divide-line rounded-xl border border-line bg-surface">
          <Row label="Name" value={user?.name} />
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={role} />
          <Row label="Member since" value={memberSince} />
        </dl>
      </motion.main>
    </div>
  );
}
