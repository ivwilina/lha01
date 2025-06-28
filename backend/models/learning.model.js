/**
 * LEARNING MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho tiến độ học tập
 * - user: ID tham chiếu đến User
 * - category: ID tham chiếu đến Category  
 * - remembered: Mảng ID các từ vựng đã học/nhớ
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Learning Schema Definition
 * 
 * @description Schema cho collection learning trong MongoDB
 * @description Theo dõi tiến độ học tập của user theo từng category
 */
const learningSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    remembered: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
    }],
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Learning model
 * 
 * @description Model để tương tác với collection 'learning' trong MongoDB
 */
const learning = mongoose.model('Learning', learningSchema, 'learning');
module.exports = learning;
