/**
 * WORD MODEL
 * 
 * Schema định nghĩa cấu trúc dữ liệu cho từ vựng
 * - word: Từ tiếng Anh
 * - partOfSpeech: Loại từ (noun, verb, adjective, etc.)
 * - IPA: Phiên âm quốc tế
 * - meaning: Nghĩa tiếng Việt
 * - example: Câu ví dụ
 * - exampleForQuiz: Câu ví dụ cho quiz (thường có chỗ trống)
 * - timestamps: createdAt, updatedAt tự động
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Word Schema Definition
 * 
 * @description Schema cho collection words trong MongoDB
 */
const wordSchema = new Schema(
  {
    word: {
      type: String,
      required: true,
    },
    partOfSpeech: {
      type: String,
      required: true,
    },
    IPA: {
      type: String,
      required: true,
    },
    meaning: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      required: true,
    },
    exampleForQuiz: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

/**
 * Tạo và export Word model
 * 
 * @description Model để tương tác với collection 'words' trong MongoDB
 */
const word = mongoose.model("Word", wordSchema, "words");

module.exports = word;
