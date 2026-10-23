const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  coreRatings: { type: Map, of: Number },
  detailedRatings: { type: Map, of: Number },
  comment: { type: String, trim: true },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
  category: { 
    type: String, 
    enum: ['Positive', 'Negative', 'Constructive Criticism', 'Logistics', 'Spam / Flagged'], 
    default: 'Constructive Criticism' 
  },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);