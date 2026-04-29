const db = require('../config/db');

// Start a new trip (driver only)
const startTrip = async (req, res) => {
  const shuttle_id = req.user.id; // from JWT token

  try {
    // Check if shuttle exists and is active
    const [shuttles] = await db.query(
      'SELECT * FROM shuttles WHERE id = ? AND status = "active"',
      [shuttle_id]
    );

    if (shuttles.length === 0) {
      return res.status(404).json({ error: 'Shuttle not found or inactive.' });
    }

    // Check if there is already an active trip for this shuttle
    const [activeTrips] = await db.query(
      'SELECT * FROM shuttle_trips WHERE shuttle_id = ? AND status = "active"',
      [shuttle_id]
    );

    if (activeTrips.length > 0) {
      return res.status(400).json({ 
        error: 'This shuttle already has an active trip.',
        trip_id: activeTrips[0].id
      });
    }

    // Create new trip
    const [result] = await db.query(
      'INSERT INTO shuttle_trips (shuttle_id, status) VALUES (?, "active")',
      [shuttle_id]
    );

    res.status(201).json({
      message: 'Trip started successfully.',
      trip_id: result.insertId,
      shuttle_id,
      status: 'active',
      started_at: new Date()
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Update trip status (driver only)
const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes, delay_minutes } = req.body;
  const shuttle_id = req.user.id; // from JWT token

  const validStatuses = ['active', 'pause', 'finished'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Status must be one of: active, pause, finished.' 
    });
  }

  try {
    // Make sure this trip belongs to this driver's shuttle
    const [rows] = await db.query(
      'SELECT * FROM shuttle_trips WHERE id = ? AND shuttle_id = ?',
      [id, shuttle_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    const trip = rows[0];

    if (trip.status === 'finished') {
      return res.status(400).json({ error: 'Cannot update a finished trip.' });
    }

    // If finishing, set ended_at
    const ended_at = status === 'finished' ? new Date() : trip.ended_at;

    await db.query(
      `UPDATE shuttle_trips 
       SET status = ?, ended_at = ?, notes = ?, delay_minutes = ?
       WHERE id = ?`,
      [
        status,
        ended_at,
        notes || trip.notes,
        delay_minutes || trip.delay_minutes,
        id
      ]
    );

    res.json({ 
      message: `Trip status updated to "${status}".`,
      trip_id: parseInt(id),
      status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET all active trips (public)
const getActiveTrips = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        t.id as trip_id,
        t.status as trip_status,
        t.started_at,
        t.delay_minutes,
        s.id as shuttle_id,
        s.name as shuttle_name,
        s.driver_name,
        s.capacity,
        p.latitude,
        p.longitude,
        p.recorded_at as last_position_at
       FROM shuttle_trips t
       JOIN shuttles s ON s.id = t.shuttle_id
       LEFT JOIN positions p ON p.id = (
         SELECT id FROM positions 
         WHERE trip_id = t.id 
         ORDER BY recorded_at DESC 
         LIMIT 1
       )
       WHERE t.status IN ('active', 'pause')`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};
// GET active or paused trip for a specific shuttle
const getShuttleActiveTrip = async (req, res) => {
  const { shuttle_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM shuttle_trips 
       WHERE shuttle_id = ? 
       AND status IN ('active', 'pause')
       ORDER BY started_at DESC 
       LIMIT 1`,
      [shuttle_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No active trip found.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET single trip details
const getTripById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        t.*,
        s.name as shuttle_name,
        s.driver_name,
        s.plate_number
       FROM shuttle_trips t
       JOIN shuttles s ON s.id = t.shuttle_id
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET all trips (admin)
const getAllTrips = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        t.*,
        s.name as shuttle_name,
        s.driver_name
       FROM shuttle_trips t
       JOIN shuttles s ON s.id = t.shuttle_id
       ORDER BY t.started_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};
// GET trip history for a specific shuttle
const getShuttleTripHistory = async (req, res) => {
  const { shuttle_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT 
        t.id as trip_id,
        t.status,
        t.started_at,
        t.ended_at,
        t.delay_minutes,
        t.notes,
        (SELECT COUNT(*) FROM positions WHERE trip_id = t.id) as position_count
       FROM shuttle_trips t
       WHERE t.shuttle_id = ?
       ORDER BY t.started_at DESC
       LIMIT 10`,
      [shuttle_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = {
  startTrip,
  updateTripStatus,
  getActiveTrips,
  getTripById,
  getAllTrips,
  getShuttleActiveTrip,
  getShuttleTripHistory
};