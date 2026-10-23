const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  eventType: { 
    type: String, 
    enum: ['Technical Workshop', 'Cultural / Fest', 'Hackathon', 'General Meeting'], 
    required: true 
  },
  passcode: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  criteria: [{
    key: { type: String, required: true },
    label: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);