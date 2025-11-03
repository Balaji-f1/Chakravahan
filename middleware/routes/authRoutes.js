// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerMechanic, login, getMe } = require('../controllers/authController');
const { validateMechanicRegistration } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

router.post('/register/mechanic', validateMechanicRegistration, registerMechanic);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;