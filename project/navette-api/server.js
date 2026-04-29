const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shuttles', require('./routes/shuttles'));
app.use('/api/stops', require('./routes/stops'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/positions', require('./routes/positions'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Navette Campus API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});