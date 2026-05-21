import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { validateRegister, validateLogin } from '../validators/auth.validation.js';

const router = express.Router();

router.post('/register', validateRequest(validateRegister), register);
router.post('/login', validateRequest(validateLogin), login);
router.get('/me', protect, getMe);

export default router;
