import express from 'express';
import { login, logout } from '../controllers/login_controller.js';

const login_router = express.Router();

// POST /api/auth/login
login_router.post('/', login);
login_router.post('/logout', logout);

export default login_router;