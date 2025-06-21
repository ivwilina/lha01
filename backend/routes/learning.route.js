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

//* Delete learning record by ID
router.delete("/delete/:id", controller.delete_learning_record_by_id);

module.exports = router;
