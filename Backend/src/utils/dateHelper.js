export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getDifferenceInDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Clear time components for pure day comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isPastDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    return now > due;
};
