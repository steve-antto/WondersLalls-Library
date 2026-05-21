import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import studentRoutes from './routes/student.routes.js';
import borrowRoutes from './routes/borrow.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Import Error Handler
import { errorHandler } from './middleware/error.middleware.js';
import logger from './config/logger.js';

const app = express();

// 1. Basic Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. HTTP Request Logger (Morgan piped through Winston stream)
const morganStream = {
    write: (message) => logger.http(message.trim()),
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// 3. Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false // Allows loading cover images across origins
}));

// 4. CORS Setup
app.use(cors({
    origin: '*', // Customize this for production
    credentials: true,
}));

// 5. API Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// 6. Static Upload & Frontend Directory Bindings
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use(express.static(path.join(process.cwd(), '../Frontend/dist')));

// 7. Base welcome endpoint serving Frontend dist index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), '../Frontend/dist/index.html'));
});

// 8. Register Core API Router Groups
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 9. Catch-All Routing - SPA fallback and 404 APIs
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ success: false, message: `Route '${req.originalUrl}' not found` });
    }
    res.sendFile(path.join(process.cwd(), '../Frontend/dist/index.html'));
});

// 10. Global Exception Logger & Rest Handler (must be last)
app.use(errorHandler);

export default app;
