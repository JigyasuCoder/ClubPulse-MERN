const Sentiment = require('sentiment');
const sentimentAnalyzer = new Sentiment();

function categorizeFeedback(comment, avgScore = 3) {
  if (!comment || comment.trim().length === 0) {
    return { sentiment: 'Neutral', category: 'Positive' };
  }

  const textTrimmed = comment.trim();
  const textLower = textTrimmed.toLowerCase();

  // 1. Gibberish / Random Keys Check (No spaces in >8 chars or non-vowel gibberish)
  const hasNoSpaces = !textTrimmed.includes(' ') && textTrimmed.length > 7;
  const vowelCount = (textLower.match(/[aeiou]/g) || []).length;
  const vowelRatio = vowelCount / textTrimmed.length;

  if (textTrimmed.length < 5 || hasNoSpaces || vowelRatio < 0.15) {
    return { sentiment: 'Neutral', category: 'Spam / Flagged' };
  }

  // 2. Logistics Keywords Check
  const logisticsKeywords = ['mic', 'audio', 'sound', 'venue', 'room', 'hall', 'time', 'delay', 'food', 'ac', 'projector', 'speaker'];
  if (logisticsKeywords.some(keyword => textLower.includes(keyword))) {
    const analysis = sentimentAnalyzer.analyze(comment);
    return { 
      sentiment: analysis.score >= 0 ? 'Positive' : 'Negative', 
      category: 'Logistics' 
    };
  }

  // 3. Constructive Criticism Keywords Check
  const constructiveKeywords = ['should', 'could', 'please', 'suggest', 'instead', 'better if', 'next time', 'improve', 'low', 'quiet', 'fast', 'slow'];
  if (constructiveKeywords.some(keyword => textLower.includes(keyword)) || (avgScore <= 3 && textTrimmed.length > 15)) {
    return { sentiment: 'Negative', category: 'Constructive Criticism' };
  }

  // 4. Default Sentiment Analysis
  const analysis = sentimentAnalyzer.analyze(comment);
  if (analysis.score > 0 || avgScore >= 4) {
    return { sentiment: 'Positive', category: 'Positive' };
  } else if (analysis.score < 0 || avgScore <= 2) {
    return { sentiment: 'Negative', category: 'Negative' };
  }

  return { sentiment: 'Neutral', category: 'Positive' };
}

module.exports = categorizeFeedback;