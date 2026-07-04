import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees } from '../controllers/userController.js';
import { verifyToken, verifyAdminOrHR } from '../middlewares/auth.js';

const user_router = express.Router();

// POST /api/users/create
user_router.post('/', verifyToken, verifyAdminOrHR, createEmployee);
user_router.get('/', verifyToken, verifyAdminOrHR, getAllEmployees);
user_router.delete('/:id', verifyToken, verifyAdminOrHR, deleteEmployee)

export default user_router;