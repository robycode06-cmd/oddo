const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController.js');
const { verifyToken } = require('../middleware/auth.js');

router.post('/api/attendance/check-in', verifyToken, attendanceController.checkIn);
router.patch('/api/attendance/check-out', verifyToken, attendanceController.checkOut);
router.put('/api/users/profile/:id', verifyToken, employeeController.updateProfile);

module.exports = router;
