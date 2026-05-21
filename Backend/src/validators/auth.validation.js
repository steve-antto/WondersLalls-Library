export const validateRegister = (data) => {
    const errors = [];
    const { name, email, password, role, rollNumber, department, phoneNumber, libraryCardNumber } = data;
    
    if (!name || name.trim() === '') errors.push('Name is required');
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) errors.push('A valid email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters long');
    
    if (role && !['ADMIN', 'LIBRARIAN', 'STUDENT'].includes(role)) {
        errors.push('Role must be one of ADMIN, LIBRARIAN, or STUDENT');
    }
    
    // Student specific validation
    if (role === 'STUDENT') {
        if (!rollNumber || rollNumber.trim() === '') errors.push('Student roll number is required');
        if (!department || department.trim() === '') errors.push('Student department is required');
        if (!phoneNumber || phoneNumber.trim() === '') errors.push('Student phone number is required');
        if (!libraryCardNumber || libraryCardNumber.trim() === '') errors.push('Student library card number is required');
    }
    
    return {
        error: errors.length > 0 ? errors : null,
        value: data
    };
};

export const validateLogin = (data) => {
    const errors = [];
    const { email, password } = data;
    
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) errors.push('A valid email is required');
    if (!password) errors.push('Password is required');
    
    return {
        error: errors.length > 0 ? errors : null,
        value: data
    };
};
