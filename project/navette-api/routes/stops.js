const express = require('express');
const router = express.Router();
const {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop
} = require('../controllers/stopController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllStops);
router.get('/:id', getStopById);

// Admin only
router.post('/', verifyAdmin, createStop);
router.put('/:id', verifyAdmin, updateStop);
router.delete('/:id', verifyAdmin, deleteStop);

module.exports = router;