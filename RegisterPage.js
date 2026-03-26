import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Eye, EyeOff, TrendingUp, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', role: 'User' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('All fields are required'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) { setError('Please enter a valid email address'); return; }

    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password, role: form.role });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const pw = form.password;
    if (!pw) return null;
    if (pw.length < 6) return { label: 'Weak', color: 'var(--red)', width: '30%' };
    if (pw.length < 8 || !/[0-9]/.test(pw)) return { label: 'Fair', color: 'var(--yellow)', width: '60%' };
    return { label: 'Strong', color: 'var(--green)', width: '100%' };
  };

  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" style={{ maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, justifyContent: 'center' }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={26} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#f1f5f9,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StockFlow IMS</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>Inventory Management System</p>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ShieldCheck size={20} color="var(--green)" />
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Secure Registration</h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Your data is stored securely', 'Role-based access control', 'JWT token authentication', 'Password hashing with BCrypt'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--accent-light)' }}>Demo Credentials</strong><br />
              Admin: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>admin / Admin@123</span><br />
              User: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>john_doe / John@123</span>
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create account</h2>
          <p>Fill in the details below to get started</p>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input name="username" value={form.username} onChange={handleChange}
                  className="form-input input-with-icon" placeholder="Choose a username" autoComplete="username" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className="form-input input-with-icon" placeholder="your@email.com" autoComplete="email" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="form-input form-select">
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  className="form-input input-with-icon input-with-right-icon" placeholder="At least 6 characters" autoComplete="new-password" />
                <button type="button" className="input-icon-right" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: 11, color: strength.color, marginTop: 4, display: 'block' }}>Password strength: {strength.label}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange}
                  className="form-input input-with-icon" placeholder="Repeat your password" autoComplete="new-password" />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
