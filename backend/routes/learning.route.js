const express = require('express');
const router = express.Router();

const controller = require('../controllers/learning.controller');

//* Create a new learning record
router.post("/add", controller.create_learning_record);

//* Get all learning records
router.get("/get", controller.get_all_learning_records);

//* Get learning record by user ID
router.get("/get/:userId", controller.get_learning_record_by_user_id);

//* Update learning record by ID
router.put("/update/:id", controller.update_learning_record_by_id);

//* Add remembered words to a learning record
router.put("/add-remembered/:id", controller.add_word_to_learning_record);

//* Mark word as learned (convenient method)
router.post("/mark-learned", controller.mark_word_as_learned);

//* Remove word from learned list
router.post("/unmark-learned", controller.unmark_word_as_learned);

//* Get learning progress for specific user and category
router.get("/progress/:userId/:categoryId", controller.get_learning_progress);

//* Mark multiple words as learned (for quiz completion)
router.post("/mark-multiple-learned", controller.mark_multiple_words_as_learned);

//* Delete learning record by ID
router.delete("/delete/:id", controller.delete_learning_record_by_id);

module.exports = router;
