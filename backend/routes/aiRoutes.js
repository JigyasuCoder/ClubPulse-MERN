const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// Initialize Groq SDK with your environment variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/query', auth, async (req, res) => {
  try {
    const { eventId, userQuery } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(400).json({ message: 'GROQ_API_KEY is missing in backend environment.' });
    }

    const filter = eventId ? { eventId } : {};
    const feedbackList = await Feedback.find(filter).select('coreRatings detailedRatings comment category sentiment');

    if (!feedbackList || feedbackList.length === 0) {
      return res.json({ answer: 'No feedback entries found for this event yet.' });
    }

    const context = JSON.stringify(feedbackList);
    const promptText = `You are ClubPulse AI assistant for CODEIO club admins. Analyzed feedback context from attendees: ${context}. Answer this question from the admin concisely in 2-3 sentences: ${userQuery}`;

    // Call Groq API using Llama 3.3
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are ClubPulse AI assistant for CODEIO club admins analyzing event feedback.',
        },
        {
          role: 'user',
          content: promptText,
        },
      ],
      model: 'openai/gpt-oss-120b',
    });

    const answer = chatCompletion.choices?.[0]?.message?.content || 'No insights generated.';
    res.json({ answer });
  } catch (err) {
    console.error('Groq AI Backend Error:', err);
    res.status(500).json({ message: `AI Processing failed: ${err.message}` });
  }
});

module.exports = router;
