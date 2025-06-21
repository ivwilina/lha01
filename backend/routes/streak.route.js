const express = require('express');
const router = express.Router();

const controller = require('../controllers/streak.controller');

//* initialize a streak for a user
router.post('/initialize', controller.initialize_streak);

//* extend the streak for a user
router.put('/extend', controller.extend_streak);

//* get the current streak for a user
router.get('/current/:userId', controller.get_current_streak);

//* end the streak for a user
router.put('/end', controller.end_streak);

module.exports = router;