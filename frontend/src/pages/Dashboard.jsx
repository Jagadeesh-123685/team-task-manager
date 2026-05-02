import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const nav = useNavigate();

  const load = async () => {
    const [p, t] = await Promise.all([api.projects.list(), api.tasks.list()]);
    setProjects(p); setAllTasks(t);
  };

  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault(); setError('');
    try { await api.projects.create(form); setForm({ name: '', description: '' }); setShowNew(false); load(); }
    catch (err) { setError(err.message); }
  };

  const del = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.projects.delete(id); load();
  };

  const stats = { total: allTasks.length, done: allTasks.filter(t => t.status === 'done').length, inprog: allTasks.filter(t => t.status === 'in_progress').length };

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <span style={s.navBrand}><span style={s.logo}>TTM</span> Team Task Manager</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--text2)', fontSize: 14 }}>👤 {user?.name}</span>
          <button className="btn btn-ghost" style={{ padding: '6px 14px' }} onClick={logout}>Logout</button>
        </div>
      </nav>

      <div style={s.main} className="fade-in">
        <div style={s.header}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>Dashboard</h2>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>Manage your projects and tasks</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Project</button>
        </div>

        <div style={s.statsRow}>
          {[['Projects', projects.length, '#6c63ff'], ['Total Tasks', stats.total, '#ffa040'], ['In Progress', stats.inprog, '#6c63ff'], ['Completed', stats.done, '#43e97b']].map(([l, v, c]) => (
            <div key={l} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: c, fontFamily: 'var(--font-mono)' }}>{v}</div>
              <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {showNew && (
          <div style={s.modal}>
            <div className="card fade-in" style={{ width: '100%', maxWidth: 480 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>New Project</h3>
              <form onSubmit={createProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={s.label}>Project Name *</label>
                  <input className="input" placeholder="e.g. Website Redesign" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label style={s.label}>Description</label>
                  <textarea className="input" placeholder="What is this project about?" rows={3} style={{ resize: 'vertical' }}
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>ALL PROJECTS</h3>
        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p>No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div style={s.grid}>
            {projects.map(p => {
              const pTasks = allTasks.filter(t => t.project_id === p.id);
              const done = pTasks.filter(t => t.status === 'done').length;
              const pct = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
              return (
                <div key={p.id} className="card" style={s.projectCard} onClick={() => nav(`/projects/${p.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</h4>
                    <span className={`badge badge-${p.status}`}>{p.status}</span>
                  </div>
                  {p.description && <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 14 }}>{p.description}</p>}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                      <span>{done}/{pTasks.length} tasks</span><span>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={e => del(p.id, e)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  nav: { background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 },
  navBrand: { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 15 },
  logo: { background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 5 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  projectCard: { cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', ':hover': { borderColor: 'var(--accent)' } },
  label: { display: 'block', fontSize: 13, color: 'var(--text2)', marginBottom: 6, fontWeight: 500 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 100 },
};
