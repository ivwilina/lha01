const API_BASE_URL = 'http://localhost:3000';

// Helper function để lấy token từ localStorage
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

// Helper function để tạo headers với authorization
const getAuthHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Admin Authentication
export const adminLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (data.success && data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
    }

    return data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error;
  }
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminData');
};

export const getAdminData = () => {
  const adminData = localStorage.getItem('adminData');
  return adminData ? JSON.parse(adminData) : null;
};

export const isAdminAuthenticated = () => {
  return !!getAdminToken();
};

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error;
  }
};

// User Management
export const getAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Get all users error:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Delete user error:', error);
    throw error;
  }
};

// Category Management - sử dụng API hiện có
export const getAllCategories = async (params = {}) => {
  try {
    // Nếu không có params admin, sử dụng API category hiện có để lấy tất cả
    if (!params.page && !params.limit && !params.search) {
      const response = await fetch(`${API_BASE_URL}/category/`);
      const data = await response.json();
      
      // Transform data để match với admin expectation
      const transformedCategories = data.map(cat => ({
        _id: cat._id,
        name: cat.categoryTopic,
        displayName: cat.categoryTopic,
        description: `Chủ đề ${cat.categoryTopic} - ${cat.totalWords} từ vựng`,
        totalWords: cat.totalWords,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }));
      
      return {
        success: true,
        categories: transformedCategories,
        pagination: {
          page: 1,
          limit: transformedCategories.length,
          total: transformedCategories.length,
          pages: 1
        }
      };
    }
    
    // Sử dụng admin API cho pagination và search
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin/categories?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Get all categories error:', error);
    return {
      success: false,
      message: 'Lỗi khi lấy danh sách chủ đề'
    };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create category error:', error);
    return {
      success: false,
      message: 'Lỗi khi tạo chủ đề'
    };
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    return {
      success: false,
      message: 'Lỗi khi cập nhật chủ đề'
    };
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete category error:', error);
    return {
      success: false,
      message: 'Lỗi khi xóa chủ đề'
    };
  }
};

// Word Management - sử dụng admin API
export const getAllWords = async (params = {}) => {
  try {
    // Kiểm tra authentication trước
    const token = getAdminToken();
    if (!token) {
      return {
        success: false,
        message: 'Chưa đăng nhập admin. Vui lòng đăng nhập lại.'
      };
    }
    
    // Luôn sử dụng admin API để lấy words với category populated
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/admin/words?${queryParams}`;
    
    console.log('Calling getAllWords API:', url);
    console.log('Headers:', getAuthHeaders());
    
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return {
        success: false,
        message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
      };
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('getAllWords response data:', data);
    
    return data;
  } catch (error) {
    console.error('Get all words error:', error);
    return {
      success: false,
      message: 'Lỗi khi lấy danh sách từ vựng: ' + error.message
    };
  }
};

export const createWord = async (wordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/words`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(wordData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create word error:', error);
    return {
      success: false,
      message: 'Lỗi khi tạo từ vựng'
    };
  }
};

export const updateWord = async (wordId, wordData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/words/${wordId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(wordData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update word error:', error);
    return {
      success: false,
      message: 'Lỗi khi cập nhật từ vựng'
    };
  }
};

export const deleteWord = async (wordId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/words/${wordId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete word error:', error);
    return {
      success: false,
      message: 'Lỗi khi xóa từ vựng'
    };
  }
};

// Bulk Import Functions
export const importWordsFromFile = async (file, categoryId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryId', categoryId);

    const response = await fetch(`${API_BASE_URL}/admin/words/import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Import words from file error:', error);
    return {
      success: false,
      message: 'Lỗi khi import từ vựng từ file'
    };
  }
};

export const importCategoryWithWords = async (file, categoryData) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoryName', categoryData.name);
    formData.append('categoryDisplayName', categoryData.displayName);
    formData.append('categoryDescription', categoryData.description || '');

    const response = await fetch(`${API_BASE_URL}/admin/categories/import-with-words`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAdminToken()}`
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Import category with words error:', error);
    return {
      success: false,
      message: 'Lỗi khi import chủ đề và từ vựng từ file'
    };
  }
};

// Helper function để download template
export const downloadTemplate = (type = 'words') => {
  // Template đơn giản, dễ sử dụng
  const csvContent = 'english,vietnamese,pronunciation,example\napple,táo,/ˈæpəl/,"I eat an apple every day"\nbook,sách,/bʊk/,"This is a good book"\nwater,nước,/ˈwɔːtər/,"Please give me some water"';
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}-template-simple.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Helper functions để tích hợp với API hiện có
export const getPublicCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/`);
    const data = await response.json();
    return {
      success: true,
      categories: data
    };
  } catch (error) {
    console.error('Get public categories error:', error);
    throw error;
  }
};

export const getPublicWords = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/word/`);
    const data = await response.json();
    return {
      success: true,
      words: data
    };
  } catch (error) {
    console.error('Get public words error:', error);
    throw error;
  }
};

export const getWordsByCategory = async (categoryId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/category/words/${categoryId}`);
    const data = await response.json();
    return {
      success: true,
      words: data
    };
  } catch (error) {
    console.error('Get words by category error:', error);
    throw error;
  }
};
