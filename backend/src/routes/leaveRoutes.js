import express from 'express'
const router=express.Router();
import { createLeaveRequest, getAllLeaveRequests, updateLeaveStatus } from '../controllers/leaveController'
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware'   // for middleware used

// import upload from '../middlewares/uploadMiddleware'; // Assuming multer is setup

// Employees can request leave (will Add upload.single('attachment') if using multer)
router.post('/request', verifyToken,createLeaveRequest);

// Admins can view all and update statuses
router.get('/all', verifyToken, verifyAdmin, getAllLeaveRequests);
router.put('/status/:id', verifyToken, verifyAdmin, updateLeaveStatus);

module.exports = router;
