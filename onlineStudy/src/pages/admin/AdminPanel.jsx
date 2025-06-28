import React, { useState, useEffect } from 'react';
import { isAdminAuthenticated, getAdminData, adminLogout } from '../../api/adminApi';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminUserManagement from './AdminUserManagement';
import AdminCategoryManagement from './AdminCategoryManagement';
import AdminWordManagement from './AdminWordManagement';
import '../../style/AdminPanel.css';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    const authenticated = isAdminAuthenticated();
    if (authenticated) {
      const admin = getAdminData();
      setIsAuthenticated(true);
      setAdminData(admin);
    }
    setLoading(false);
  };

  const handleLoginSuccess = (admin) => {
    setIsAuthenticated(true);
    setAdminData(admin);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setAdminData(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUserManagement />;
      case 'categories':
        return <AdminCategoryManagement />;
      case 'words':
        return <AdminWordManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <div className="admin-info">
            <p className="admin-name">{adminData?.username}</p>
            <p className="admin-role">{adminData?.role}</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-pie"></i>
            Dashboard
          </button>

          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            Người dùng
          </button>

          <button
            className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <i className="fas fa-list"></i>
            Chủ đề
          </button>

          <button
            className={`nav-item ${activeTab === 'words' ? 'active' : ''}`}
            onClick={() => setActiveTab('words')}
          >
            <i className="fas fa-book"></i>
            Từ vựng
          </button>
        </nav>

        <div className="admin-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPanel;
