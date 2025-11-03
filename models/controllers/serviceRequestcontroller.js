// controllers/serviceRequestController.js
const ServiceRequest = require('../models/ServiceRequest');
const Mechanic = require('../models/Mechanic');
const { sendPushNotification, sendSMS } = require('../utils/notifications');
const { findNearbyMechanics } = require('../utils/location');

// @desc    Create new service request
// @route   POST /api/service-requests
// @access  Private (Customer)
const createServiceRequest = async (req, res) => {
  try {
    const { bikeModel, serviceType, issue, location, estimatedTime, estimatedCost, urgency } = req.body;
    
    const serviceRequest = await ServiceRequest.create({
      customer: req.user._id,
      bikeModel,
      serviceType,
      issue,
      location,
      estimatedTime,
      estimatedCost,
      urgency
    });

    // Find nearby mechanics and notify them
    const nearbyMechanics = await findNearbyMechanics(
      location.coordinates.lat,
      location.coordinates.lng
    );

    // Notify mechanics
    for (const mechanic of nearbyMechanics) {
      await sendPushNotification(
        mechanic._id,
        'New Service Request',
        `New request for ${serviceType} on ${bikeModel}`,
        { requestId: serviceRequest._id.toString() }
      );
      
      await sendSMS(
        mechanic.phone,
        `New service request available: ${serviceType} on ${bikeModel}. Estimated cost: ₹${estimatedCost}. Login to accept.`
      );
    }

    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get service requests for mechanic
// @route   GET /api/service-requests/available
// @access  Private (Mechanic)
const getAvailableServiceRequests = async (req, res) => {
  try {
    const mechanicLocation = req.user.location.coordinates;
    
    const requests = await ServiceRequest.find({
      status: 'pending',
      'location.coordinates.lat': { $exists: true },
      'location.coordinates.lng': { $exists: true }
    });

    // Filter requests within 10km radius
    const nearbyRequests = requests.filter(request => {
      const distance = calculateDistance(
        mechanicLocation.lat,
        mechanicLocation.lng,
        request.location.coordinates.lat,
        request.location.coordinates.lng
      );
      return distance <= 10; // 10km radius
    });

    res.json(nearbyRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Accept service request
// @route   PUT /api/service-requests/:id/accept
// @access  Private (Mechanic)
const acceptServiceRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request already accepted or completed' });
    }

    request.mechanic = req.user._id;
    request.status = 'accepted';
    await request.save();

    // Notify customer
    const customer = await Customer.findById(request.customer);
    if (customer) {
      await sendSMS(
        customer.phone,
        `Your service request for ${request.bikeModel} has been accepted by ${req.user.name}. They will contact you shortly.`
      );
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id/status
// @access  Private (Mechanic)
const updateServiceRequestStatus = async (req, res) => {
  try {
    const { status, actualCost } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Service request not found' });
    }

    if (request.mechanic.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    request.status = status;
    if (actualCost) request.actualCost = actualCost;
    if (status === 'completed') request.completedAt = new Date();

    await request.save();

    // Notify customer when completed
    if (status === 'completed') {
      const customer = await Customer.findById(request.customer);
      if (customer) {
        await sendSMS(
          customer.phone,
          `Your service for ${request.bikeModel} has been completed by ${req.user.name}. Total cost: ₹${actualCost || request.estimatedCost}. Please provide feedback.`
        );
      }
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get customer's service history
// @route   GET /api/service-requests/history
// @access  Private (Customer)
const getServiceHistory = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user._id })
      .populate('mechanic', 'name workshopName phone rating')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createServiceRequest,
  getAvailableServiceRequests,
  acceptServiceRequest,
  updateServiceRequestStatus,
  getServiceHistory
};