const express = require('express');
const router = express.Router();
const {
  startTrip,
  updateTripStatus,
  getActiveTrips,
  getTripById,
  getAllTrips,
  getShuttleActiveTrip,
  getShuttleTripHistory
} = require('../controllers/tripController');
const { verifyAdmin, verifyDriver } = require('../middleware/authMiddleware');

// Public
router.get('/active', getActiveTrips);
router.get('/:id', getTripById);
router.get('/shuttle/:shuttle_id/history', getShuttleTripHistory);

// Admin only
router.get('/', verifyAdmin, getAllTrips);

// Driver only
router.post('/start', verifyDriver, startTrip);
router.put('/:id/status', verifyDriver, updateTripStatus);
router.get('/shuttle/:shuttle_id/active', getShuttleActiveTrip);

module.exports = router;