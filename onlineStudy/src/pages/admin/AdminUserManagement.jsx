import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUser, deleteUser } from '../../api/adminApi';
import '../../style/AdminUserManagement.css';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search, sortBy, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        sortBy,
        sortOrder
      });

      if (response.success) {
        setUsers(response.users);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Lỗi khi lấy danh sách người dùng');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      originalUsername: user.username,
      originalEmail: user.email
    });
  };

  const handleSaveUser = async () => {
    try {
      const response = await updateUser(editingUser._id, {
        username: editingUser.username,
        email: editingUser.email
      });

      if (response.success) {
        setUsers(users.map(user => 
          user._id === editingUser._id ? response.user : user
        ));
        setEditingUser(null);
      } else {
        alert(response.message || 'Lỗi khi cập nhật người dùng');
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Update user error:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);

      if (response.success) {
        setUsers(users.filter(user => user._id !== userId));
        setDeleteConfirm(null);
        // Nếu trang hiện tại không còn user nào, chuyển về trang trước
        if (users.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      } else {
        alert(response.message || 'Lỗi khi xóa người dùng');
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Delete user error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="admin-user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <div className="management-header">
        <h1>Quản lý người dùng</h1>
        <div className="management-stats">
          <span>Tổng: {pagination.total} người dùng</span>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập hoặc email..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchUsers} className="retry-btn">Thử lại</button>
        </div>
      )}

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('username')} className="sortable">
                Tên đăng nhập {getSortIcon('username')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Ngày tạo {getSortIcon('createdAt')}
              </th>
              <th onClick={() => handleSort('updatedAt')} className="sortable">
                Cập nhật {getSortIcon('updatedAt')}
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>{formatDate(user.updatedAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="edit-btn"
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(user)}
                      className="delete-btn"
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="no-data">
            <p>Không tìm thấy người dùng nào</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="page-btn"
          >
            Trước
          </button>
          
          {[...Array(pagination.pages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`page-btn ${pagination.page === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="page-btn"
          >
            Sau
          </button>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Chỉnh sửa người dùng</h2>
            
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={editingUser.username}
                onChange={(e) => setEditingUser({
                  ...editingUser,
                  username: e.target.value
                })}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({
                  ...editingUser,
                  email: e.target.value
                })}
              />
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveUser} className="save-btn">
                Lưu
              </button>
              <button onClick={() => setEditingUser(null)} className="cancel-btn">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h2>Xác nhận xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa người dùng <strong>{deleteConfirm.username}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </p>

            <div className="modal-actions">
              <button 
                onClick={() => handleDeleteUser(deleteConfirm._id)} 
                className="delete-btn"
              >
                Xóa
              </button>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="cancel-btn"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
