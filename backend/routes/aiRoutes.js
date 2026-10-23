const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

router.post('/query', auth, async (req, res) => {
  try {
    const { eventId, userQuery } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ message: 'GEMINI_API_KEY is missing in backend .env file.' });
    }

    const filter = eventId ? { eventId } : {};
    const feedbackList = await Feedback.find(filter).select('coreRatings detailedRatings comment category sentiment');

    if (!feedbackList || feedbackList.length === 0) {
      return res.json({ answer: 'No feedback entries found for this event yet.' });
    }

    const context = JSON.stringify(feedbackList);
    const promptText = `You are ClubPulse AI assistant for CODEIO club admins. Analyzed feedback context from attendees: ${context}. Answer this question from the admin concisely in 2-3 sentences: ${userQuery}`;

    // Direct REST call to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini REST Error:', data);
      return res.status(500).json({ message: `AI API Error: ${data.error?.message || 'Failed to fetch response'}` });
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights generated.';
    res.json({ answer });
  } catch (err) {
    console.error('Gemini REST Backend Catch Error:', err);
    res.status(500).json({ message: `AI Processing failed: ${err.message}` });
  }
});

module.exports = router;