/**
 * CATEGORY MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho chủ đề/danh mục từ vựng
 * - categoryTopic: Tên chủ đề (ví dụ: "Animals", "Colors") 
 * - totalWords: Tổng số từ vựng trong chủ đề này
 * - words: Mảng ID tham chiếu đến các Word documents
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Category Schema Definition
 * 
 * @description Schema cho collection categories trong MongoDB
 */
const categorySchema = new Schema(
  {
    categoryTopic: {
      type: String,
      required: true,
    },
    totalWords: {
      type: Number,
      required: true,
      default: 0,
    },
    words: {
      type: Array,
      required: false
    }
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Category model
 * 
 * @description Model để tương tác với collection 'categories' trong MongoDB
 */
const category = mongoose.model("Category", categorySchema, "categories");

module.exports = category;
