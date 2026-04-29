const db = require('../config/db');

// GET all stops
const getAllStops = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM stops ORDER BY stop_order ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET single stop
const getStopById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM stops WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST create stop
const createStop = async (req, res) => {
  const { name, latitude, longitude, stop_order, description } = req.body;

  if (!name || !latitude || !longitude) {
    return res.status(400).json({ error: 'Name, latitude and longitude are required.' });
  }

  // Validate coordinates
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO stops (name, latitude, longitude, stop_order, description) VALUES (?, ?, ?, ?, ?)',
      [name, latitude, longitude, stop_order || 0, description || null]
    );

    res.status(201).json({
      message: 'Stop created successfully.',
      stop_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT update stop
const updateStop = async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, stop_order, description, is_active } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM stops WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    const stop = rows[0];

    await db.query(
      `UPDATE stops 
       SET name = ?, latitude = ?, longitude = ?, stop_order = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [
        name || stop.name,
        latitude || stop.latitude,
        longitude || stop.longitude,
        stop_order !== undefined ? stop_order : stop.stop_order,
        description || stop.description,
        is_active !== undefined ? is_active : stop.is_active,
        id
      ]
    );

    res.json({ message: 'Stop updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE stop
const deleteStop = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM stops WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Stop not found.' });
    }

    await db.query('DELETE FROM stops WHERE id = ?', [id]);
    res.json({ message: 'Stop deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop
};