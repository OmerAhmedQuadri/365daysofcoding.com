import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  listBootcamps,
  createBootcamp,
  getBootcampDetail,
  addBootcampMember,
  removeBootcampMember,
  assignLabToBootcamp,
  removeBootcampLab,
} from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';

function Msg({ msg }) {
  if (!msg) return null;
  return (
    <p className={`text-xs mt-2 ${msg.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
      {msg.text}
    </p>
  );
}

const ROLE_STYLE = {
  instructor: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
  student:    'bg-blue-500/10 text-blue-300 border-blue-500/30',
};

export default function ManageBootcamps() {
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create bootcamp form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  // Management panel
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [panelMsg, setPanelMsg] = useState(null);

  // Add member form
  const [memberForm, setMemberForm] = useState({ email: '', member_role: 'student' });
  const [addingMember, setAddingMember] = useState(false);

  // Assign lab form
  const [labIdInput, setLabIdInput] = useState('');
  const [assigningLab, setAssigningLab] = useState(false);

  useEffect(() => {
    listBootcamps()
      .then(setBootcamps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function showCreateMsg(type, text) {
    setCreateMsg({ type, text });
    setTimeout(() => setCreateMsg(null), 3500);
  }

  function showPanelMsg(type, text) {
    setPanelMsg({ type, text });
    setTimeout(() => setPanelMsg(null), 3500);
  }

  async function handleSelectBootcamp(id) {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    setSelectedId(id);
    setDetail(null);
    setPanelMsg(null);
    setMemberForm({ email: '', member_role: 'student' });
    setLabIdInput('');
    setDetailLoading(true);
    try {
      const data = await getBootcampDetail(id);
      setDetail(data);
    } catch (err) {
      showPanelMsg('error', err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleCreateBootcamp(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createBootcamp(createForm);
      setBootcamps(prev => [{ ...created, member_count: 0 }, ...prev]);
      setCreateForm({ name: '', description: '' });
      setShowCreate(false);
      showCreateMsg('success', `Bootcamp "${created.name}" created.`);
    } catch (err) {
      showCreateMsg('error', err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleAddMember(e) {
    e.preventDefault();
    if (!selectedId) return;
    setAddingMember(true);
    try {
      await addBootcampMember(selectedId, memberForm);
      const updated = await getBootcampDetail(selectedId);
      setDetail(updated);
      setBootcamps(prev => prev.map(b =>
        b.id === selectedId ? { ...b, member_count: updated.members.length } : b,
      ));
      setMemberForm({ email: '', member_role: 'student' });
      showPanelMsg('success', 'Member added.');
    } catch (err) {
      showPanelMsg('error', err.message);
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(userId) {
    if (!selectedId) return;
    try {
      await removeBootcampMember(selectedId, userId);
      setDetail(prev => ({ ...prev, members: prev.members.filter(m => m.user_id !== userId) }));
      setBootcamps(prev => prev.map(b =>
        b.id === selectedId ? { ...b, member_count: b.member_count - 1 } : b,
      ));
      showPanelMsg('success', 'Member removed.');
    } catch (err) {
      showPanelMsg('error', err.message);
    }
  }

  async function handleAssignLab(e) {
    e.preventDefault();
    if (!selectedId || !labIdInput.trim()) return;
    setAssigningLab(true);
    try {
      await assignLabToBootcamp(selectedId, { lab_id: labIdInput.trim() });
      const updated = await getBootcampDetail(selectedId);
      setDetail(updated);
      setLabIdInput('');
      showPanelMsg('success', 'Lab assigned.');
    } catch (err) {
      showPanelMsg('error', err.message);
    } finally {
      setAssigningLab(false);
    }
  }

  async function handleRemoveLab(labId) {
    if (!selectedId) return;
    try {
      await removeBootcampLab(selectedId, labId);
      setDetail(prev => ({
        ...prev,
        bootcamp_labs: prev.bootcamp_labs.filter(bl => bl.lab_id !== labId),
      }));
      showPanelMsg('success', 'Lab removed.');
    } catch (err) {
      showPanelMsg('error', err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/admin" className="text-xs text-brand-400 hover:underline">← Admin</Link>
            <h1 className="text-2xl font-semibold text-fg mt-1">Bootcamps</h1>
          </div>
          {!showCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 text-brand-950 transition-colors"
            >
              + New Bootcamp
            </button>
          )}
        </div>

        {/* Create form */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 rounded-xl border border-brand-500/30 bg-surface p-5"
          >
            <h2 className="text-sm font-semibold text-fg mb-4">New Bootcamp</h2>
            <form onSubmit={handleCreateBootcamp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">Name</label>
                <input
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Summer 2025 Cohort"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">Description</label>
                <input
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setCreateForm({ name: '', description: '' }); }}
                  className="px-4 py-2 rounded-lg text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  Cancel
                </button>
              </div>
              <Msg msg={createMsg} />
            </form>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-line animate-pulse" />)}
          </div>
        ) : bootcamps.length === 0 ? (
          <p className="text-sm text-fg-subtle text-center py-10">No bootcamps yet.</p>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {bootcamps.map(bc => (
              <motion.div
                key={bc.id}
                variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}
                className={`rounded-xl border bg-surface overflow-hidden transition-colors ${selectedId === bc.id ? 'border-brand-500/50' : 'border-line'}`}
              >
                {/* Bootcamp header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg">{bc.name}</p>
                    {bc.description && (
                      <p className="text-xs text-fg-subtle truncate">{bc.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-fg-subtle tabular-nums">
                    {bc.member_count} member{bc.member_count !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={() => handleSelectBootcamp(bc.id)}
                    className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedId === bc.id
                        ? 'border-brand-500/50 bg-brand-500/10 text-brand-300'
                        : 'border-line text-fg-muted hover:border-brand-500/50 hover:text-brand-300'
                    }`}
                  >
                    {selectedId === bc.id ? 'Close ✕' : 'Manage ▼'}
                  </button>
                </div>

                {/* Management panel */}
                <AnimatePresence>
                  {selectedId === bc.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line px-4 py-4 space-y-5">

                        {panelMsg && (
                          <div className={`rounded-lg px-3 py-2 text-xs border ${panelMsg.type === 'error' ? 'bg-red-500/10 text-red-300 border-red-500/30' : 'bg-green-500/10 text-green-300 border-green-500/30'}`}>
                            {panelMsg.text}
                          </div>
                        )}

                        {detailLoading ? (
                          <div className="space-y-2">
                            {[1, 2].map(i => <div key={i} className="h-8 rounded-lg bg-raised animate-pulse" />)}
                          </div>
                        ) : detail ? (
                          <>
                            {/* Members */}
                            <section>
                              <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">
                                Members ({detail.members.length})
                              </h3>
                              <div className="space-y-1.5 mb-3">
                                {detail.members.length === 0 ? (
                                  <p className="text-xs text-fg-subtle">No members yet.</p>
                                ) : (
                                  detail.members.map(m => (
                                    <div key={m.user_id} className="flex items-center gap-2 text-sm">
                                      <span className="flex-1 min-w-0">
                                        <span className="font-medium text-fg">{m.user.name}</span>
                                        <span className="text-fg-subtle ml-1.5 text-xs">{m.user.email}</span>
                                      </span>
                                      <span className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${ROLE_STYLE[m.member_role]}`}>
                                        {m.member_role}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveMember(m.user_id)}
                                        className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                              {/* Add member form */}
                              <form onSubmit={handleAddMember} className="flex gap-2">
                                <input
                                  type="email"
                                  value={memberForm.email}
                                  onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))}
                                  required
                                  placeholder="student@example.com"
                                  className="flex-1 min-w-0 rounded-lg border border-line px-3 py-1.5 text-xs focus:outline-none focus:border-brand-500"
                                />
                                <select
                                  value={memberForm.member_role}
                                  onChange={e => setMemberForm(f => ({ ...f, member_role: e.target.value }))}
                                  className="rounded-lg border border-line px-2 py-1.5 text-xs focus:outline-none focus:border-brand-500"
                                >
                                  <option value="student">Student</option>
                                  <option value="instructor">Instructor</option>
                                </select>
                                <button
                                  type="submit"
                                  disabled={addingMember}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                                >
                                  {addingMember ? '…' : 'Add'}
                                </button>
                              </form>
                            </section>

                            {/* Assigned Labs */}
                            <section>
                              <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wide mb-2">
                                Assigned Labs ({detail.bootcamp_labs.length})
                              </h3>
                              <div className="space-y-1.5 mb-3">
                                {detail.bootcamp_labs.length === 0 ? (
                                  <p className="text-xs text-fg-subtle">No labs assigned yet.</p>
                                ) : (
                                  detail.bootcamp_labs.map(bl => (
                                    <div key={bl.lab_id} className="flex items-center gap-2 text-sm">
                                      <span className="flex-1 min-w-0 text-fg text-xs truncate">
                                        {bl.lab.title}
                                      </span>
                                      <span className="shrink-0 text-xs text-fg-subtle font-mono">
                                        {bl.lab_id.slice(0, 8)}…
                                      </span>
                                      <button
                                        onClick={() => handleRemoveLab(bl.lab_id)}
                                        className="shrink-0 text-xs text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                              {/* Assign lab form */}
                              <form onSubmit={handleAssignLab} className="flex gap-2">
                                <input
                                  value={labIdInput}
                                  onChange={e => setLabIdInput(e.target.value)}
                                  required
                                  placeholder="Paste lab UUID"
                                  className="flex-1 min-w-0 rounded-lg border border-line px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-brand-500"
                                />
                                <button
                                  type="submit"
                                  disabled={assigningLab}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                                >
                                  {assigningLab ? '…' : 'Assign'}
                                </button>
                              </form>
                            </section>
                          </>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
