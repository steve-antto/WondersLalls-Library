import express from 'express';
import { getDashboardStats } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, authorize('ADMIN', 'LIBRARIAN'), getDashboardStats);

export default router;
