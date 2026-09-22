import React, { useState } from 'react';
import {
  FiHome, FiBox, FiShoppingCart,
  FiTrendingUp, FiBarChart2, FiLogOut,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import './Navbar.css';

function Navbar({ activePage, setActivePage, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await onLogout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',      icon: <FiHome size={20} /> },
    { id: 'products',     label: 'Products',        icon: <FiBox size={20} /> },
    { id: 'sales',        label: 'Daily Sales',     icon: <FiShoppingCart size={20} /> },
    { id: 'transactions', label: 'Income/Expense',  icon: <FiTrendingUp size={20} /> },
    { id: 'reports',      label: 'Reports',         icon: <FiBarChart2 size={20} /> },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>

      {/* Brand + Toggle Button */}
      <div className="sidebar-brand">
        <span className="brand-icon">🏥</span>
        {!collapsed && <span className="brand-name">EchoPharma</span>}
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* User Info (only when expanded) */}
      {!collapsed && user && (
        <div className="sidebar-user">
          <div className="user-avatar">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-email">{user.email}</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      )}

      {/* Collapsed Avatar */}
      {collapsed && user && (
        <div className="sidebar-user-collapsed">
          <div className="user-avatar">
            {user.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
            {/* Active dot indicator when collapsed */}
            {collapsed && activePage === item.id && (
              <span className="active-dot" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="user-info-bottom">
            👤 {user?.email?.split('@')[0]}
          </div>
        )}
        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Navbar;