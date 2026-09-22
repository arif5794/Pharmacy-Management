import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDownload, FiCalendar } from 'react-icons/fi';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [currentReport, setCurrentReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      
      const mockReport = {
        month: selectedMonth,
        total_sales: 25000,
        total_sales_quantity: 450,
        total_cost: 12000,
        gross_profit: 13000,
        other_income: 2000,
        other_expenses: 3500,
        net_profit: 11500
      };

      setCurrentReport(mockReport);

      setReports([
        {
          month: '2026-09',
          total_sales: 25000,
          net_profit: 11500
        },
        {
          month: '2026-08',
          total_sales: 22000,
          net_profit: 10200
        },
        {
          month: '2026-07',
          total_sales: 20000,
          net_profit: 9500
        },
        {
          month: '2026-06',
          total_sales: 18500,
          net_profit: 8800
        }
      ]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('PDF export feature coming soon!');
  };

  const profitMargin = currentReport 
    ? ((currentReport.net_profit / currentReport.total_sales) * 100).toFixed(2)
    : 0;

  return (
    <div className="reports-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>📊 P&L Reports</h1>
        <button className="btn btn-primary" onClick={handleExportPDF}>
          <FiDownload /> Export PDF
        </button>
      </div>

      <div className="card">
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label>Select Month</label>
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading report...</div>
      ) : currentReport ? (
        <>
          <div className="grid">
            <div className="stat-card">
              <div className="stat-label">Total Sales</div>
              <div className="stat-value">৳ {currentReport.total_sales.toLocaleString()}</div>
              <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                {currentReport.total_sales_quantity} units
              </div>
            </div>

            <div className="stat-card expense">
              <div className="stat-label">Cost of Goods</div>
              <div className="stat-value">৳ {currentReport.total_cost.toLocaleString()}</div>
            </div>

            <div className="stat-card income">
              <div className="stat-label">Gross Profit</div>
              <div className="stat-value">৳ {currentReport.gross_profit.toLocaleString()}</div>
            </div>

            <div className="stat-card profit">
              <div className="stat-label">Net Profit</div>
              <div className="stat-value">৳ {currentReport.net_profit.toLocaleString()}</div>
              <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                Margin: {profitMargin}%
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">📋 Profit & Loss Statement</div>
            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>Total Sales Revenue</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#11998e' }}>
                      ৳ {currentReport.total_sales.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px 0' }}>Less: Cost of Goods Sold</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: '#eb3b5a' }}>
                      -৳ {currentReport.total_cost.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f0f0f0' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>Gross Profit</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#667eea' }}>
                      ৳ {currentReport.gross_profit.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px 0' }}>Add: Other Income</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: '#11998e' }}>
                      +৳ {currentReport.other_income.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px 0' }}>Less: Operating Expenses</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: '#eb3b5a' }}>
                      -৳ {currentReport.other_expenses.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#e8f5e9' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600, fontSize: '16px' }}>Net Profit (Loss)</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, fontSize: '16px', color: '#2e7d32' }}>
                      ৳ {currentReport.net_profit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div className="card-title">📈 Key Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Profit Margin</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>
                    {profitMargin}%
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Cost Ratio</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>
                    {((currentReport.total_cost / currentReport.total_sales) * 100).toFixed(2)}%
                  </div>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Avg Sale per Unit</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>
                    ৳ {(currentReport.total_sales / currentReport.total_sales_quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">📅 Previous Months</div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Sales</th>
                    <th>Net Profit</th>
                    <th>Profit Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.month}>
                      <td>{new Date(report.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                      <td>৳ {report.total_sales.toLocaleString()}</td>
                      <td style={{ color: '#11998e', fontWeight: 600 }}>৳ {report.net_profit.toLocaleString()}</td>
                      <td>{((report.net_profit / report.total_sales) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No data available for selected month
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;