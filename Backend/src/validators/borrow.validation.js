export const validateBorrow = (data) => {
    const errors = [];
    const { bookId, studentId, durationInDays } = data;
    
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!bookId || !objectIdRegex.test(bookId)) {
        errors.push('A valid Book ID is required');
    }
    
    if (!studentId || !objectIdRegex.test(studentId)) {
        errors.push('A valid Student ID is required');
    }
    
    let duration = 14; // Default 2 weeks
    if (durationInDays !== undefined) {
        const parsed = parseInt(durationInDays, 10);
        if (isNaN(parsed) || parsed <= 0) {
            errors.push('Borrow duration must be a positive number of days');
        } else {
            duration = parsed;
        }
    }
    
    return {
        error: errors.length > 0 ? errors : null,
        value: {
            ...data,
            durationInDays: duration
        }
    };
};
