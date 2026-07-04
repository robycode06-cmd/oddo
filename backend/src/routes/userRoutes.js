import express from 'express';
const router = express.Router();
import * as attendanceController from '../controllers/attendanceController.js';
import { verifyToken } from '../middlewares/auth.js';

router.post('/check-in', verifyToken, attendanceController.checkIn);
router.patch('/check-out', verifyToken, attendanceController.checkOut);

export default router;
