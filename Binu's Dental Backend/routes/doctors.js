import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminauth.js';
import { getAllDoctors, updateDoctorProfile } from '../controllers/doctor.controller.js';

const doctorsRouter = new Router();

// All doctor routes require authentication
doctorsRouter.use(authenticate);

// GET /api/v1/doctors - List all doctors (accessible by all authenticated users)
doctorsRouter.get('/', getAllDoctors);

// PUT /api/v1/doctors/:id - Update a doctor's profile (admin only)
doctorsRouter.put('/:id', requireAdmin, updateDoctorProfile);

export default doctorsRouter;
