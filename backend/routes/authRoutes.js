const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);

module.exports = router;
