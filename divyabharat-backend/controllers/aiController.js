const Groq = require('groq-sdk');
const crypto = require('crypto');
const { Place, AiGuideCache } = require('@server/db');
const { getWikipediaSummary } = require('@server/services/wikipediaService');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const hashQuestion = (question) => {
  return crypto
    .createHash('md5')
    .update(question.trim().toLowerCase())
    .digest('hex');
};

const askGuide = async (req, res) => {
  try {
    const { placeId, question } = req.body;

    if (!placeId || !question) {
      return res.status(400).json({ message: 'placeId and question are required' });
    }

    const place = await Place.unscoped().findOne({
      where: { id: placeId },
      attributes: ['id', 'name', 'description', 'history', 'category', 'state', 'city']
    });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const questionHash = hashQuestion(question);

    const cached = await AiGuideCache.findOne({
      where: {
        place_id: placeId,
        question_hash: questionHash
      },
      attributes: ['question', 'answer']
    });

    if (cached) {
      return res.json({
        question: cached.question,
        answer: cached.answer,
        place: { id: place.id, name: place.name },
        cached: true
      });
    }

    const wikiContext = await getWikipediaSummary(place.name);

    const contextLines = [
      `Name: ${place.name}`,
      `Location: ${[place.city, place.state].filter(Boolean).join(', ')}`,
      `Category: ${place.category}`,
      place.description ? `Description: ${place.description}` : null,
      place.history ? `Known history: ${place.history}` : null,
      wikiContext?.extract
        ? `Additional context (use only verifiable facts from this, avoid contested claims): ${wikiContext.extract}`
        : null
    ].filter(Boolean).join('\n');

    const systemPrompt = `You are the DivyaBharat AI Guide — a knowledgeable, warm, and respectful companion for exploring India's spiritual and heritage sites.

      You are currently guiding a visitor about ${place.name}.

      Context about this place:
      ${contextLines}

      Guidelines for your response:
      - Focus on spiritual significance, architectural beauty, and cultural importance
      - Stick to well-established, verifiable facts about dates and patrons
      - Avoid politically contested historical narratives or disputed claims
      - When history is uncertain or debated, say so honestly rather than stating one version as fact
      - Speak with reverence for the place, its traditions, and the people who hold it sacred
      - Keep answers warm and engaging — 3 to 5 sentences unless more detail is genuinely needed
      - If the question is unrelated to this place or Indian heritage, politely redirect
      - Always respond in English`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    const answer = completion.choices[0].message.content;

    await AiGuideCache.create({
      place_id: placeId,
      question_hash: questionHash,
      question: question.trim(),
      answer
    });

    res.json({
      question,
      answer,
      place: {
        id: place.id,
        name: place.name
      },
      cached: false
    });
  } catch (err) {
    console.error('AI Guide error:', err);
    res.status(500).json({ message: 'AI Guide failed', error: err.message });
  }
};

module.exports = { askGuide };