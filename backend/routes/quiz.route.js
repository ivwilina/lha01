const express = require('express');
const router = express.Router();

const controller = require('../controllers/quiz.controller');

//* Create a new quiz (legacy)
router.post("/create", controller.create_quiz);

//* Create category quiz from learned words
router.post("/create/category", controller.create_category_quiz);

//* Create comprehensive quiz from all learned words
router.post("/create/comprehensive", controller.create_comprehensive_quiz);

//* Create random quiz from all available words
router.post("/create/random", controller.create_random_quiz);

//* Get quiz by ID
router.get("/:id", controller.get_quiz_by_id);

//* Submit quiz answers
router.post("/:id/submit", controller.submit_quiz);

//* Get user quiz history
router.get("/history/:userId", controller.get_user_quiz_history);

module.exports = router;
