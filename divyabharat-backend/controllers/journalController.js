const { JournalEntry, Trip } = require('@server/db');

const getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Trip, as: 'trip', attributes: ['id', 'name'] }],
      order: [
        ['visit_date', 'ASC NULLS LAST'],
        ['created_at', 'ASC']
      ],
      attributes: ['id', 'title', 'content', 'location_name', 'visit_date', 'trip_id', 'createdAt', 'updatedAt']
    });
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createEntry = async (req, res) => {
  try {
    const { title, content, location_name, visit_date, trip_id } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required.' });
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required.' });

    if (trip_id) {
      const trip = await Trip.findOne({ where: { id: trip_id, user_id: req.user.id }, attributes: ['id'] });
      if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    }

    const entry = await JournalEntry.create({
      user_id: req.user.id,
      title: title.trim(),
      content: content.trim(),
      location_name: location_name?.trim() || null,
      visit_date: visit_date || null,
      trip_id: trip_id || null
    });

    const full = await JournalEntry.findOne({
      where: { id: entry.id },
      include: [{ model: Trip, as: 'trip', attributes: ['id', 'name'] }]
    });

    res.status(201).json({ entry: full });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });

    const { title, content, location_name, visit_date, trip_id } = req.body;

    if (title !== undefined && !title?.trim()) return res.status(400).json({ message: 'Title cannot be empty.' });
    if (content !== undefined && !content?.trim()) return res.status(400).json({ message: 'Content cannot be empty.' });

    if (trip_id !== undefined && trip_id !== null) {
      const trip = await Trip.findOne({ where: { id: trip_id, user_id: req.user.id }, attributes: ['id'] });
      if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    }

    await entry.update({
      ...(title !== undefined && { title: title.trim() }),
      ...(content !== undefined && { content: content.trim() }),
      ...(location_name !== undefined && { location_name: location_name?.trim() || null }),
      ...(visit_date !== undefined && { visit_date: visit_date || null }),
      ...(trip_id !== undefined && { trip_id: trip_id || null })
    });

    const full = await JournalEntry.findOne({
      where: { id: entry.id },
      include: [{ model: Trip, as: 'trip', attributes: ['id', 'name'] }]
    });

    res.json({ entry: full });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!entry) return res.status(404).json({ message: 'Entry not found.' });
    await entry.destroy();
    res.json({ message: 'Entry deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getEntries, createEntry, updateEntry, deleteEntry };
