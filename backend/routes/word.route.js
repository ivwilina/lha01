const express = require("express");
const router = express.Router();

const controller = require("../controllers/word.controller");

//*create new word
router.post("/add", controller.create_new_word);

//*create new words
router.post("/add/many", controller.create_new_words);

//* create category with words
router.post("/add/category-with-words", controller.create_category_with_words);

//*get all words
router.get("/get", controller.get_all_words);

//* get words with ids
router.post("/get/with-ids", controller.get_words_with_ids);

//*get words except remembered words in learning record
router.get("/get/except/:learningId", controller.get_words_except_remembered);

module.exports = router;
