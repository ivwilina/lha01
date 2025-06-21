const express = require("express");
const router = express.Router();

const controller = require("../controllers/category.controller");

  //*create new category*/
router.post("/add", controller.create_category);

  //*get all categories*/
router.get("/", controller.get_all_categories);

  //*get category by id*/
router.get("/list/:id", controller.get_category_by_id);

  //*get all words in a category*/
router.get("/words/:id", controller.get_words_in_category);
  //*update category by id*/
router.put("/update/:id", controller.update_category_by_id);

  //*get words with specific IDs*/
router.post("/words-with-ids", controller.get_words_with_ids);

module.exports = router;
