const db = require('../config/db');

// POST send GPS position (driver only)
const sendPosition = async (req, res) => {
  const shuttle_id = req.user.id; // from JWT token
  const { latitude, longitude, speed_kmh } = req.body;

  // Validate required fields
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  // Validate coordinates range
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'Invalid coordinates.' });
  }

  try {
    // Find the active trip for this shuttle
    const [trips] = await db.query(
      'SELECT * FROM shuttle_trips WHERE shuttle_id = ? AND status = "active"',
      [shuttle_id]
    );

    if (trips.length === 0) {
      return res.status(400).json({ 
        error: 'No active trip found for this shuttle. Start a trip first.' 
      });
    }

    const trip = trips[0];

    // Save position
    const [result] = await db.query(
      'INSERT INTO positions (trip_id, shuttle_id, latitude, longitude, speed_kmh) VALUES (?, ?, ?, ?, ?)',
      [trip.id, shuttle_id, latitude, longitude, speed_kmh || 0]
    );

    res.status(201).json({
      message: 'Position recorded.',
      position_id: result.insertId,
      trip_id: trip.id,
      shuttle_id,
      latitude,
      longitude,
      speed_kmh: speed_kmh || 0,
      recorded_at: new Date()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET latest position of each active shuttle (public)
const getLatestPositions = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        s.id as shuttle_id,
        s.name as shuttle_name,
        s.driver_name,
        t.id as trip_id,
        t.status as trip_status,
        t.delay_minutes,
        p.latitude,
        p.longitude,
        p.speed_kmh,
        p.recorded_at
       FROM shuttles s
       JOIN shuttle_trips t ON t.shuttle_id = s.id AND t.status = 'active'
       JOIN positions p ON p.id = (
         SELECT id FROM positions
         WHERE trip_id = t.id
         ORDER BY recorded_at DESC
         LIMIT 1
       )
       WHERE s.status = 'active'`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET position history of a trip (public)
const getTripPositions = async (req, res) => {
  const { id } = req.params;
  try {
    // Check trip exists
    const [trips] = await db.query(
      'SELECT * FROM shuttle_trips WHERE id = ?',
      [id]
    );

    if (trips.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const [rows] = await db.query(
      `SELECT id, latitude, longitude, speed_kmh, recorded_at
       FROM positions
       WHERE trip_id = ?
       ORDER BY recorded_at ASC`,
      [id]
    );

    res.json({
      trip_id: parseInt(id),
      total_positions: rows.length,
      positions: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  sendPosition,
  getLatestPositions,
  getTripPositions
};