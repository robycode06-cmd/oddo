import express from 'express';
const router = express.Router();
const { getMyAttendance, getAllAttendance } = require('../controllers/masterAttendanceController.js');
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';   // for middleware used


// Employee Route
router.get('/me', verifyToken, getMyAttendance);

// Admin/HR Route
router.get('/all', verifyToken, verifyAdmin, getAllAttendance);

module.exports = router;