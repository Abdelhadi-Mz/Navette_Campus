const express = require('express');
const router = express.Router();
const {
  getAllShuttles,
  getActiveShuttles,
  getShuttleById,
  createShuttle,
  updateShuttle,
  deleteShuttle
} = require('../controllers/shuttleController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public routes (no token needed)
router.get('/', getAllShuttles);
router.get('/active', getActiveShuttles);
router.get('/:id', getShuttleById);

// Admin only routes (token required)
router.post('/', verifyAdmin, createShuttle);
router.put('/:id', verifyAdmin, updateShuttle);
router.delete('/:id', verifyAdmin, deleteShuttle);

module.exports = router;