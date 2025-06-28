const express = require('express');
const router = express.Router();

const controller = require('../controllers/streak.controller');

//* Initialize or get streak for a user
router.post('/initialize', controller.initialize_streak);

//* Update streak when user learns words
router.put('/update-words', controller.update_words_learned);

//* Update streak when user completes quiz
router.put('/update-quizz', controller.update_quiz_completed);

//* Get the current streak for a user
router.get('/current/:userId', controller.get_current_streak);

//* Get streak statistics and leaderboard
router.get('/stats/:userId', controller.get_streak_stats);

//* Get streak history for the past 7 days
router.get('/history/:userId', controller.get_streak_history);

//* Reset the streak for a user
router.put('/reset', controller.reset_streak);

module.exports = router;