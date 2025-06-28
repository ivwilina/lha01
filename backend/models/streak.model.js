/**
 * STREAK MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho hệ thống streak (chuỗi học tập)
 * - user: ID tham chiếu đến User (unique per user)
 * - streakCount: Số ngày streak hiện tại
 * - startDate: Ngày bắt đầu streak hiện tại
 * - endDate: Ngày gần nhất có hoạt động
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Streak Schema Definition
 * 
 * @description Schema cho collection streaks trong MongoDB
 * @description Theo dõi chuỗi học tập liên tiếp của user
 */
const streakSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    streakCount: {
      type: Number,
      required: true,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Streak model
 * 
 * @description Model để tương tác với collection 'streaks' trong MongoDB
 */
const streak = mongoose.model('Streak', streakSchema, 'streaks');
module.exports = streak;
