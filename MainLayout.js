import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Tag, User, LogOut,
  Bell, Menu, X, ChevronRight, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: Tag, label: 'Categories' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const currentPage = navItems.find(n => location.pathname.startsWith(n.path));

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, display: 'none' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon">
              <TrendingUp size={18} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 800 }}>StockFlow</h2>
              <span>Inventory Manager</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {location.pathname.startsWith(path) && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: 16 }}>Account</div>
          <button className="nav-item" style={{ width: '100%', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }} onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <img
              src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=6366f1&color=fff&size=64`}
              alt={user?.username}
              className="user-avatar"
            />
            <div className="user-info" style={{ overflow: 'hidden' }}>
              <div className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
              <div className="role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <h1>{currentPage?.label || 'Dashboard'}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="navbar-right">
            <button className="btn-icon" title="Notifications">
              <Bell size={16} />
            </button>
            <NavLink to="/profile" className="navbar-user" style={{ textDecoration: 'none' }}>
              <img
                src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=6366f1&color=fff&size=64`}
                alt={user?.username}
                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
              </div>
            </NavLink>
          </div>
        </header>

        <main className="page-content fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
