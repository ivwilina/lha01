/**
 * IMPORT MODAL COMPONENT
 * 
 * Component modal để import từ vựng từ file CSV/Excel:
 * - Hỗ trợ 2 loại import: words vào category có sẵn, hoặc tạo category mới với words
 * - Validate file format (CSV, Excel)
 * - Validate form data trước khi submit
 * - Hiển thị hướng dẫn và download template
 * - Upload progress indicator
 * - Error handling và validation messages
 * 
 * Props:
 * @param {string} type - Loại import: 'words' | 'category'
 * @param {Array} categories - Danh sách categories để chọn
 * @param {Function} onSuccess - Callback khi import thành công
 * @param {Function} onCancel - Callback khi hủy modal
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { importWordsFromFile, importCategoryWithWords, downloadTemplate } from '../api/adminApi';
import './ImportModal.css';

const ImportModal = ({ type, categories, onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [categoryData, setCategoryData] = useState({
    name: '',
    displayName: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setErrors(prev => ({ ...prev, file: '' }));
      } else {
        setErrors(prev => ({ ...prev, file: 'Chỉ chấp nhận file CSV hoặc Excel' }));
        setFile(null);
      }
    }
  };

  const handleCategoryDataChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!file) {
      newErrors.file = 'Vui lòng chọn file để import';
    }

    if (type === 'words' && !categoryId) {
      newErrors.categoryId = 'Vui lòng chọn chủ đề';
    }

    if (type === 'category') {
      if (!categoryData.name.trim()) {
        newErrors.name = 'Tên chủ đề là bắt buộc';
      }
      if (!categoryData.displayName.trim()) {
        newErrors.displayName = 'Tên hiển thị là bắt buộc';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    
    try {
      let response;
      
      if (type === 'words') {
        response = await importWordsFromFile(file, categoryId);
      } else {
        response = await importCategoryWithWords(file, categoryData);
      }

      if (response.success) {
        onSuccess(response);
      } else {
        alert(response.message || 'Lỗi khi import dữ liệu');
      }
    } catch (error) {
      alert('Lỗi kết nối. Vui lòng thử lại.');
      console.error('Import error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(type);
  };

  return (
    <div className="modal-overlay">
      <div className="modal import-modal">
        <h2>
          {type === 'words' ? 'Import từ vựng từ file' : 'Import chủ đề với từ vựng'}
        </h2>
        
        <div className="import-instructions">
          <h4>Hướng dẫn:</h4>
          <ul>
            <li>File phải có định dạng CSV hoặc Excel (.csv, .xlsx, .xls)</li>
            <li><strong>Format đơn giản:</strong> english, vietnamese, pronunciation, example</li>
            <li><strong>Format chi tiết:</strong> word, partOfSpeech, IPA, meaning, example, exampleForQuiz</li>
            <li>Chỉ cần có từ tiếng Anh và nghĩa tiếng Việt là đủ</li>
            <li>Tải template mẫu để xem định dạng chính xác</li>
            <li>Dữ liệu trùng lặp sẽ bị bỏ qua</li>
          </ul>
          <button 
            type="button" 
            onClick={handleDownloadTemplate}
            className="download-template-btn"
          >
            <i className="fas fa-download"></i>
            Tải template mẫu
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chọn file *</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className={errors.file ? 'error' : ''}
            />
            {errors.file && <span className="error-text">{errors.file}</span>}
            {file && (
              <div className="file-info">
                <i className="fas fa-file"></i>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          {type === 'words' && (
            <div className="form-group">
              <label>Chủ đề *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={errors.categoryId ? 'error' : ''}
              >
                <option value="">Chọn chủ đề</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.displayName}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>
          )}

          {type === 'category' && (
            <>
              <div className="form-group">
                <label>Tên chủ đề (ID) *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryData.name}
                  onChange={handleCategoryDataChange}
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
                  value={categoryData.displayName}
                  onChange={handleCategoryDataChange}
                  placeholder="Động vật, Màu sắc, etc."
                  className={errors.displayName ? 'error' : ''}
                />
                {errors.displayName && <span className="error-text">{errors.displayName}</span>}
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={categoryData.description}
                  onChange={handleCategoryDataChange}
                  placeholder="Mô tả ngắn về chủ đề này..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button 
              type="submit" 
              className="import-btn"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang import...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  Import
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="cancel-btn"
              disabled={uploading}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
