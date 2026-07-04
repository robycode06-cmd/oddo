import express from 'express';
const router = express.Router();
import * as attendanceController from '../controllers/attendanceController.js';
import { getMyAttendance, getAllAttendance } from '../controllers/masterAttendanceController.js';
import { verifyToken, verifyAdminOrHR } from '../middlewares/auth.js';

router.post('/check-in', verifyToken, attendanceController.checkIn);
router.patch('/check-out', verifyToken, attendanceController.checkOut);
router.get('/me', verifyToken, getMyAttendance);
router.get('/all', verifyToken, verifyAdminOrHR, getAllAttendance);

export default router;
