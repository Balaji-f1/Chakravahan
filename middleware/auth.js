// middleware/auth.js
const jwt = require('jsonwebtoken');
const Mechanic = require('./models/Mechanic');
const Customer = require('./models/Customer');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is mechanic or customer
      req.user = await Mechanic.findById(decoded.id).select('-password') || 
                 await Customer.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

const isMechanic = (req, res, next) => {
  if (req.user && req.user.mechanicId) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as mechanic' });
  }
};

const isCustomer = (req, res, next) => {
  if (req.user && !req.user.mechanicId) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as customer' });
  }
};

module.exports = { protect, isMechanic, isCustomer };