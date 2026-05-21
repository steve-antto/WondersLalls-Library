import mongoose from 'mongoose';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { connectDB } from '../config/db.js';
import logger from '../config/logger.js';

export const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@library.com';
        
        // 1. Seed default admin
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            await User.create({
                name: 'System Administrator',
                email: adminEmail,
                password: 'AdminPass123!',
                role: 'ADMIN',
                activeStatus: true
            });
            logger.info('\n===========================================\nDefault Admin seeded successfully!\nEmail: admin@library.com\nPassword: AdminPass123!\n===========================================\n');
        } else {
            logger.info('Administrator account already exists. Skipping admin seed.');
        }

        // 2. Seed sample books with net images
        const bookCount = await Book.countDocuments();
        if (bookCount === 0) {
            logger.info('No books found in the database. Seeding sample library catalog from the net...');
            const sampleBooks = [
                {
                    title: 'The Pragmatic Programmer',
                    author: 'Andrew Hunt & David Thomas',
                    isbn: '9780135957059',
                    genre: 'Technology & Development',
                    totalCopies: 5,
                    availableCopies: 5,
                    shelfLocation: 'Shelf A-4',
                    image: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
                    publishedYear: 2019
                },
                {
                    title: 'Clean Code',
                    author: 'Robert C. Martin',
                    isbn: '9780132350884',
                    genre: 'Technology & Development',
                    totalCopies: 4,
                    availableCopies: 4,
                    shelfLocation: 'Shelf A-5',
                    image: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
                    publishedYear: 2008
                },
                {
                    title: 'You Dont Know JS Yet',
                    author: 'Kyle Simpson',
                    isbn: '9781491904244',
                    genre: 'Web Programming',
                    totalCopies: 3,
                    availableCopies: 3,
                    shelfLocation: 'Shelf B-2',
                    image: 'https://covers.openlibrary.org/b/isbn/9781491904244-L.jpg',
                    publishedYear: 2020
                },
                {
                    title: 'Introduction to Algorithms',
                    author: 'Thomas H. Cormen',
                    isbn: '9780262033848',
                    genre: 'Computer Science',
                    totalCopies: 2,
                    availableCopies: 2,
                    shelfLocation: 'Shelf C-1',
                    image: 'https://covers.openlibrary.org/b/isbn/9780262033848-L.jpg',
                    publishedYear: 2009
                },
                {
                    title: 'Atomic Habits',
                    author: 'James Clear',
                    isbn: '9780735211292',
                    genre: 'Self-Improvement',
                    totalCopies: 6,
                    availableCopies: 6,
                    shelfLocation: 'Shelf E-3',
                    image: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
                    publishedYear: 2018
                },
                {
                    title: 'Design Patterns',
                    author: 'Erich Gamma',
                    isbn: '9780201633610',
                    genre: 'Software Engineering',
                    totalCopies: 3,
                    availableCopies: 3,
                    shelfLocation: 'Shelf B-5',
                    image: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
                    publishedYear: 1994
                }
            ];
            await Book.insertMany(sampleBooks);
            logger.info('Sample books seeded successfully.');
        } else {
            logger.info('Books already exist in the database. Skipping book seed.');
        }
        
    } catch (error) {
        logger.error(`Error in seeder: ${error.message}`);
    }
};

// Executable if run directly via node command line
if (process.argv[1] && process.argv[1].endsWith('seedAdmin.js')) {
    const runSeeder = async () => {
        await connectDB();
        await seedAdmin();
        await mongoose.connection.close();
        process.exit(0);
    };
    runSeeder();
}
