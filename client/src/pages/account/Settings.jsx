import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { changePassword } from '../../api/auth.js';
import useAuth from '../../hooks/useAuth.js';
import Navbar from '../../components/shared/Navbar.jsx';
import PasswordInput from '../../components/shared/PasswordInput.jsx';

const MIN_PASSWORD_LENGTH = 8;
const EMPTY_FORM = { current_password: '', new_password: '', confirm_password: '' };
const FIELDS = [
  { name: 'current_password', label: 'Current password', autoComplete: 'current-password' },
  { name: 'new_password', label: 'New password', autoComplete: 'new-password' },
  { name: 'confirm_password', label: 'Confirm new password', autoComplete: 'new-password' },
];

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.new_password !== form.confirm_password) {
      setError("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ current_password: form.current_password, new_password: form.new_password });
      setForm(EMPTY_FORM);
      setSuccess('Password updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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

        <section className="rounded-xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold text-fg">Change password</h2>

          {user?.is_demo ? (
            <p className="mt-2 text-sm text-fg-muted">
              The shared demo account&apos;s password can&apos;t be changed.{' '}
              <Link to="/register" className="text-brand-400 hover:underline">
                Create your own account
              </Link>{' '}
              to set your own password.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 max-w-sm space-y-4">
              {FIELDS.map((field) => (
                <div key={field.name}>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={field.name} className="block text-sm font-medium text-fg-muted">
                      {field.label}
                    </label>
                    {field.name === 'current_password' && (
                      <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">
                        Forgot it?
                      </Link>
                    )}
                  </div>
                  <PasswordInput
                    id={field.name}
                    name={field.name}
                    required
                    autoComplete={field.autoComplete}
                    minLength={field.name === 'current_password' ? undefined : MIN_PASSWORD_LENGTH}
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
              <p className="text-xs text-fg-subtle">Use at least {MIN_PASSWORD_LENGTH} characters.</p>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-brand-400">
                  {success}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="bg-brand-500 text-brand-950 rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-400 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </section>
      </motion.main>
    </div>
  );
}
