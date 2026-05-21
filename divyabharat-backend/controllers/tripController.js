const Groq = require('groq-sdk');
const { Trip, TripPlace } = require('@server/db');
const sequelize = require('@server/config/database');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const trips = await Trip.findAll({
      where: { user_id: userId },
      attributes: ['id', 'name', 'description', 'total_days', 'start_date', 'end_date', 'created_at'],
      include: [{
        model: TripPlace,
        as: 'tripPlaces',
        attributes: ['id', 'destination_name', 'destination_city', 'destination_state', 'day_number'],
        separate: true,
        order: [['day_number', 'ASC'], ['order', 'ASC']]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json({ trips });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, total_days, start_date, end_date } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Trip name is required.' });
    }

    const trip = await Trip.create({
      user_id: userId,
      name: name.trim(),
      description: description?.trim() || null,
      total_days: total_days || null,
      start_date: start_date || null,
      end_date: end_date || null
    });

    res.status(201).json({ trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const trip = await Trip.findOne({
      where: { id, user_id: userId },
      attributes: ['id', 'name', 'description', 'total_days', 'start_date', 'end_date', 'created_at'],
      include: [{
        model: TripPlace,
        as: 'tripPlaces',
        attributes: [
          'id', 'place_id', 'destination_name', 'destination_city', 'destination_state',
          'latitude', 'longitude', 'day_number', 'order', 'duration_hours', 'visit_date', 'notes'
        ],
        separate: true,
        order: [['day_number', 'ASC'], ['order', 'ASC']]
      }]
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    res.json({ trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, total_days, start_date, end_date } = req.body;

    const trip = await Trip.findOne({
      where: { id, user_id: userId },
      attributes: ['id', 'name', 'description', 'total_days', 'start_date', 'end_date']
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    if (name !== undefined) trip.name = name.trim();
    if (description !== undefined) trip.description = description?.trim() || null;
    if (total_days !== undefined) trip.total_days = total_days || null;
    if (start_date !== undefined) trip.start_date = start_date || null;
    if (end_date !== undefined) trip.end_date = end_date || null;

    await trip.save();
    res.json({ trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const trip = await Trip.findOne({ where: { id, user_id: userId }, attributes: ['id'] });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    await trip.destroy();
    res.json({ message: 'Trip deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addStop = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { destination_name, destination_city, destination_state, latitude, longitude,
      day_number, duration_hours, visit_date, notes, place_id } = req.body;

    if (!destination_name?.trim()) {
      return res.status(400).json({ message: 'destination_name is required.' });
    }

    const trip = await Trip.findOne({ where: { id, user_id: userId }, attributes: ['id'] });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const targetDay = day_number || 1;
    const maxEntry = await TripPlace.findOne({
      where: { trip_id: id, day_number: targetDay },
      order: [['order', 'DESC']],
      attributes: ['order']
    });
    const nextOrder = maxEntry ? maxEntry.order + 1 : 0;

    const stop = await TripPlace.create({
      trip_id: id,
      place_id: place_id || null,
      destination_name: destination_name.trim(),
      destination_city: destination_city?.trim() || null,
      destination_state: destination_state?.trim() || null,
      latitude: latitude || null,
      longitude: longitude || null,
      day_number: targetDay,
      order: nextOrder,
      duration_hours: duration_hours || null,
      visit_date: visit_date || null,
      notes: notes?.trim() || null
    });

    res.status(201).json({ stop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeStop = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, stopId } = req.params;

    const trip = await Trip.findOne({ where: { id, user_id: userId }, attributes: ['id'] });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const deleted = await TripPlace.destroy({ where: { id: stopId, trip_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Stop not found in this trip.' });

    res.json({ message: 'Stop removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateStop = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, stopId } = req.params;
    const { destination_name, destination_city, destination_state, duration_hours, visit_date, notes } = req.body;

    const trip = await Trip.findOne({ where: { id, user_id: userId }, attributes: ['id'] });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const stop = await TripPlace.findOne({
      where: { id: stopId, trip_id: id },
      attributes: ['id', 'destination_name', 'destination_city', 'destination_state', 'duration_hours', 'visit_date', 'notes']
    });
    if (!stop) return res.status(404).json({ message: 'Stop not found in this trip.' });

    if (destination_name !== undefined) stop.destination_name = destination_name.trim();
    if (destination_city !== undefined) stop.destination_city = destination_city?.trim() || null;
    if (destination_state !== undefined) stop.destination_state = destination_state?.trim() || null;
    if (duration_hours !== undefined) stop.duration_hours = duration_hours || null;
    if (visit_date !== undefined) stop.visit_date = visit_date || null;
    if (notes !== undefined) stop.notes = notes?.trim() || null;

    await stop.save();
    res.json({ stop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const reorderStops = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { order } = req.body;

    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'order must be an array.' });
    }

    const trip = await Trip.findOne({ where: { id, user_id: userId }, attributes: ['id'] });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    await Promise.all(
      order.map((item) =>
        TripPlace.update(
          { order: item.order, day_number: item.day_number },
          { where: { id: item.id, trip_id: id } }
        )
      )
    );

    res.json({ message: 'Order updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const aiPlanTrip = async (req, res) => {
  try {
    const userId = req.user.id;
    const { destinations, days, style, notes, start_date } = req.body;

    if (!destinations?.trim() || !days || days < 1 || days > 30) {
      return res.status(400).json({ message: 'destinations and days (1-30) are required.' });
    }

    const systemPrompt = `You are DivyaBharat's AI Trip Planner — an expert on Indian spiritual and heritage travel.

Generate a day-by-day trip itinerary as valid JSON. Return ONLY the JSON object, no explanation, no markdown, no code blocks.

JSON structure:
{
  "trip_name": "Concise evocative trip title",
  "description": "1-2 sentence trip summary",
  "days": [
    {
      "day_number": 1,
      "city": "Primary city for the day",
      "state": "Full state name",
      "stops": [
        {
          "destination_name": "Specific place name",
          "destination_city": "City",
          "destination_state": "State",
          "latitude": 25.3176,
          "longitude": 82.9739,
          "duration_hours": 2.0,
          "notes": "1-2 sentences: what to do, best time, spiritual significance"
        }
      ]
    }
  ]
}

Rules:
- 2-4 stops per day, mix temples/ghats/forts/monuments/sacred sites
- duration_hours: realistic float between 0.5 and 4.0
- latitude/longitude: accurate coordinates for the specific place
- notes: practical and insightful, respectful of spiritual significance
- Travel style: ${style || 'spiritual and heritage'}
- Only return valid JSON, absolutely nothing else`;

    const userPrompt = `Plan a ${days}-day trip to: ${destinations.trim()}${notes ? `. Additional preferences: ${notes}` : ''}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const rawContent = completion.choices[0].message.content.trim();

    let itinerary;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      itinerary = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch (parseErr) {
      return res.status(500).json({ message: 'AI returned invalid JSON. Please try again.' });
    }

    if (!itinerary.days || !Array.isArray(itinerary.days)) {
      return res.status(500).json({ message: 'AI response missing itinerary. Please try again.' });
    }

    const transaction = await sequelize.transaction();
    try {
      let end_date = null;
      if (start_date) {
        const d = new Date(start_date + 'T00:00:00');
        d.setDate(d.getDate() + days - 1);
        end_date = d.toISOString().split('T')[0];
      }

      const trip = await Trip.create({
        user_id: userId,
        name: itinerary.trip_name || `${days}-Day Trip to ${destinations}`,
        description: itinerary.description || null,
        total_days: days,
        start_date: start_date || null,
        end_date
      }, { transaction });

      const stopRows = [];
      for (const day of itinerary.days) {
        if (!Array.isArray(day.stops)) continue;
        day.stops.forEach((stop, idx) => {
          if (!stop.destination_name) return;
          stopRows.push({
            trip_id: trip.id,
            place_id: null,
            destination_name: stop.destination_name,
            destination_city: stop.destination_city || day.city || null,
            destination_state: stop.destination_state || day.state || null,
            latitude: stop.latitude || null,
            longitude: stop.longitude || null,
            day_number: day.day_number || 1,
            order: idx,
            duration_hours: stop.duration_hours || null,
            notes: stop.notes || null
          });
        });
      }

      await TripPlace.bulkCreate(stopRows, { transaction });
      await transaction.commit();

      res.status(201).json({ tripId: trip.id, tripName: trip.name });
    } catch (dbErr) {
      await transaction.rollback();
      throw dbErr;
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  addStop,
  removeStop,
  updateStop,
  reorderStops,
  aiPlanTrip
};
