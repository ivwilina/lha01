/**
 * QUIZ MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho bài quiz/kiểm tra
 * - words: Mảng ID tham chiếu đến các Words sử dụng trong quiz
 * - questions: Object chứa các câu hỏi đã generate
 * - numOfQuestion: Số lượng câu hỏi trong quiz
 * - createdDate: Ngày tạo quiz
 * - logs: Object chứa log submission của users
 * - summary: Mô tả ngắn về quiz
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Quiz Schema Definition
 * 
 * @description Schema cho collection quizzes trong MongoDB
 */
const quizSchema = new Schema(
  {
    words: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
      required: true,
    }],
    questions: {
      type: Object,
      required: true,
    },
    numOfQuestion: {
      type: Number,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    logs: {
      type: Object,
      default: {},
    },
    summary: {
      type: String,
      default: '',
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Quiz model
 * 
 * @description Model để tương tác với collection 'quizzes' trong MongoDB
 */
const quiz = mongoose.model('Quiz', quizSchema, 'quizzes');
module.exports = quiz;
