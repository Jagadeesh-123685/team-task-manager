import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high'];

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const [p, u] = await Promise.all([api.projects.get(id), api.users.list()]);
    setProject(p); setTasks(p.tasks || []); setUsers(u);
  };

  useEffect(() => { load(); }, [id]);

  const resetForm = () => setForm({ title: '', description: '', status: 'todo', priority: 'medium', assignee_id: '', due_date: '' });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editTask) { await api.tasks.update(editTask.id, { ...form, project_id: +id }); setEditTask(null); }
      else { await api.tasks.create({ ...form, project_id: +id }); setShowNew(false); }
      resetForm(); load();
    } catch (err) { setError(err.message); }
  };

  const openEdit = (t) => { setEditTask(t); setForm({ title: t.title, description: t.description||'', status: t.status, priority: t.priority, assignee_id: t.assignee_id||'', due_date: t.due_date||'' }); };
  const quickStatus = async (t, status) => { await api.tasks.update(t.id, { ...t, status }); load(); };
  const del = async (id) => { if (confirm('Delete task?')) { await api.tasks.delete(id); load(); } };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (!project) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading…</div>;

  const TaskForm = ({ onClose }) => (
    <div style={s.modal}>
      <div className="card fade-in" style={{ width: '100%', maxWidth: 520 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>{editTask ? 'Edit Task' : 'New Task'}</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={s.label}>Title *</label>
            <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
          <div><label style={s.label}>Description</label>
            <textarea className="input" rows={2} style={{ resize: 'vertical' }} placeholder="Details…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={s.label}>Status</label>
              <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select></div>
            <div><label style={s.label}>Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={s.label}>Assignee</label>
              <select className="input" value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select></div>
            <div><label style={s.label}>Due Date</label>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => nav('/')}>← Back</button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontWeight: 600 }}>{project.name}</span>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditTask(null); setShowNew(true); }}>+ Add Task</button>
      </nav>

      <div style={s.main} className="fade-in">
        {project.description && <p style={{ color: 'var(--text2)', marginBottom: 24 }}>{project.description}</p>}

        <div style={s.filters}>
          {['all', ...STATUSES].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setFilter(f)}>
              {f === 'all' ? `All (${tasks.length})` : `${f.replace('_', ' ')} (${tasks.filter(t => t.status === f).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
            <p>{filter === 'all' ? 'No tasks yet. Add your first!' : `No ${filter.replace('_', ' ')} tasks.`}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(t => (
              <div key={t.id} className="card" style={s.taskRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                  <button style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${t.status === 'done' ? '#43e97b' : 'var(--border)'}`, background: t.status === 'done' ? '#43e97b' : 'transparent', cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => quickStatus(t, t.status === 'done' ? 'todo' : 'done')} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, textDecoration: t.status === 'done' ? 'line-through' : 'none', color: t.status === 'done' ? 'var(--text2)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {t.assignee_name && <span style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 20 }}>👤 {t.assignee_name}</span>}
                  {t.due_date && <span style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{t.due_date}</span>}
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                  <span className={`badge badge-${t.status}`}>{t.status.replace('_',' ')}</span>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(t)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => del(t.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showNew || editTask) && <TaskForm onClose={() => { setShowNew(false); setEditTask(null); resetForm(); }} />}
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  nav: { background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  taskRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', transition: 'border-color 0.2s' },
  label: { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 },
};
