import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';
import logger from './logger.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};
