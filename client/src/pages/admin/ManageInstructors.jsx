import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listInstructors, createInstructor } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';

const EMPTY = { name: '', email: '', password: '' };

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm border ${msg.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-green-500/10 text-green-300 border-green-500/30'}`}>
      {msg.text}
    </div>
  );
}

export default function ManageInstructors() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    listInstructors()
      .then(setInstructors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  }

  function field(key) {
    return (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createInstructor(form);
      setInstructors(prev => [created, ...prev]);
      setForm(EMPTY);
      setShowForm(false);
      showMsg('success', `Instructor "${created.name}" created.`);
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-xs text-brand-400 hover:underline">← Admin</Link>
            <h1 className="text-2xl font-semibold text-fg mt-1">Instructors</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 text-brand-950 transition-colors"
            >
              + New Instructor
            </button>
          )}
        </div>

        <Msg msg={msg} />

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 rounded-xl border border-brand-500/30 bg-surface p-5"
          >
            <h2 className="text-sm font-semibold text-fg mb-4">New Instructor</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1">Name</label>
                  <input
                    value={form.name}
                    onChange={field('name')}
                    required
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={field('email')}
                    required
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={field('password')}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Min 6 characters"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                >
                  {saving ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY); }}
                  className="px-4 py-2 rounded-lg text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-line animate-pulse" />)}
          </div>
        ) : instructors.length === 0 ? (
          <p className="text-sm text-fg-subtle text-center py-10">No instructors yet.</p>
        ) : (
          <motion.div
            className="space-y-2"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {instructors.map(u => (
              <motion.div
                key={u.id}
                variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg">{u.name}</p>
                  <p className="text-xs text-fg-subtle">{u.email}</p>
                </div>
                <span className="shrink-0 text-xs text-fg-subtle">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

      </main>
    </div>
  );
}
