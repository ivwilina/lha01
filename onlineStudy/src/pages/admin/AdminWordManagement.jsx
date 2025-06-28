import React, { useState, useEffect } from 'react';
import { getAllWords, getAllCategories, createWord, updateWord, deleteWord } from '../../api/adminApi';
import ImportModal from '../../components/ImportModal';
import '../../style/AdminWordManagement.css';

const AdminWordManagement = () => {
  const [words, setWords] = useState([]);
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingWord, setEditingWord] = useState(null);
  const [creatingWord, setCreatingWord] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    fetchWords();
    fetchCategories();
  }, [pagination.page, search, categoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWords = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      console.log('Fetching words with params:', {
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: categoryFilter
      });
      
      // Luôn sử dụng admin API để lấy words với pagination, search, filter
      const response = await getAllWords({
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: categoryFilter
      });

      console.log('Words API response:', response);

      if (response.success) {
        setWords(response.words || []);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
      } else {
        setError(response.message || 'Lỗi khi lấy danh sách từ vựng');
        
        // Nếu lỗi authentication, redirect về login
        if (response.message && response.message.includes('đăng nhập')) {
          setTimeout(() => {
            window.location.href = '/secure-admin-access-path';
          }, 2000);
        }
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Fetch words error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Lấy tất cả categories từ API hiện có
      const response = await getAllCategories(); // Không truyền params để lấy tất cả
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateWord = () => {
    setCreatingWord({
      english: '',
      vietnamese: '',
      category: '',
      pronunciation: '',
      example: ''
    });
  };

  const handleImportSuccess = (response) => {
    setShowImportModal(false);
    fetchWords(); // Refresh words list
    alert(response.message + (response.errors ? '\n\nCảnh báo:\n' + response.errors.join('\n') : ''));
  };

  const handleEditWord = (word) => {
    setEditingWord({ 
      ...word,
      category: word.category ? word.category._id : '' // Use category ID for form
    });
  };

  const handleSaveWord = async (wordData, isEdit = false) => {
    try {
      let response;
      
      if (isEdit) {
        response = await updateWord(wordData._id, {
          english: wordData.english,
          vietnamese: wordData.vietnamese,
          category: wordData.category,
          pronunciation: wordData.pronunciation,
          example: wordData.example
        });
      } else {
        response = await createWord({
          english: wordData.english,
          vietnamese: wordData.vietnamese,
          category: wordData.category,
          pronunciation: wordData.pronunciation,
          example: wordData.example
        });
      }

      if (response.success) {
        if (isEdit) {
          setWords(words.map(word => 
            word._id === wordData._id ? response.word : word
          ));
          setEditingWord(null);
        } else {
          // Refresh để lấy word mới với populated category
          fetchWords();
          setCreatingWord(false);
        }
      } else {
        alert(response.message || `Lỗi khi ${isEdit ? 'cập nhật' : 'tạo'} từ vựng`);
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error(`${isEdit ? 'Update' : 'Create'} word error:`, error);
    }
  };

  const handleDeleteWord = async (wordId) => {
    try {
      const response = await deleteWord(wordId);

      if (response.success) {
        setWords(words.filter(word => word._id !== wordId));
        setDeleteConfirm(null);
        // Nếu trang hiện tại không còn word nào, chuyển về trang trước
        if (words.length === 1 && pagination.page > 1) {
          setPagination(prev => ({ ...prev, page: prev.page - 1 }));
        }
      } else {
        alert(response.message || 'Lỗi khi xóa từ vựng');
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Delete word error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // const getCategoryName = (categoryId) => {
  //   const category = categories.find(cat => cat._id === categoryId);
  //   return category ? category.displayName : 'Unknown';
  // };

  if (loading) {
    return (
      <div className="admin-word-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách từ vựng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-word-management">
      <div className="management-header">
        <h1>Quản lý từ vựng</h1>
        <div className="management-stats">
          <span>Tổng: {pagination.total} từ vựng</span>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm từ tiếng Anh hoặc tiếng Việt..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <select 
          value={categoryFilter} 
          onChange={handleCategoryFilter}
          className="category-filter"
        >
          <option value="">Tất cả chủ đề</option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.displayName}
            </option>
          ))}
        </select>
        
        <div className="action-buttons">
          <button onClick={handleCreateWord} className="create-btn">
            <i className="fas fa-plus"></i>
            Thêm từ vựng
          </button>
          
          <button onClick={() => setShowImportModal(true)} className="import-btn">
            <i className="fas fa-upload"></i>
            Import từ file
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchWords} className="retry-btn">Thử lại</button>
        </div>
      )}

      <div className="table-container">
        <table className="words-table">
          <thead>
            <tr>
              <th>Tiếng Anh</th>
              <th>Tiếng Việt</th>
              <th>Chủ đề</th>
              <th>Phát âm</th>
              <th>Ví dụ</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {words.map(word => (
              <tr key={word._id}>
                <td className="word-english">{word.english}</td>
                <td className="word-vietnamese">{word.vietnamese}</td>
                <td className="word-category">
                  {word.category?.displayName || 'N/A'}
                </td>
                <td className="word-pronunciation">
                  {word.pronunciation || <em>Không có</em>}
                </td>
                <td className="word-example">
                  {word.example ? (
                    <span title={word.example}>
                      {word.example.length > 50 
                        ? word.example.substring(0, 50) + '...' 
                        : word.example
                      }
                    </span>
                  ) : (
                    <em>Không có</em>
                  )}
                </td>
                <td>{formatDate(word.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditWord(word)}
                      className="edit-btn"
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(word)}
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

        {words.length === 0 && !loading && (
          <div className="no-data">
            <p>Không tìm thấy từ vựng nào</p>
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

      {/* Create Word Modal */}
      {creatingWord && (
        <WordModal
          word={creatingWord}
          categories={categories}
          onSave={(data) => handleSaveWord(data, false)}
          onCancel={() => setCreatingWord(false)}
          title="Thêm từ vựng mới"
        />
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <WordModal
          word={editingWord}
          categories={categories}
          onSave={(data) => handleSaveWord(data, true)}
          onCancel={() => setEditingWord(null)}
          title="Chỉnh sửa từ vựng"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <h2>Xác nhận xóa</h2>
            <p>
              Bạn có chắc chắn muốn xóa từ vựng <strong>{deleteConfirm.english}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </p>

            <div className="modal-actions">
              <button 
                onClick={() => handleDeleteWord(deleteConfirm._id)} 
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
          type="words"
          categories={categories}
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
};

// Word Modal Component
const WordModal = ({ word, categories, onSave, onCancel, title }) => {
  const [formData, setFormData] = useState(word);
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
    
    if (!formData.english.trim()) {
      newErrors.english = 'Từ tiếng Anh là bắt buộc';
    }
    
    if (!formData.vietnamese.trim()) {
      newErrors.vietnamese = 'Nghĩa tiếng Việt là bắt buộc';
    }

    if (!formData.category) {
      newErrors.category = 'Chủ đề là bắt buộc';
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
      <div className="modal word-modal">
        <h2>{title}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Từ tiếng Anh *</label>
              <input
                type="text"
                name="english"
                value={formData.english}
                onChange={handleChange}
                placeholder="hello, cat, beautiful..."
                className={errors.english ? 'error' : ''}
              />
              {errors.english && <span className="error-text">{errors.english}</span>}
            </div>

            <div className="form-group">
              <label>Nghĩa tiếng Việt *</label>
              <input
                type="text"
                name="vietnamese"
                value={formData.vietnamese}
                onChange={handleChange}
                placeholder="xin chào, con mèo, đẹp..."
                className={errors.vietnamese ? 'error' : ''}
              />
              {errors.vietnamese && <span className="error-text">{errors.vietnamese}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Chủ đề *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Chọn chủ đề</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Phát âm</label>
              <input
                type="text"
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleChange}
                placeholder="/həˈloʊ/, /kæt/, /ˈbjuːtɪfəl/..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Câu ví dụ</label>
            <textarea
              name="example"
              value={formData.example}
              onChange={handleChange}
              placeholder="Hello, how are you? - Xin chào, bạn khỏe không?"
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

export default AdminWordManagement;
