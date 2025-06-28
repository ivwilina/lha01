import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/adminApi';
import '../../style/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      
      if (response.success) {
        setStats(response.stats);
      } else {
        setError(response.message || 'Lỗi khi lấy thống kê');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Fetch dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatGrowthData = (userGrowth) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    return userGrowth.map(item => ({
      month: `${months[item._id.month - 1]} ${item._id.year}`,
      count: item.count
    }));
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={fetchDashboardStats} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống học từ vựng</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <h3>Người dùng</h3>
            <p className="stat-number">{stats?.users || 0}</p>
          </div>
        </div>

        <div className="stat-card categories">
          <div className="stat-icon">
            <i className="fas fa-list"></i>
          </div>
          <div className="stat-content">
            <h3>Chủ đề</h3>
            <p className="stat-number">{stats?.categories || 0}</p>
          </div>
        </div>

        <div className="stat-card words">
          <div className="stat-icon">
            <i className="fas fa-book"></i>
          </div>
          <div className="stat-content">
            <h3>Từ vựng</h3>
            <p className="stat-number">{stats?.words || 0}</p>
          </div>
        </div>

        <div className="stat-card admins">
          <div className="stat-icon">
            <i className="fas fa-user-shield"></i>
          </div>
          <div className="stat-content">
            <h3>Quản trị viên</h3>
            <p className="stat-number">{stats?.admins || 0}</p>
          </div>
        </div>
      </div>

      {stats?.userGrowth && stats.userGrowth.length > 0 && (
        <div className="growth-section">
          <h2>Tăng trưởng người dùng (6 tháng gần nhất)</h2>
          <div className="growth-chart">
            {formatGrowthData(stats.userGrowth).map((item, index) => (
              <div key={index} className="growth-item">
                <div className="growth-bar">
                  <div 
                    className="growth-fill"
                    style={{ 
                      height: `${Math.max((item.count / Math.max(...stats.userGrowth.map(g => g.count))) * 100, 5)}%` 
                    }}
                  ></div>
                </div>
                <p className="growth-month">{item.month}</p>
                <p className="growth-count">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="action-buttons">
          <button className="action-btn primary">
            <i className="fas fa-plus"></i>
            Thêm từ vựng mới
          </button>
          <button className="action-btn secondary">
            <i className="fas fa-download"></i>
            Xuất dữ liệu
          </button>
          <button className="action-btn warning">
            <i className="fas fa-sync"></i>
            Đồng bộ dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
