import express from 'express';
import { createEmployee } from '../controllers/userController.js';
import { verifyToken, verifyAdminOrHR } from '../middlewares/auth.js';

const user_router = express.Router();

// POST /api/users/create
user_router.post('/', verifyToken, verifyAdminOrHR, createEmployee);

export default user_router;