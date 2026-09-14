import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourses } from '../../api/courses.js';
import { createCourse, updateCourse, deleteCourse } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';

const EMPTY = { title: '', description: '', order_index: 0 };

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(course) {
    setEditingId(course.id);
    setForm({ title: course.title, description: course.description, order_index: course.order_index });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function field(key) {
    return (e) => setForm(f => ({ ...f, [key]: key === 'order_index' ? Number(e.target.value) : e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateCourse(editingId, form);
        setCourses(prev => prev.map(c => c.id === editingId ? { ...c, ...updated } : c));
      } else {
        const created = await createCourse(form);
        setCourses(prev => [...prev, { ...created, topic_count: 0 }]);
      }
      closeForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course and all its topics, labs, and test cases?')) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-xs text-brand-400 hover:underline">← Admin</Link>
            <h1 className="text-2xl font-semibold text-fg mt-1">Courses</h1>
          </div>
          {!showForm && (
            <button
              onClick={openNew}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 text-brand-950 transition-colors"
            >
              + New Course
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 rounded-xl border border-brand-500/30 bg-surface p-5"
          >
            <h2 className="text-sm font-semibold text-fg mb-4">
              {editingId ? 'Edit Course' : 'New Course'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-fg-muted mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={field('title')}
                    required
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="e.g. JavaScript Fundamentals"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={field('order_index')}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={field('description')}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Short description"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-lg text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-line animate-pulse" />)}
          </div>
        ) : courses.length === 0 ? (
          <p className="text-sm text-fg-subtle text-center py-10">No courses yet.</p>
        ) : (
          <div className="space-y-2">
            {courses.map(course => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{course.title}</p>
                  {course.description && (
                    <p className="text-xs text-fg-subtle truncate">{course.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-fg-subtle tabular-nums">#{course.order_index}</span>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to={`/admin/courses/${course.id}/topics`}
                    className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Topics →
                  </Link>
                  <button
                    onClick={() => openEdit(course)}
                    className="text-xs text-fg-muted hover:text-fg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
