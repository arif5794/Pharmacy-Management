import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { Link } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiTarget, FiBox } from 'react-icons/fi';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

function Dashboard({ userRole }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    productCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch Products, Sales, and Transactions from your PostgreSQL backend
      const [productsRes, salesRes, transactionsRes] = await Promise.all([
        axios.get(`${API_URL}/products`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/sales`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/transactions`).catch(() => ({ data: { data: [] } }))
      ]);

      // Extract array responses safely whether returned as res.data or res.data.data
      const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.data || []);
      const sales = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.data || []);
      const transactions = Array.isArray(transactionsRes.data) ? transactionsRes.data : (transactionsRes.data.data || []);

      // 1. Calculate Real Total Sales Revenue & Profit
      const totalSalesRevenue = sales.reduce(
        (sum, item) => sum + parseFloat(item.total_amount || item.total || 0), 0
      );
      const totalSalesProfit = sales.reduce(
        (sum, item) => sum + parseFloat(item.profit || 0), 0
      );

      // 2. Calculate Expenses from Transactions table
      const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

      // 3. Net Profit = Gross Sales Profit minus Expenses
      const netProfit = totalSalesProfit - totalExpenses;

      // 4. Update dynamic state
      setStats({
        totalSales: totalSalesRevenue,
        totalExpenses: totalExpenses,
        netProfit: netProfit,
        productCount: products.length
      });

      // Sort sales by date descending (latest first) and take the top 5
      const sortedSales = [...sales].sort((a, b) => {
        const dateA = new Date(a.sale_date || a.created_at || a.date);
        const dateB = new Date(b.sale_date || b.created_at || b.date);
        return dateB - dateA;
      });

      setRecentSales(sortedSales.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dynamic dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>📊 Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid">
        <div className="stat-card income">
          <FiTrendingUp size={30} />
          <div className="stat-label">Total Sales</div>
          <div className="stat-value">৳ {stats.totalSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="stat-card expense">
          <FiTrendingDown size={30} />
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">৳ {stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="stat-card profit">
          <FiTarget size={30} />
          <div className="stat-label">Net Profit</div>
          <div className="stat-value">৳ {stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="stat-card">
          <FiBox size={30} />
          <div className="stat-label">Products in Stock</div>
          <div className="stat-value">{stats.productCount} Types</div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="card">
        <div className="card-title">📝 Recent Sales</div>
        {recentSales.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, index) => {
                  // Dynamic Fallbacks matching common SQL Column Names
                  const productName = sale.product_name || sale.name || sale.product || 'Unknown Item';
                  const quantity = sale.quantity || sale.qty || 1;
                  const totalAmount = sale.total_amount || sale.total || sale.amount || 0;
                  const rawDate = sale.sale_date || sale.created_at || sale.date;
                  const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString() : 'Today';

                  return (
                    <tr key={sale.id || index}>
                      <td><strong>{productName}</strong></td>
                      <td>{quantity}</td>
                      <td>৳ {parseFloat(totalAmount).toFixed(2)}</td>
                      <td>{formattedDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            No recent sales recorded yet in the database.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      {userRole === 'admin' && (
        <div className="card">
          <div className="card-title">🚀 Quick Actions</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary">➕ Add Product</Link>
            <Link to="/sales" className="btn btn-success">🛒 Record Sale</Link>
            <Link to="/reports" className="btn btn-secondary">📊 Generate Report</Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;