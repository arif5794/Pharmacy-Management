import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Navbar from './components/Navbar';
import './App.css';

const MainApp = () => {
  const { currentUser, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'products':
        return <Products />;
      case 'sales':
        return <Sales />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        user={currentUser}
        onLogout={logout}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}