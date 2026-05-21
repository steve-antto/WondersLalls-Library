import express from 'express';
import { borrowBook, returnBook, getMyBorrows, getBorrowHistory, payFine } from '../controllers/borrow.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { validateBorrow } from '../validators/borrow.validation.js';

const router = express.Router();

router.use(protect);

// Student endpoints
router.get('/my-history', authorize('STUDENT'), getMyBorrows);

// Librarian/Admin/Student transaction endpoints
router.post('/', authorize('ADMIN', 'LIBRARIAN', 'STUDENT'), validateRequest(validateBorrow), borrowBook);
router.post('/return/:id', authorize('ADMIN', 'LIBRARIAN'), returnBook);
router.get('/history', authorize('ADMIN', 'LIBRARIAN'), getBorrowHistory);
router.post('/pay-fine/:id', authorize('ADMIN', 'LIBRARIAN'), payFine);

export default router;
