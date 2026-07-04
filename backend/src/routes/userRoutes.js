const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyJWT } = require('../middleware/verifyJWT'); // Adjust path to your auth middleware

router.post('/check-in', verifyJWT, attendanceController.checkIn);

module.exports = router;
