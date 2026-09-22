import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

const emptyForm = {
  product_code: '',
  product_name: '',
  category: '',
  description: '',
  cost_price: '',
  selling_price: '',
  current_quantity: '',
  min_stock_level: '10',
  unit: 'tablet',
  expiry_date: '',
  supplier: ''
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      showMessage('Failed to fetch products!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      category: product.category || '',
      description: product.description || '',
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_quantity: product.current_quantity,
      min_stock_level: product.min_stock_level || 10,
      unit: product.unit || 'tablet',
      expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '',
      supplier: product.supplier || ''
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      if (editingProduct) {
        // UPDATE existing product
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData);
        showMessage('✅ Product updated successfully!', 'success');
      } else {
        // ADD new product
        await axios.post(`${API_URL}/products`, formData);
        showMessage('✅ Product added successfully!', 'success');
      }

      handleCloseForm();
      fetchProducts(); // Refresh list
    } catch (error) {
      const msg = error.response?.data?.error || 'Something went wrong!';
      showMessage(`❌ ${msg}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.product_name}"?`)) return;

    try {
      await axios.delete(`${API_URL}/products/${product.id}`);
      showMessage('✅ Product deleted successfully!', 'success');
      fetchProducts();
    } catch (error) {
      showMessage('❌ Failed to delete product!', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const profit = formData.selling_price && formData.cost_price
    ? (parseFloat(formData.selling_price) - parseFloat(formData.cost_price)).toFixed(2)
    : 0;

  return (
    <div className="products-page">

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📦 Product Management</h1>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div className="card-title" style={{ margin: 0 }}>
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCloseForm}>
              <FiX /> Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>

              <div className="form-group">
                <label>Product Code *</label>
                <input
                  type="text"
                  name="product_code"
                  placeholder="e.g., MED001"
                  value={formData.product_code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="e.g., Paracetamol 500mg"
                  value={formData.product_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g., Pain Relief"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  placeholder="e.g., Square Pharma"
                  value={formData.supplier}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cost Price (৳) *</label>
                <input
                  type="number"
                  name="cost_price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Selling Price (৳) *</label>
                <input
                  type="number"
                  name="selling_price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Quantity *</label>
                <input
                  type="number"
                  name="current_quantity"
                  placeholder="0"
                  min="0"
                  value={formData.current_quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Min Stock Level</label>
                <input
                  type="number"
                  name="min_stock_level"
                  placeholder="10"
                  min="0"
                  value={formData.min_stock_level}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Unit</label>
                <select name="unit" value={formData.unit} onChange={handleInputChange}>
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="bottle">Bottle</option>
                  <option value="pack">Pack</option>
                  <option value="injection">Injection</option>
                  <option value="syrup">Syrup</option>
                  <option value="cream">Cream</option>
                  <option value="drop">Drop</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="Optional notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Live Profit Preview */}
              {formData.cost_price && formData.selling_price && (
                <div style={{ padding: '15px', backgroundColor: profit >= 0 ? '#e8f5e9' : '#ffebee', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Profit per unit</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: profit >= 0 ? '#2e7d32' : '#c62828' }}>
                    ৳ {profit}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success" disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                <FiX /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="card">
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="🔍 Search by name, code or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 15px', backgroundColor: '#e3f2fd', borderRadius: '6px', fontSize: '14px' }}>
            📦 Total Products: <strong>{products.length}</strong>
          </div>
          <div style={{ padding: '10px 15px', backgroundColor: '#ffebee', borderRadius: '6px', fontSize: '14px' }}>
            ⚠️ Low Stock: <strong>{products.filter(p => p.current_quantity <= p.min_stock_level).length}</strong>
          </div>
          <div style={{ padding: '10px 15px', backgroundColor: '#e8f5e9', borderRadius: '6px', fontSize: '14px' }}>
            🔍 Showing: <strong>{filteredProducts.length}</strong>
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading products...</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Cost ৳</th>
                  <th>Sell ৳</th>
                  <th>Profit ৳</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.product_code}</strong></td>
                      <td>{product.product_name}</td>
                      <td>{product.category || '-'}</td>
                      <td>৳ {parseFloat(product.cost_price).toFixed(2)}</td>
                      <td>৳ {parseFloat(product.selling_price).toFixed(2)}</td>
                      <td style={{ color: '#11998e', fontWeight: 600 }}>
                        ৳ {(parseFloat(product.selling_price) - parseFloat(product.cost_price)).toFixed(2)}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: 600,
                          backgroundColor: product.current_quantity <= product.min_stock_level ? '#ffebee' : '#e8f5e9',
                          color: product.current_quantity <= product.min_stock_level ? '#c62828' : '#2e7d32'
                        }}>
                          {product.current_quantity <= product.min_stock_level ? '⚠️ ' : ''}
                          {product.current_quantity}
                        </span>
                      </td>
                      <td>{product.unit}</td>
                      <td>{product.supplier || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenEdit(product)}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      {searchTerm ? `No products found for "${searchTerm}"` : 'No products yet. Click Add Product to start!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;