import express from 'express';
import { getStudents, getStudentById, updateStudentProfile, deleteStudent } from '../controllers/student.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.get('/', authorize('ADMIN', 'LIBRARIAN'), getStudents);
router.get('/:id', getStudentById);
router.put('/:id', updateStudentProfile);
router.delete('/:id', authorize('ADMIN', 'LIBRARIAN'), deleteStudent);

export default router;
