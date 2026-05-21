import { sendError } from '../utils/responseHandler.js';

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, 'User not authenticated', 401);
        }
        
        if (!roles.includes(req.user.role)) {
            return sendError(res, `Role '${req.user.role}' is not authorized to access this resource`, 403);
        }
        
        next();
    };
};
