import express from 'express';
import { login } from '../controllers/login_controller.js';

const login_router = express.Router();

// POST /api/auth/login
login_router.post('/', login);

export default login_router;