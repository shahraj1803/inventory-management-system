import React, { useEffect, useState } from 'react';
import { categoryAPI } from '../services/api';
import { Plus, Edit2, Trash2, Tag, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | { id, name }
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState({ categoryName: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try { const res = await categoryAPI.getAll(); setCategories(res.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setForm({ categoryName: '' }); setError(''); setModal('add'); };
  const openEdit = (cat) => { setForm({ categoryName: cat.categoryName }); setError(''); setModal({ id: cat.categoryId, name: cat.categoryName }); };
  const closeModal = () => { setModal(null); setError(''); };

  const handleSave = async () => {
    if (!form.categoryName.trim()) { setError('Category name is required'); return; }
    setSaving(true);
    try {
      if (modal === 'add') {
        await categoryAPI.create({ categoryName: form.categoryName.trim() });
        toast.success('Category added!');
      } else {
        await categoryAPI.update(modal.id, { categoryName: form.categoryName.trim() });
        toast.success('Category updated!');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await categoryAPI.delete(deleteModal.categoryId);
      toast.success('Category deleted!');
      setDeleteModal(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
      setDeleteModal(null);
    } finally { setDeleting(false); }
  };

  const CATEGORY_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6','#ec4899','#14b8a6'];

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Organize your products into categories — {categories.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Tag size={48} />
            <h3>No categories yet</h3>
            <p>Create your first category to organize products</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAdd}><Plus size={15} /> Add Category</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {categories.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            return (
              <div key={cat.categoryId} className="card" style={{ borderTop: `3px solid ${color}`, transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={20} color={color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{cat.categoryName}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        ID: #{cat.categoryId}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-icon" title="Edit" onClick={() => openEdit(cat)}>
                      <Edit2 size={13} />
                    </button>
                    <button className="btn-icon danger" title="Delete" onClick={() => setDeleteModal(cat)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>Created {new Date(cat.createdDate).toLocaleDateString()}</span>
                  <span style={{ color, fontWeight: 600 }}>Active</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">{modal === 'add' ? 'Add New Category' : `Edit "${modal.name}"`}</h3>
              <button className="btn-icon" onClick={closeModal}><X size={16} /></button>
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                className="form-input"
                value={form.categoryName}
                onChange={e => { setForm({ categoryName: e.target.value }); setError(''); }}
                placeholder="e.g. Electronics"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><Check size={15} /> {modal === 'add' ? 'Add Category' : 'Save Changes'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Category</h3>
              <button className="btn-icon" onClick={() => setDeleteModal(null)}><X size={16} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteModal.categoryName}</strong>?
              <br /><br />
              <span style={{ color: 'var(--yellow)', fontSize: 13 }}>⚠️ This will fail if products are assigned to this category.</span>
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
