import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { Package, Tag, AlertTriangle, Users, DollarSign, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.get();
      setData(res.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
      <div className="spinner" />
    </div>
  );

  if (!data) return null;

  const stats = [
    { label: 'Total Products', value: data.totalProducts, icon: Package, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', change: 'In stock' },
    { label: 'Categories', value: data.totalCategories, icon: Tag, color: '#10b981', bg: 'rgba(16,185,129,0.12)', change: 'Active' },
    { label: 'Low Stock', value: data.lowStockCount, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', change: '≤ 5 units' },
    { label: 'Total Users', value: data.totalUsers, icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', change: 'Registered' },
    { label: 'Inventory Value', value: `$${Number(data.totalInventoryValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', change: 'Total worth' },
  ];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of your inventory system</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchData}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg }}>
              <Icon size={22} color={color} />
            </div>
            <div className="stat-info">
              <div className="value">{value}</div>
              <div className="label">{label}</div>
              <div className="change" style={{ color: 'var(--text-muted)' }}>
                <TrendingUp size={11} /> {change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Products by Category</div>
              <div className="card-subtitle">Distribution across categories</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.categoryStats} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="categoryName" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="productCount" name="Products" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Category Share</div>
              <div className="card-subtitle">Percentage of total products</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data.categoryStats} dataKey="productCount" nameKey="categoryName" cx="50%" cy="50%" outerRadius={85} innerRadius={40}>
                {data.categoryStats.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={16} color="var(--yellow)" />
                Low Stock Alert
              </div>
              <div className="card-subtitle">Products with ≤ 5 units</div>
            </div>
            <Link to="/products" className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {data.lowStockProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Package size={32} />
              <p style={{ marginTop: 8 }}>All products are well stocked!</p>
            </div>
          ) : (
            <div>
              {data.lowStockProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <img src={p.productImage} alt={p.productName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.productName)}&background=6366f1&color=fff&size=64`; }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.categoryName}</div>
                  </div>
                  <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-yellow'}`}>{p.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recently Added</div>
              <div className="card-subtitle">Latest inventory items</div>
            </div>
            <Link to="/products" className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {data.recentProducts.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <img src={p.productImage} alt={p.productName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.productName)}&background=6366f1&color=fff&size=64`; }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.productName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.categoryName}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>${p.price}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>qty: {p.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
