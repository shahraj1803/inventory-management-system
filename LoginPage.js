import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, TrendingUp, Package, BarChart3, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (username, password) => {
    setForm({ username, password });
    setLoading(true);
    try {
      await login({ username, password });
      toast.success(`Logged in as ${username}`);
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" style={{ maxWidth: 480 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={26} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StockFlow IMS</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>Inventory Management System</p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 36px' }}>
            A powerful, modern inventory management platform to track your products, categories, and stock levels in real time.
          </p>
          <div className="auth-features">
            {[
              { icon: Package, label: 'Product Management', desc: 'Add, edit, and track all your inventory' },
              { icon: BarChart3, label: 'Analytics Dashboard', desc: 'Visual insights into your stock data' },
              { icon: Shield, label: 'Role-Based Access', desc: 'Secure multi-user authentication' },
            ].map(({ icon: Icon, label, desc }) => (
              <div className="auth-feature" key={label}>
                <div className="auth-feature-icon"><Icon size={18} color="var(--accent-light)" /></div>
                <div className="auth-feature-text"><h4>{label}</h4><p>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input name="username" value={form.username} onChange={handleChange}
                  className="form-input input-with-icon" placeholder="Enter your username" autoComplete="username" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  className="form-input input-with-icon input-with-right-icon" placeholder="Enter your password" autoComplete="current-password" />
                <button type="button" className="input-icon-right" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="divider" style={{ position: 'relative', textAlign: 'center' }}>
            <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'var(--bg-card)', padding: '0 10px', fontSize: 12, color: 'var(--text-muted)' }}>OR TRY DEMO</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => demoLogin('admin', 'Admin@123')} disabled={loading} style={{ fontSize: 13 }}>
              👑 Admin Demo
            </button>
            <button className="btn btn-secondary" onClick={() => demoLogin('john_doe', 'John@123')} disabled={loading} style={{ fontSize: 13 }}>
              👤 User Demo
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
