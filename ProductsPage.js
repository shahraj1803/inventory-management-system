import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { Plus, Search, Edit2, Trash2, Package, ChevronLeft, ChevronRight, Filter, SortAsc } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', categoryId: '', sortBy: 'createdDate', sortOrder: 'desc' });
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try { const res = await categoryAPI.getAll(); setCategories(res.data); } catch {}
  };

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, pageSize: pagination.pageSize, ...filters };
      if (!params.categoryId) delete params.categoryId;
      const res = await productAPI.getAll(params);
      setProducts(res.data.items);
      setPagination(p => ({ ...p, page: res.data.page, totalCount: res.data.totalCount, totalPages: res.data.totalPages }));
    } catch { toast.error('Failed to fetch products'); }
    finally { setLoading(false); }
  }, [filters, pagination.pageSize]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(1); }, [filters]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await productAPI.delete(deleteModal.id);
      toast.success('Product deleted');
      setDeleteModal(null);
      fetchProducts(pagination.page);
    } catch { toast.error('Failed to delete product'); }
    finally { setDeleting(false); }
  };

  const stockBadge = (qty) => {
    if (qty === 0) return <span className="badge badge-red">Out of Stock</span>;
    if (qty <= 5) return <span className="badge badge-yellow">Low Stock</span>;
    return <span className="badge badge-green">In Stock</span>;
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Manage your inventory items — {pagination.totalCount} total</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              className="form-input input-with-icon"
              placeholder="Search products..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} color="var(--text-muted)" />
            <select className="form-input form-select" style={{ width: 160 }} value={filters.categoryId}
              onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SortAsc size={14} color="var(--text-muted)" />
            <select className="form-input form-select" style={{ width: 140 }} value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}>
              <option value="createdDate">Newest First</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="quantity">Quantity</option>
            </select>
            <select className="form-input form-select" style={{ width: 100 }} value={filters.sortOrder}
              onChange={e => setFilters(f => ({ ...f, sortOrder: e.target.value }))}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
            <Link to="/products/new" className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={15} /> Add Product</Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={p.productImage}
                          alt={p.productName}
                          className="product-thumb"
                          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.productName)}&background=1e293b&color=6366f1&size=64`; }}
                        />
                        <div>
                          <div className="product-name">{p.productName}</div>
                          <div className="product-desc">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-purple">{p.categoryName}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>${Number(p.price).toFixed(2)}</span></td>
                    <td>
                      <span className={p.quantity === 0 ? 'out-of-stock' : p.quantity <= 5 ? 'low-stock' : ''} style={{ fontWeight: 600 }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td>{stockBadge(p.quantity)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(p.createdDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/products/edit/${p.id}`)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon danger" title="Delete" onClick={() => setDeleteModal(p)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="pagination-info">
              Showing {((pagination.page - 1) * pagination.pageSize) + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} products
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => fetchProducts(pagination.page - 1)} disabled={pagination.page <= 1}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button key={page} className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                    onClick={() => fetchProducts(page)}>{page}</button>
                );
              })}
              <button className="page-btn" onClick={() => fetchProducts(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Delete Product</h3>
              <button className="btn-icon" onClick={() => setDeleteModal(null)}>&times;</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteModal.productName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
