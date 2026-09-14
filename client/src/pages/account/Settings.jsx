import { motion } from 'framer-motion';
import Navbar from '../../components/shared/Navbar.jsx';

// Placeholder until account settings exist. Any password or account endpoint added later
// must reject the demo account (see CLAUDE.md, "Demo account").
export default function Settings() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-3xl mx-auto px-4 py-10"
      >
        <h1 className="text-2xl font-semibold text-fg">Settings</h1>
        <p className="mt-1 mb-8 text-sm text-fg-muted">Manage your account.</p>

        <div className="rounded-xl border border-line bg-surface px-5 py-10 text-center">
          <p className="text-sm font-medium text-fg">Nothing to change yet</p>
          <p className="mt-1 text-sm text-fg-muted">Password changes and preferences are coming soon.</p>
        </div>
      </motion.main>
    </div>
  );
}
