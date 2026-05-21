import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook, uploadBookImage } from '../controllers/book.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { validateBook } from '../validators/book.validation.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected administrative catalog routes
router.post(
    '/',
    protect,
    authorize('ADMIN', 'LIBRARIAN'),
    uploadBookImage.single('image'),
    validateRequest(validateBook),
    createBook
);

router.put(
    '/:id',
    protect,
    authorize('ADMIN', 'LIBRARIAN'),
    uploadBookImage.single('image'),
    validateRequest(validateBook),
    updateBook
);

router.delete(
    '/:id',
    protect,
    authorize('ADMIN', 'LIBRARIAN'),
    deleteBook
);

export default router;
