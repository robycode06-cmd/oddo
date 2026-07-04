const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController.js');
const employeeController = require('../controllers/employeeController.js');
const userController = require('../controllers/userController.js');
const { verifyToken, verifyAdminOrHR } = require('../middleware/auth.js');

router.post('/api/attendance/check-in', verifyToken, attendanceController.checkIn);
router.patch('/api/attendance/check-out', verifyToken, attendanceController.checkOut);
router.put('/api/users/profile/:id', verifyToken, employeeController.updateProfile);
router.get('/api/users/getAll', verifyToken, verifyAdminOrHR, userController.getAllEmployees)


module.exports = router;
