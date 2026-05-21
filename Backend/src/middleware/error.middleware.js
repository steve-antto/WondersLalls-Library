import logger from '../config/logger.js';
import { sendError } from '../utils/responseHandler.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    logger.error(`${err.name}: ${err.message}\n${err.stack}`);
    
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: '${err.keyValue[field]}' for field '${field}'. Please use another value.`;
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map(val => val.message);
    }
    
    // Mongoose cast error
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found with id of ${err.value}`;
    }
    
    return sendError(res, message, statusCode, errors);
};
