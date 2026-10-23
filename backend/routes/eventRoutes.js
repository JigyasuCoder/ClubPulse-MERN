const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// GET all events with dynamic feedback count
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).lean();

    // Attach total feedback counts dynamically
    const eventsWithCount = await Promise.all(
      events.map(async (evt) => {
        const count = await Feedback.countDocuments({ eventId: evt._id });
        return { ...evt, feedbackCount: count };
      })
    );

    res.json(eventsWithCount);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching event details' });
  }
});

// POST create new event
router.post('/', auth, async (req, res) => {
  try {
    const { title, eventType, description, passcode, criteria } = req.body;
    const newEvent = new Event({
      title,
      eventType,
      description,
      passcode,
      criteria,
    });
    await newEvent.save();
    res.status(201).json({ ...newEvent.toObject(), feedbackCount: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating event' });
  }
});

module.exports = router;
// PUT update event details & criteria
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, passcode, criteria } = req.body;
    
    // Ensure minimum criteria count is enforced
    if (criteria && criteria.length < 5) {
      return res.status(400).json({ message: 'Events must have at least 5 evaluation questions.' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, passcode, criteria },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating event' });
  }
});