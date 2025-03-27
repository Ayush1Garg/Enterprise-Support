const express = require('express');
const { authenticateLogin } = require('../controllers/userController');
const router = express.Router();

router.get('/login', authenticateLogin);

module.exports = router;