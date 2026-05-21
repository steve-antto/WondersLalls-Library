import app from './app.js';
import { PORT } from './config/env.js';
import { connectDB } from './config/db.js';
import { seedAdmin } from './database/seedAdmin.js';
import { initCronJobs } from './services/cron.service.js';
import logger from './config/logger.js';

const startServer = async () => {
    try {
        // 1. Establish Database Connection
        await connectDB();
        
        // 2. Seed default system users (Admin)
        await seedAdmin();
        
        // 3. Initialize background notification crons
        initCronJobs();
        
        // 4. Bind and start HTTP listener
        app.listen(PORT, () => {
            logger.info(`Library Management Server is Running on http://localhost:${PORT}`);
            logger.info(`Environment Mode: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error(`Critical Bootstrap Failure: ${error.message}`);
        process.exit(1);
    }
};

startServer();
