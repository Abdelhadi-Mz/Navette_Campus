const express = require('express');
const router = express.Router();
const { adminLogin, driverLogin } = require('../controllers/authController');

router.post('/admin', adminLogin);
router.post('/driver', driverLogin);

module.exports = router;