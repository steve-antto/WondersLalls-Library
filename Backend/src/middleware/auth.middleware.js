import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import User from '../models/User.js';
import { sendError } from '../utils/responseHandler.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return sendError(res, 'Not authorized, no token provided', 401);
        }
        
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user and check if active
        const user = await User.findById(decoded.id);
        if (!user) {
            return sendError(res, 'User no longer exists', 401);
        }
        
        if (!user.activeStatus) {
            return sendError(res, 'User account is deactivated', 401);
        }
        
        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return sendError(res, 'Invalid token signature', 401);
        }
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Token has expired, please log in again', 401);
        }
        return sendError(res, 'Authorization failed', 401);
    }
};
