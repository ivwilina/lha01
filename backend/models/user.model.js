/**
 * USER MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho người dùng trong hệ thống
 * - username: Tên đăng nhập (unique)
 * - email: Email (unique) 
 * - password: Mật khẩu đã hash
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema Definition
 * 
 * @description Schema cho collection users trong MongoDB
 */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export User model
 * 
 * @description Model để tương tác với collection 'users' trong MongoDB
 */
const user = mongoose.model('User', userSchema, 'users');
module.exports = user;