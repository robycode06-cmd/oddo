import express from 'express'
const router=express.Router();
import { createLeaveRequest, getAllLeaveRequests, updateLeaveStatus } from '../controllers/leaveController.js';
import { verifyToken, verifyAdminOrHR as verifyAdmin } from '../middlewares/auth.js';

import upload from '../middlewares/uploadMiddleware.js';

// Employees can request leave (will Add upload.single('attachment') if using multer)
router.post('/request', verifyToken, upload.single('attachment'), createLeaveRequest);

// Admins can view all and update statuses
router.get('/all', verifyToken, verifyAdmin, getAllLeaveRequests);
router.put('/status/:id', verifyToken, verifyAdmin, updateLeaveStatus);

export default router;
