const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const categorizeFeedback = require('../utils/categorizer');

// POST /api/feedback (Submit public anonymous feedback)
router.post('/', async (req, res) => {
  try {
    const { eventId, coreRatings, detailedRatings, comment } = req.body;

    const event = await Event.findById(eventId);
    if (!event || !event.isActive) {
      return res.status(400).json({ message: 'Event is inactive or does not exist' });
    }

    // Calculate average score for the categorization helper
    const coreValues = Object.values(coreRatings || {}).map(Number);
    const avgScore = coreValues.length 
      ? coreValues.reduce((a, b) => a + b, 0) / coreValues.length 
      : 3;

    // Run backend classification
    const { sentiment, category } = categorizeFeedback(comment, avgScore);

    const feedback = new Feedback({
      eventId,
      coreRatings,
      detailedRatings,
      comment,
      sentiment,
      category
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
});

// GET /api/feedback/:eventId (Get all feedback for an event - Protected Admin Route)
router.get('/:eventId', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback', error: err.message });
  }
});

// PUT /api/feedback/:id/resolve (Toggle resolution status - Protected Admin Route)
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    feedback.isResolved = !feedback.isResolved;
    await feedback.save();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: 'Error updating feedback status', error: err.message });
  }
});

module.exports = router;