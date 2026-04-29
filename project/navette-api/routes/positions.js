const express = require('express');
const router = express.Router();
const {
  sendPosition,
  getLatestPositions,
  getTripPositions
} = require('../controllers/positionController');
const { verifyDriver } = require('../middleware/authMiddleware');

// Public
router.get('/latest', getLatestPositions);
router.get('/trip/:id', getTripPositions);

// Driver only
router.post('/', verifyDriver, sendPosition);

module.exports = router;