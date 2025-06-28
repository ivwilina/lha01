import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../api/adminApi';
import ImportModal from '../../components/ImportModal';
import '../../style/AdminCategoryManagement.css';

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [search, setSearch] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Fetch categories từ API hiện có để hiển thị tất cả
      let response;
      if (search || pagination.page > 1) {
        // Sử dụng admin API cho search và pagination
        response = await getAllCategories({
          page: pagination.page,
          limit: pagination.limit,
          search
        });
      } else {
        // Sử dụng API hiện có để lấy tất cả categories
        response = await getAllCategories();
      }

      if (response.success) {
        setCategories(response.categories);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Lỗi khi lấy danh sách chủ đề');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateCategory = () => {
    setCreatingCategory({
      name: '',
      displayName: '',
      description: ''
    });
  };

  const handleImportSuccess = (response) => {
    setShowImportModal(false);
    fetchCategories(); // Refresh categories list
    alert(response.message + (response.errors ? '\n\nCảnh báo:\n' + response.errors.join('\n') : ''));
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = async (categoryData, isEdit = false) => {
    try {
      let response;
      
      if (isEdit) {
        response = await updateCategory(categoryData._id, {
          name: categoryData.name,
          displayName: categoryData.displayName,
          description: categoryData.description
        });
      } else {
        response = await createCategory({
          name: categoryData.name,
          displayName: categoryData.displayName,
          description: categoryData.description
        });
      }

      if (response.success) {
        if (isEdit) {
          setCategories(categories.map(cat => 
            cat._id === categoryData._id ? response.category : cat
          ));
          setEditingCategory(null);
        } else {
          // Refresh để lấy category mới
          fetchCategories();
          setCreatingCategory(false);
        }
      } else {
        alert(response.message || `Lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} chủ đề`);
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error(`${isEdit ? 'Update' : 'Create'} category error:`, error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await deleteCategory(categoryId);

      if (response.success) {
        setCategories(categories.filter(cat => cat._id !== categoryId));
        setDeleteConfirm(null);
        // Nếu trang hiện tại không còn category nào, chuyển về trang trước
        if (categories.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      } else {
        alert(response.message || 'Lỗi khi xóa chủ đề');
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Delete category error:', error);
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

  if (loading) {
    return (
      <div className="admin-category-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách chủ đề...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-category-management">
      <div className="management-header">
        <h1>Quản lý chủ đề</h1>
        <div className="management-stats">
          <span>Tổng: {pagination.total} chủ đề</span>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc tên hiển thị..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>
        
        <div className="action-buttons">
          <button onClick={handleCreateCategory} className="create-btn">
            <i className="fas fa-plus"></i>
            Thêm chủ đề
          </button>
          
          <button onClick={() => setShowImportModal(true)} className="import-btn">
            <i className="fas fa-upload"></i>
            Import chủ đề với từ vựng
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchCategories} className="retry-btn">Thử lại</button>
        </div>
      )}

      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Tên hiển thị</th>
              <th>Mô tả</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id}>
                <td className="category-name">{category.name}</td>
                <td>{category.displayName}</td>
                <td className="category-description">
                  {category.description || <em>Không có mô tả</em>}
                </td>
                <td>{formatDate(category.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="edit-btn"
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(category)}
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

        {categories.length === 0 && !loading && (
          <div className="no-data">
            <p>Không tìm thấy chủ đề nào</p>
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

      {/* Create Category Modal */}
      {creatingCategory && (
        <CategoryModal
          category={creatingCategory}
          onSave={(data) => handleSaveCategory(data, false)}
          onCancel={() => setCreatingCategory(false)}
          title="Thêm chủ đề mới"
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onSave={(data) => handleSaveCategory(data, true)}
          onCancel={() => setEditingCategory(null)}
          title="Chỉnh sửa chủ đề"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h2>Xác nhận xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa chủ đề <strong>{deleteConfirm.displayName}</strong>?
              <br />
              <em>Lưu ý: Không thể xóa nếu có từ vựng thuộc chủ đề này.</em>
            </p>

            <div className="modal-actions">
              <button 
                onClick={() => handleDeleteCategory(deleteConfirm._id)} 
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

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          type="category"
          categories={[]}
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, onSave, onCancel, title }) => {
  const [formData, setFormData] = useState(category);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên là bắt buộc';
    }
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Tên hiển thị là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal category-modal">
        <h2>{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên (ID) *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="animals, colors, etc."
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>Tên hiển thị *</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Động vật, Màu sắc, etc."
              className={errors.displayName ? 'error' : ''}
            />
            {errors.displayName && <span className="error-text">{errors.displayName}</span>}
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về chủ đề này..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="save-btn">
              Lưu
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;
