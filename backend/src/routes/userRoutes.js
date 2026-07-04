import express from 'express';
const router = express.Router();
import * as attendanceController from '../controllers/attendanceController.js';
import { verifyToken } from '../middlewares/auth.js';

router.post('/api/attendance/check-in', verifyToken, attendanceController.checkIn);
router.patch('/api/attendance/check-out', verifyToken, attendanceController.checkOut);

export default router;
