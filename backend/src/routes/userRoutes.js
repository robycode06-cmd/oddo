const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController.js');
const { verifyJWT } = require('../middleware/verifyJWT.js'); // Adjust path to your auth middleware

router.post('/api/attendance/check-in', verifyJWT, attendanceController.checkIn);

module.exports = router;
