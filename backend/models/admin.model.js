/**
 * ADMIN MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho tài khoản admin
 * - username: Tên đăng nhập admin (unique)
 * - email: Email admin (unique)
 * - password: Mật khẩu đã hash
 * - role: Vai trò (admin | super_admin)
 * - isActive: Trạng thái kích hoạt
 * - lastLogin: Lần đăng nhập gần nhất
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Admin Schema Definition
 * 
 * @description Schema cho collection admins trong MongoDB
 */
const adminSchema = new Schema(
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
    role: {
      type: String,
      default: 'admin',
      enum: ['admin', 'super_admin']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Admin model
 * 
 * @description Model để tương tác với collection 'admins' trong MongoDB
 */
const Admin = mongoose.model('Admin', adminSchema, 'admins');
module.exports = Admin;
