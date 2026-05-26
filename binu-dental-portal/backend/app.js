import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import { errorHandler } from "./middleware/errorhandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all routes
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import patientsRouter from "./routes/patients.js";
import appointmentsRouter from "./routes/appointments.js";
import treatmentRouter from "./routes/treatments.js";
import invoicesRouter from "./routes/invoices.js";
import billingRouter from "./routes/billing.js";
import remainderRouter from "./routes/reminders.js";
import doctorsRouter from "./routes/doctors.js";
import dashboardRouter from "./routes/dashboard.js";
import documentsRouter from "./routes/documents.js";
import reportRouter from "./routes/reports.js";
import medicalRouter from "./routes/medical.js";
import contactRouter from "./routes/contact.js";

const app = express();

// 1. Global Middleware
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV === 'production') return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        return callback(new Error('CORS connection blocked'), false);
    },
    credentials: true
}));
app.use(express.json()); // Essential for parsing incoming JSON bodies (req.body)
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded scans & reports

app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/admin`, adminRouter);
app.use(`/api/v1/patients`, patientsRouter);
app.use(`/api/v1/appointments`, appointmentsRouter);
app.use(`/api/v1/treatment`, treatmentRouter);
app.use(`/api/v1/invoices`, invoicesRouter);
app.use(`/api/v1/billing`, billingRouter);
app.use(`/api/v1/remainders`, remainderRouter);
app.use(`/api/v1/doctors`, doctorsRouter);
app.use(`/api/v1/dashboard`, dashboardRouter);
app.use(`/api/v1/documents`, documentsRouter);
app.use(`/api/v1/report`, reportRouter);
app.use(`/api/v1/medical`, medicalRouter);
app.use(`/api/v1/contact`, contactRouter);

// Core base route
app.get('/', (req, res) => {
    res.send("Welcome to Binu's Dental Booking API");
});

// 2. Serve Frontend in Production
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// 3. Fallback for non-existent routes AND React Router
app.use('*', (req, res) => {
    if (req.baseUrl.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
    }
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
        return res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    }
    res.status(404).json({ message: 'Route not found' });
});

// 4. Global Error Handler (Must be placed AFTER all routes and middleware)
app.use(errorHandler);

// 5. Database Connection & Server Initialization
const startServer = async () => {
    try {
        // Connect to MongoDB first to prevent the server from receiving requests without a DB link
        await connectToDatabase();

        if (!process.env.VERCEL) {
            const server = app.listen(PORT, () => {
                console.log(`Server is running securely on http://localhost:${PORT}`);
            });

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.log(`Port ${PORT} is busy. Trying to free it...`);
                    import('child_process').then(({ execSync }) => {
                        try {
                            execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' });
                        } catch(_) {}
                        setTimeout(() => {
                            server.listen(PORT, () => {
                                console.log(`Server is running securely on http://localhost:${PORT}`);
                            });
                        }, 2000);
                    });
                } else {
                    console.error('Server error:', err);
                    process.exit(1);
                }
            });
        } else {
            console.log('Running in serverless environment (Vercel). Database connected successfully.');
        }
    } catch (error) {
        console.error('Critical failure during initialization sequence:', error.message);
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

if (!process.env.VERCEL) {
    startServer().catch((err) => {
        console.error('Failed to resolve outer lifecycle initialization promise:', err);
    });
} else {
    connectToDatabase().catch((err) => {
        console.error('Failed to connect to database during Vercel cold start:', err);
    });
}

export default app;
