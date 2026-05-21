import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const {
    NODE_ENV = 'development',
    PORT = 3000,
    MONGO_URI = 'mongodb://127.0.0.1:27017/library-management',
    JWT_SECRET = 'supersecretjwtkey123',
    JWT_EXPIRES_IN = '7d',
    FINE_RATE_PER_DAY = 10,
    SMTP_HOST,
    SMTP_PORT = 587,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM_EMAIL = 'no-reply@library.com'
} = process.env;
