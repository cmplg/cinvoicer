import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Invoices from '@/pages/Invoices';
import Customers from '@/pages/Customers';
import NewInvoice from '@/pages/NewInvoice';
import Settings from '@/pages/Settings';
import Products from '@/pages/Products';
import LoginPage from '@/pages/LoginPage';
import Reports from '@/pages/Reports';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('invoice_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (userData: any) => {
    localStorage.setItem('invoice_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('invoice_user');
    setUser(null);
  };

  if (!authChecked) return null;

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<NewInvoice />} />
          <Route path="customers" element={<Customers />} />
          <Route path="products" element={<Products />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings currentUser={user} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
