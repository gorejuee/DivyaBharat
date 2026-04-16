const Groq = require('groq-sdk');
const { Place } = require('@server/db');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

    const systemPrompt = `You are DivyaBharat AI Guide, an expert on Indian heritage, spirituality, history and culture. 
      You are currently guiding a visitor about ${place.name}, located in ${place.city}, ${place.state}.

      Here is what we know about this place:
      Description: ${place.description}
      History: ${place.history || 'Not available'}
      Category: ${place.category}

      Answer the visitor's questions about this place in a warm, knowledgeable and engaging way. 
      Keep answers concise — 3 to 5 sentences unless the question needs more detail.
      If the question is completely unrelated to this place or Indian heritage, politely redirect.
      Always respond in English.`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    const answer = completion.choices[0].message.content;

    res.json({
      question,
      answer,
      place: {
        id: place.id,
        name: place.name
      }
    });
  } catch (err) {
    console.error('AI Guide error:', err);
    res.status(500).json({ message: 'AI Guide failed', error: err.message });
  }
};

module.exports = { askGuide };