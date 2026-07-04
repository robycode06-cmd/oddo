import express from 'express';
import { createEmployee, deleteEmployee, getAllEmployees, getEmployeeById, updateEmployeeProfile } from '../controllers/userController.js';
import { verifyToken, verifyAdminOrHR } from '../middlewares/auth.js';

const user_router = express.Router();

// POST /api/users/create
user_router.post('/', verifyToken, verifyAdminOrHR, createEmployee);
user_router.get('/', verifyToken, getAllEmployees);
user_router.delete('/:id', verifyToken, verifyAdminOrHR, deleteEmployee);
user_router.get('/:id', verifyToken, getEmployeeById);
user_router.put('/:id', verifyToken, updateEmployeeProfile);
export default user_router;