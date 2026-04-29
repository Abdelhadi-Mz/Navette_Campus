const db = require('../config/db');
const bcrypt = require('bcrypt');

// GET all shuttles
const getAllShuttles = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, plate_number, capacity, status, driver_name, created_at FROM shuttles'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET active shuttles only
const getActiveShuttles = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.name, s.plate_number, s.capacity, s.driver_name,
        t.id as trip_id, t.status as trip_status, t.started_at,
        p.latitude, p.longitude, p.recorded_at
       FROM shuttles s
       LEFT JOIN shuttle_trips t ON t.shuttle_id = s.id AND t.status = 'active'
       LEFT JOIN positions p ON p.trip_id = t.id
       WHERE s.status = 'active'
       AND (p.id IS NULL OR p.id = (
         SELECT id FROM positions 
         WHERE trip_id = t.id 
         ORDER BY recorded_at DESC LIMIT 1
       ))`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET single shuttle
const getShuttleById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT id, name, plate_number, capacity, status, driver_name, created_at FROM shuttles WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shuttle not found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST create shuttle
const createShuttle = async (req, res) => {
  const { name, plate_number, capacity, driver_name, pin } = req.body;

  if (!name || !driver_name || !pin) {
    return res.status(400).json({ error: 'Name, driver_name and pin are required.' });
  }

  try {
    const hashedPin = await bcrypt.hash(pin, 10);

    const [result] = await db.query(
      'INSERT INTO shuttles (name, plate_number, capacity, driver_name, driver_token) VALUES (?, ?, ?, ?, ?)',
      [name, plate_number || null, capacity || 20, driver_name, hashedPin]
    );

    res.status(201).json({
      message: 'Shuttle created successfully.',
      shuttle_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT update shuttle
const updateShuttle = async (req, res) => {
  const { id } = req.params;
  const { name, plate_number, capacity, driver_name, status, pin } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM shuttles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shuttle not found.' });
    }

    const shuttle = rows[0];

    // Only hash new pin if provided
    let hashedPin = shuttle.driver_token;
    if (pin) {
      hashedPin = await bcrypt.hash(pin, 10);
    }

    await db.query(
      `UPDATE shuttles 
       SET name = ?, plate_number = ?, capacity = ?, driver_name = ?, status = ?, driver_token = ?
       WHERE id = ?`,
      [
        name || shuttle.name,
        plate_number || shuttle.plate_number,
        capacity || shuttle.capacity,
        driver_name || shuttle.driver_name,
        status || shuttle.status,
        hashedPin,
        id
      ]
    );

    res.json({ message: 'Shuttle updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE shuttle
const deleteShuttle = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM shuttles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Shuttle not found.' });
    }

    await db.query('DELETE FROM shuttles WHERE id = ?', [id]);
    res.json({ message: 'Shuttle deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  getAllShuttles,
  getActiveShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  deleteShuttle
};