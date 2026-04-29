const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin login
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM admins WHERE username = ?', 
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: admin.id, username: admin.username, role: 'admin' }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Driver login (using shuttle id + PIN)
const driverLogin = async (req, res) => {
  const { shuttle_id, pin } = req.body;

  if (!shuttle_id || !pin) {
    return res.status(400).json({ error: 'Shuttle ID and PIN are required.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM shuttles WHERE id = ? AND status = "active"',
      [shuttle_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Shuttle not found or inactive.' });
    }

    const shuttle = rows[0];

    if (!shuttle.driver_token) {
      return res.status(401).json({ error: 'No PIN set for this shuttle.' });
    }

    const validPin = await bcrypt.compare(pin, shuttle.driver_token);

    if (!validPin) {
      return res.status(401).json({ error: 'Invalid PIN.' });
    }

    const token = jwt.sign(
      { id: shuttle.id, driver_name: shuttle.driver_name, role: 'driver' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      shuttle: {
        id: shuttle.id,
        name: shuttle.name,
        driver_name: shuttle.driver_name
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { adminLogin, driverLogin };