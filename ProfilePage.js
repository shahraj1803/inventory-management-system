import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { User, Mail, Shield, Camera, Lock, Eye, EyeOff, Check, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_OPTIONS = [
  'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128',
  'https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff&size=128',
  'https://ui-avatars.com/api/?name=Manager&background=f59e0b&color=fff&size=128',
  'https://ui-avatars.com/api/?name=Staff&background=ef4444&color=fff&size=128',
  'https://ui-avatars.com/api/?name=Owner&background=8b5cf6&color=fff&size=128',
  'https://ui-avatars.com/api/?name=Team&background=3b82f6&color=fff&size=128',
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', email: '', profileImage: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ cur: false, new: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatars, setShowAvatars] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data);
      setProfileForm({ username: res.data.username, email: res.data.email, profileImage: res.data.profileImage || '' });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleProfileSave = async () => {
    setError(''); setSuccess('');
    if (!profileForm.username.trim() || !profileForm.email.trim()) { setError('Username and email are required'); return; }
    setSaving(true);
    try {
      const res = await userAPI.updateProfile(profileForm);
      setProfile(res.data.data);
      updateUser({ ...user, username: res.data.data.username, email: res.data.data.email, profileImage: res.data.data.profileImage });
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      toast.success('Profile updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    setError(''); setSuccess('');
    if (!pwForm.currentPassword || !pwForm.newPassword) { setError('All fields are required'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div className="slide-up">
      <div className="page-header">
        <div><h2>My Profile</h2><p>Manage your account settings and preferences</p></div>
      </div>

      <div className="profile-grid">
        {/* Left: Avatar Card */}
        <div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <img
                src={profileForm.profileImage || profile?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&background=6366f1&color=fff&size=128`}
                alt="Profile"
                className="profile-avatar"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&background=6366f1&color=fff&size=128`; }}
              />
              <button
                style={{ position: 'absolute', bottom: 4, right: 4, width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => setShowAvatars(v => !v)} title="Change avatar">
                <Camera size={14} color="white" />
              </button>
            </div>
            <div className="profile-name">{profile?.username}</div>
            <div className="profile-role">{profile?.email}</div>
            <div style={{ margin: '12px auto', display: 'inline-flex' }}>
              <span className={`badge ${profile?.role === 'Admin' ? 'badge-purple' : 'badge-blue'}`}>
                <Shield size={11} /> {profile?.role}
              </span>
            </div>
            <div className="divider" />
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Member since {profile?.createdDate ? new Date(profile.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </div>

            {showAvatars && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Choose an avatar:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {AVATAR_OPTIONS.map((url, i) => (
                    <img key={i} src={url} alt={`avatar-${i}`}
                      style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', cursor: 'pointer', border: profileForm.profileImage === url ? '2px solid var(--accent)' : '2px solid transparent', transition: 'var(--transition)' }}
                      onClick={() => { setProfileForm(f => ({ ...f, profileImage: url })); setShowAvatars(false); setEditMode(true); }} />
                  ))}
                </div>
                <input className="form-input" style={{ marginTop: 10, fontSize: 12 }}
                  placeholder="Or paste image URL..."
                  value={profileForm.profileImage}
                  onChange={e => setProfileForm(f => ({ ...f, profileImage: e.target.value }))} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Tabs */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['profile', 'password'].map(tab => (
              <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}>
                {tab === 'profile' ? <><User size={14} /> Edit Profile</> : <><Lock size={14} /> Change Password</>}
              </button>
            ))}
          </div>

          <div className="card">
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

            {activeTab === 'profile' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile Information</h3>
                  {!editMode && (
                    <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                      <Edit2 size={14} /> Edit
                    </button>
                  )}
                </div>

                {editMode ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div className="input-wrapper">
                        <User size={16} className="input-icon" />
                        <input className="form-input input-with-icon" value={profileForm.username}
                          onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))} placeholder="Username" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <div className="input-wrapper">
                        <Mail size={16} className="input-icon" />
                        <input className="form-input input-with-icon" type="email" value={profileForm.email}
                          onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-secondary" onClick={() => { setEditMode(false); setError(''); setProfileForm({ username: profile.username, email: profile.email, profileImage: profile.profileImage || '' }); }}>
                        Cancel
                      </button>
                      <button className="btn btn-primary" onClick={handleProfileSave} disabled={saving}>
                        {saving ? 'Saving...' : <><Check size={14} /> Save Changes</>}
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[
                      { icon: User, label: 'Username', value: profile?.username },
                      { icon: Mail, label: 'Email Address', value: profile?.email },
                      { icon: Shield, label: 'Role', value: profile?.role },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} color="var(--accent-light)" />
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Change Password</h3>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showPw.cur ? 'text' : 'password'} className="form-input input-with-icon input-with-right-icon"
                      value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Enter current password" />
                    <button type="button" className="input-icon-right" style={{ background: 'none', border: 'none' }} onClick={() => setShowPw(s => ({ ...s, cur: !s.cur }))}>
                      {showPw.cur ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showPw.new ? 'text' : 'password'} className="form-input input-with-icon input-with-right-icon"
                      value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="At least 6 characters" />
                    <button type="button" className="input-icon-right" style={{ background: 'none', border: 'none' }} onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}>
                      {showPw.new ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type="password" className="form-input input-with-icon"
                      value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" />
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>
                  {saving ? 'Changing...' : <><Lock size={14} /> Change Password</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
