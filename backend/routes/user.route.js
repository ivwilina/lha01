/**
 * USER ROUTES
 * 
 * Định nghĩa các route endpoints cho user management
 * - POST /user/create: Tạo user mới
 * - POST /user/check: Kiểm tra user tồn tại
 * - POST /user/login: Đăng nhập user
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

// Route tạo user mới
router.post('/create', controller.create_new_user);

// Route kiểm tra user tồn tại
router.post('/check', controller.check_user_exists);

// Route đăng nhập user
router.post('/login', controller.login_user);

module.exports = router;
