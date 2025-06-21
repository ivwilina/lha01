// API base URL
const API_BASE_URL = 'http://localhost:3000';

/**
 * Đăng ký người dùng mới
 * @param {string} username - Tên người dùng
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @returns {Promise} Kết quả từ API
 */
export const register = async (username, email, password) => {
  const response = await fetch(`${API_BASE_URL}/user/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Đã xảy ra lỗi khi đăng ký.');
  }
  
  return data;
};

/**
 * Kiểm tra xem người dùng có tồn tại không
 * @param {string} email - Email
 * @param {string} username - Tên người dùng
 * @returns {Promise} Kết quả từ API
 */
export const checkUserExists = async (email, username) => {
  const response = await fetch(`${API_BASE_URL}/user/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      username
    }),
  });
  
  return await response.json();
};

/**
 * Đăng nhập người dùng
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @returns {Promise} Token và thông tin người dùng
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Đăng nhập thất bại.');
  }
  
  return data;
};
