/**
 * CATEGORY ROUTES
 * 
 * Định nghĩa các route endpoints cho category management
 * - POST /category/add: Tạo category mới
 * - GET /category/: Lấy tất cả categories
 * - GET /category/list/:id: Lấy category theo ID
 * - PUT /category/update/:id: Cập nhật category
 * - GET /category/words/:id: Lấy words trong category
 * - POST /category/words-with-ids: Lấy words theo IDs
 * 
 * @author LeHaiAnh
 * @version 1.0.0
 */

const express = require("express");
const router = express.Router();

const controller = require("../controllers/category.controller");

//* Tạo category mới
router.post("/add", controller.create_category);

//* Lấy tất cả categories
router.get("/", controller.get_all_categories);

//* Lấy category theo ID
router.get("/list/:id", controller.get_category_by_id);

//* Lấy tất cả words trong category
router.get("/words/:id", controller.get_words_in_category);

//* Cập nhật category theo ID
router.put("/update/:id", controller.update_category_by_id);

//* Lấy words theo IDs cụ thể
router.post("/words-with-ids", controller.get_words_with_ids);

module.exports = router;
