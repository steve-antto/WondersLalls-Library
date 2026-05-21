import { sendError } from '../utils/responseHandler.js';

export const validateRequest = (validator) => {
    return (req, res, next) => {
        const { error, value } = validator(req.body);
        if (error) {
            const errors = Array.isArray(error) ? error : [error.message || error];
            return sendError(res, 'Validation failed', 400, errors);
        }
        req.body = value; // Update body to cleaned/coerced values
        next();
    };
};
