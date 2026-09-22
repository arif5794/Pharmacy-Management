import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlusCircle, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import '../App.css';

const API_URL = 'https://pharmacy-management-d41i.onrender.com/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'expense', // 'income' or 'expense'
    category: 'Rent',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from PostgreSQL
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/transactions`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new Income or Expense to Database
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage({ type: 'alert-error', text: 'Please enter a valid amount.' });
      return;
    }

    try {
      const payload = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        transaction_date: formData.date
      };

      await axios.post(`${API_URL}/transactions`, payload);
      
      setMessage({ type: 'alert-success', text: `${formData.type.toUpperCase()} recorded successfully!` });
      
      // Reset Form and Refresh List
      setFormData({
        type: 'expense',
        category: 'Rent',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

      fetchTransactions(); // Re-fetch from DB

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving transaction:', error);
      setMessage({ type: 'alert-error', text: 'Failed to record transaction. Check backend connection.' });
    }
  };

  // Calculate totals dynamically from PostgreSQL records
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading Transactions...</div>;
  }

  return (
    <div className="transactions-page">
      <h1>📈 Income & Expense Tracker</h1>

      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Summary Cards */}
      <div className="grid">
        <div className="stat-card income">
          <FiTrendingUp size={28} />
          <div className="stat-label">Total Other Income</div>
          <div className="stat-value">৳ {totalIncome.toFixed(2)}</div>
        </div>

        <div className="stat-card expense">
          <FiTrendingDown size={28} />
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">৳ {totalExpense.toFixed(2)}</div>
        </div>

        <div className="stat-card profit">
          <FiDollarSign size={28} />
          <div className="stat-label">Net Balance</div>
          <div className="stat-value">৳ {(totalIncome - totalExpense).toFixed(2)}</div>
        </div>
      </div>

      {/* Record New Transaction Form */}
      <div className="card">
        <div className="card-title">➕ Record Transaction</div>
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            
            <div className="form-group">
              <label>Transaction Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="expense">Expense (-)</option>
                <option value="income">Income (+)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="Rent">Rent</option>
                <option value="Electricity Bill">Electricity Bill</option>
                <option value="Salaries">Staff Salary</option>
                <option value="Supplier Payment">Supplier Payment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (৳)</label>
              <input 
                type="number" 
                name="amount" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange} 
                required 
              />
            </div>

          </div>

          <div className="form-group">
            <label>Description / Note</label>
            <input 
              type="text" 
              name="description" 
              placeholder="e.g. Paid electricity bill for September" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <FiPlusCircle /> Save Transaction
          </button>
        </form>
      </div>

      {/* Recent Transactions List */}
      <div className="card">
        <div className="card-title">📜 Transaction History</div>
        {transactions.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, index) => {
                  const isExpense = item.type === 'expense';
                  return (
                    <tr key={item.id || index}>
                      <td>
                        <span style={{
                          color: isExpense ? '#eb3b5a' : '#11998e',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          fontSize: '12px'
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td><strong>{item.category}</strong></td>
                      <td>{item.description || 'N/A'}</td>
                      <td style={{ fontWeight: '600', color: isExpense ? '#eb3b5a' : '#11998e' }}>
                        {isExpense ? '-' : '+'} ৳ {parseFloat(item.amount).toFixed(2)}
                      </td>
                      <td>{new Date(item.transaction_date || item.created_at || item.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No transactions recorded yet.</p>
        )}
      </div>
    </div>
  );
}

export default Transactions;