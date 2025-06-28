/**
 * USER CONTROLLER
 * 
 * Xử lý các chức năng liên quan đến người dùng:
 * - Tạo user mới
 * - Kiểm tra user tồn tại  
 * - Đăng nhập user
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const User = require('../models/user.model');

/**
 * Tạo user mới
 * 
 * @desc Đăng ký tài khoản người dùng mới
 * @route POST /user/create
 * @access Public
 * @param {Object} req.body - { username, email, password }
 * @returns {Object} Thông tin user vừa tạo
 */
const create_new_user = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Tạo user mới trong database
    const newUser = await User.create({ username, email, password });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Kiểm tra user có tồn tại không
 * 
 * @desc Kiểm tra username hoặc email đã được sử dụng chưa
 * @route POST /user/check
 * @access Public
 * @param {Object} req.body - { username?, email? }
 * @returns {Object} { exists: boolean }
 */
const check_user_exists = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ message: "Username or email is required." });
    }

    // Tìm user theo username hoặc email
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(404).json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Đăng nhập user
 * 
 * @desc Xác thực user bằng email và password
 * @route POST /user/login
 * @access Public
 * @param {Object} req.body - { email, password }
 * @returns {Object} Thông tin user và message thành công
 */
const login_user = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Tìm user với email và password trùng khớp
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create_new_user,
  check_user_exists,
  login_user,
};