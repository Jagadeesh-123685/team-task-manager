import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(form.email, form.password); nav('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box} className="fade-in">
        <div style={styles.brand}>
          <span style={styles.logo}>TTM</span>
          <h1 style={styles.title}>Team Task Manager</h1>
          <p style={styles.sub}>Sign in to your workspace</p>
        </div>
        <form onSubmit={handle} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>No account? <Link to="/register" style={{ color: '#6c63ff' }}>Register</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 },
  box: { width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 40 },
  brand: { textAlign: 'center', marginBottom: 32 },
  logo: { display: 'inline-block', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 6, letterSpacing: 2, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 600, marginBottom: 6 },
  sub: { color: 'var(--text2)', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, color: 'var(--text2)', fontWeight: 500 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' },
};
