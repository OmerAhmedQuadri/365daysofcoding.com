import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login as apiLogin, demoLogin } from '../../api/auth.js';
import useAuth from '../../hooks/useAuth.js';
import Brand from '../../components/shared/Brand.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startingDemo, setStartingDemo] = useState(false);
  const busy = submitting || startingDemo;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { token } = await apiLogin(form);
      login(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTryNow() {
    setError('');
    setStartingDemo(true);
    try {
      const { token } = await demoLogin();
      login(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setStartingDemo(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-line p-8"
      >
        <div className="mb-6">
          <Brand />
        </div>

        <h1 className="text-2xl font-semibold text-fg mb-6">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand-500 text-brand-950 rounded-lg py-2 text-sm font-medium hover:bg-brand-400 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-fg-subtle">or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <motion.button
          type="button"
          onClick={handleTryNow}
          disabled={busy}
          whileTap={{ scale: 0.98 }}
          className="w-full border border-brand-500/30 bg-brand-500/10 text-brand-300 rounded-lg py-2 text-sm font-medium hover:bg-brand-500/20 disabled:opacity-50 transition-colors"
        >
          {startingDemo ? 'Starting demo…' : 'Try now'}
        </motion.button>
        <p className="mt-2 text-xs text-fg-subtle text-center">
          No sign-up needed. Uses a shared demo account.
        </p>

        <p className="mt-4 text-sm text-fg-muted text-center">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
