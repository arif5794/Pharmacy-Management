import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

// Helper function to get YYYY-MM-DD in local system time
const getLocalDateString = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function Sales() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todaysSales, setTodaysSales] = useState([]);
  const [totals, setTotals] = useState({ quantity: 0, revenue: 0, cost: 0 });

  const [formData, setFormData] = useState({
    product_id: '',
    quantity_sold: '',
    date: getLocalDateString()
  });

  useEffect(() => {
    fetchProducts();
    fetchSales();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [todaysSales]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/sales`);
      const allSales = response.data.data || [];

      const todayStr = getLocalDateString();

      // Match sales using local YYYY-MM-DD format
      const todayList = allSales.filter(sale => {
        if (!sale.sale_date) return false;
        return getLocalDateString(sale.sale_date) === todayStr;
      });

      setTodaysSales(todayList);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const quantity = todaysSales.reduce((sum, sale) => sum + parseInt(sale.quantity || 0, 10), 0);
    const revenue = todaysSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const cost = todaysSales.reduce((sum, sale) => sum + (parseFloat(sale.cost_price || 0) * parseInt(sale.quantity || 0, 10)), 0);
    setTotals({ quantity, revenue, cost });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      if (!formData.product_id || !formData.quantity_sold) {
        alert('Please select a product and quantity.');
        return;
      }

      const payload = {
        product_id: parseInt(formData.product_id, 10),
        quantity: parseInt(formData.quantity_sold, 10),
        sale_date: formData.date,
        shopkeeper_id: 1
      };

      const res = await axios.post(`${API_URL}/sales`, payload);

      alert(`✅ ${res.data.message || 'Sale recorded successfully!'}`);

      setFormData({
        product_id: '',
        quantity_sold: '',
        date: getLocalDateString()
      });

      await fetchSales();
      await fetchProducts();

    } catch (error) {
      console.error('Error recording sale:', error);
      const errMsg = error.response?.data?.error || 'Failed to record sale';
      alert(`❌ ${errMsg}`);
    }
  };

  return (
    <div className="sales-page">
      <h1>🛒 Daily Sales</h1>

      <div className="card">
        <div className="card-title">➕ Record New Sale</div>
        <form onSubmit={handleAddSale}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group">
              <label>Select Product</label>
              <select name="product_id" value={formData.product_id} onChange={handleInputChange} required>
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.product_name} (Stock: {product.current_quantity}) - ৳{product.selling_price}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Sold</label>
              <input type="number" name="quantity_sold" placeholder="0" min="1" value={formData.quantity_sold} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-success"><FiPlus /> Record Sale</button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid">
        <div className="stat-card">
          <div className="stat-label">Total Quantity Sold</div>
          <div className="stat-value">{totals.quantity}</div>
        </div>

        <div className="stat-card income">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">৳ {totals.revenue.toFixed(2)}</div>
        </div>

        <div className="stat-card profit">
          <div className="stat-label">Total Profit</div>
          <div className="stat-value">৳ {(totals.revenue - totals.cost).toFixed(2)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📋 Today's Sales ({getLocalDateString()})</div>
        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : todaysSales.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Cost</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {todaysSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.product_name}</td>
                    <td>{sale.quantity}</td>
                    <td>৳ {parseFloat(sale.unit_price).toFixed(2)}</td>
                    <td>৳ {parseFloat(sale.total_amount).toFixed(2)}</td>
                    <td>৳ {(parseFloat(sale.cost_price) * parseInt(sale.quantity, 10)).toFixed(2)}</td>
                    <td style={{ color: '#11998e', fontWeight: 600 }}>৳ {parseFloat(sale.profit).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No sales recorded today yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Sales;