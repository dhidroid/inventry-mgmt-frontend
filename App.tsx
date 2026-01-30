
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

import { User, UserRole, Product, InventoryEntry } from './types';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import InventoryTracker from './components/InventoryTracker';
import CategoryManagement from './components/CategoryManagement';
import UserManagement from './components/UserManagement';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import { apiService } from './services/apiService';
import theme from './src/theme';

type SyncStatus = 'connected' | 'syncing' | 'offline';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omnistock_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');

  const fetchData = async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      const [p, e] = await Promise.all([
        apiService.getProducts(),
        apiService.getEntries()
      ]);
      setProducts(p);
      setEntries(e);
      setSyncStatus('connected');
    } catch (err) {
      console.warn("Backend link unavailable, attempting recovery...");
      setSyncStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
    
    // const interval = setInterval(fetchData, 15000); // Pulse every 15 seconds
    // return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (u: User, token: string) => {
    setUser(u);
    localStorage.setItem('omnistock_user', JSON.stringify(u));
    localStorage.setItem('omnistock_token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('omnistock_user');
    localStorage.removeItem('omnistock_token');
  };

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={(u, t) => handleLogin(u, t || '')} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MainLayout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard products={products} entries={entries} />} />
            <Route path="/inventory" element={<InventoryTracker products={products} entries={entries} setEntries={setEntries} user={user} />} />
            <Route path="/products" element={<ProductManagement products={products} setProducts={setProducts} isAdmin={user.role === UserRole.ADMIN} />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/users" element={user.role === UserRole.ADMIN ? <UserManagement /> : <Navigate to="/" />} />
            <Route path="/analytics" element={<Dashboard products={products} entries={entries} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </ThemeProvider>
  );
};

export default App;
