/**
 * WORD ROUTES
 * 
 * Định nghĩa các route endpoints cho word management
 * - POST /word/add: Tạo word mới
 * - POST /word/add/many: Tạo nhiều words
 * - POST /word/add/category-with-words: Tạo category với words
 * - GET /word/get: Lấy tất cả words
 * - POST /word/get/with-ids: Lấy words theo IDs
 * - GET /word/get/except-remembered: Lấy words chưa học
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/word.controller");

//* Tạo word mới
router.post("/add", controller.create_new_word);

//* Tạo nhiều words cùng lúc
router.post("/add/many", controller.create_new_words);

//* Tạo category với words
router.post("/add/category-with-words", controller.create_category_with_words);

//* Lấy tất cả words
router.get("/get", controller.get_all_words);

//* Lấy words theo IDs
router.post("/get/with-ids", controller.get_words_with_ids);

//* Lấy words chưa học (loại trừ remembered words)
router.get("/get/except/:learningId", controller.get_words_except_remembered);

module.exports = router;
