const express = require('express');
const router = express.Router();

const controller = require('../controllers/user.controller');

router.post('/create', controller.create_new_user);
router.post('/check', controller.check_user_exists);
router.post('/login', controller.login_user);

module.exports = router;
