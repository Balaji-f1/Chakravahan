// models/Mechanic.js
const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  mechanicId: {
    type: String,
    required: true,
    unique: true
  },
  workshopName: {
    type: String,
    required: true
  },
  location: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  experience: Number,
  specialties: [String],
  services: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  totalServices: {
    type: Number,
    default: 0
  },
  successRate: Number,
  documents: {
    mechanicLicense: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      expiry: Date
    },
    workshopRegistration: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      expiry: Date
    },
    gstCertificate: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
    },
    panCard: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
    },
    bankDetails: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      accountNumber: String,
      ifscCode: String
    },
    insurance: {
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      expiry: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mechanic', MechanicSchema);