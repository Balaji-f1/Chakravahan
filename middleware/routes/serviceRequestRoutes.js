// routes/serviceRequestRoutes.js
const express = require('express');
const router = express.Router();
const {
  createServiceRequest,
  getAvailableServiceRequests,
  acceptServiceRequest,
  updateServiceRequestStatus,
  getServiceHistory
} = require('../controllers/serviceRequestController');
const { validateServiceRequest } = require('../middleware/validation');
const { protect, isCustomer, isMechanic } = require('../middleware/auth');

router.post('/', protect, isCustomer, validateServiceRequest, createServiceRequest);
router.get('/available', protect, isMechanic, getAvailableServiceRequests);
router.put('/:id/accept', protect, isMechanic, acceptServiceRequest);
router.put('/:id/status', protect, isMechanic, updateServiceRequestStatus);
router.get('/history', protect, isCustomer, getServiceHistory);

module.exports = router;