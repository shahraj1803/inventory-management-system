import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { ArrowLeft, Upload, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=300&h=300&fit=crop',
];

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    productName: '', categoryId: '', quantity: '', price: '', description: '', productImage: ''
  });

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      setFetchLoading(true);
      productAPI.getById(id).then(r => {
        const p = r.data;
        setForm({
          productName: p.productName,
          categoryId: p.categoryId.toString(),
          quantity: p.quantity.toString(),
          price: p.price.toString(),
          description: p.description || '',
          productImage: p.productImage || ''
        });
      }).catch(() => { toast.error('Product not found'); navigate('/products'); })
        .finally(() => setFetchLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleImageSelect = (url) => setForm(f => ({ ...f, productImage: url }));

  const handleImageUrlChange = e => setForm(f => ({ ...f, productImage: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.productName.trim()) { setError('Product name is required'); return; }
    if (!form.categoryId) { setError('Please select a category'); return; }
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) { setError('Enter a valid price'); return; }
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0) { setError('Enter a valid quantity'); return; }

    setLoading(true);
    const payload = {
      productName: form.productName.trim(),
      categoryId: parseInt(form.categoryId),
      quantity: parseInt(form.quantity),
      price: parseFloat(form.price),
      description: form.description.trim(),
      productImage: form.productImage.trim() || undefined
    };

    try {
      if (isEdit) {
        await productAPI.update(id, payload);
        toast.success('Product updated successfully!');
      } else {
        await productAPI.create(payload);
        toast.success('Product added successfully!');
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>
  );

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <button className="btn btn-secondary" style={{ marginBottom: 12 }} onClick={() => navigate('/products')}>
            <ArrowLeft size={15} /> Back to Products
          </button>
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <p>{isEdit ? 'Update product information' : 'Add a new item to your inventory'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Form */}
        <div className="card">
          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Product Name *</label>
                <input name="productName" value={form.productName} onChange={handleChange}
                  className="form-input" placeholder="e.g. Apple iPhone 15 Pro" />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  className="form-input form-select">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
                  className="form-input" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange}
                  className="form-input" placeholder="0" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  className="form-input form-textarea" placeholder="Product description..." rows={3} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Image URL</label>
                <input name="productImage" value={form.productImage} onChange={handleImageUrlChange}
                  className="form-input" placeholder="https://... or select a sample below" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />{isEdit ? 'Updating...' : 'Creating...'}</> : (isEdit ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>

        {/* Image Panel */}
        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Product Image</div>
            {form.productImage ? (
              <img src={form.productImage} alt="Preview"
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12 }}
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(form.productName || 'P')}&background=1e293b&color=6366f1&size=300`; }} />
            ) : (
              <div style={{ width: '100%', height: 200, background: 'var(--bg-secondary)', border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Package size={32} color="var(--text-muted)" />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>No image selected</p>
              </div>
            )}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Or pick a sample image:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {SAMPLE_IMAGES.map((url, i) => (
                <img key={i} src={url} alt={`sample-${i}`}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: form.productImage === url ? '2px solid var(--accent)' : '2px solid transparent', transition: 'var(--transition)' }}
                  onClick={() => handleImageSelect(url)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
