// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Mechanic = require('../models/Mechanic');
const Customer = require('../models/Customer');

// @desc    Register a new mechanic
// @route   POST /api/auth/register/mechanic
// @access  Public
const registerMechanic = async (req, res) => {
  try {
    const { name, email, phone, password, workshopName, location } = req.body;

    // Generate mechanic ID
    const mechanicId = `MCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const mechanic = await Mechanic.create({
      name,
      email,
      phone,
      password,
      mechanicId,
      workshopName,
      location
    });

    // Generate token
    const token = generateToken(mechanic._id);

    res.status(201).json({
      _id: mechanic._id,
      name: mechanic.name,
      email: mechanic.email,
      mechanicId: mechanic.mechanicId,
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Authenticate mechanic/customer
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for user (mechanic or customer)
    let user = await Mechanic.findOne({ phone }) || await Customer.findOne({ phone });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password || '');

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.mechanicId ? 'mechanic' : 'customer',
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  registerMechanic,
  login,
  getMe
};