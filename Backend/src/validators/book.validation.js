export const validateBook = (data) => {
    const errors = [];
    const { title, author, isbn, genre, totalCopies, shelfLocation, publishedYear } = data;
    
    if (!title || title.trim() === '') errors.push('Book title is required');
    if (!author || author.trim() === '') errors.push('Author is required');
    if (!isbn || isbn.trim() === '') errors.push('ISBN is required');
    if (!genre || genre.trim() === '') errors.push('Genre is required');
    
    const parsedTotal = parseInt(totalCopies, 10);
    if (totalCopies === undefined || isNaN(parsedTotal) || parsedTotal < 0) {
        errors.push('Total copies must be a non-negative number');
    }
    
    if (!shelfLocation || shelfLocation.trim() === '') errors.push('Shelf location is required');
    
    const parsedYear = parseInt(publishedYear, 10);
    const currentYear = new Date().getFullYear();
    if (!publishedYear || isNaN(parsedYear) || parsedYear < 1000 || parsedYear > currentYear + 1) {
        errors.push('Please enter a valid publication year');
    }
    
    return {
        error: errors.length > 0 ? errors : null,
        value: {
            ...data,
            totalCopies: isNaN(parsedTotal) ? totalCopies : parsedTotal,
            publishedYear: isNaN(parsedYear) ? publishedYear : parsedYear
        }
    };
};
