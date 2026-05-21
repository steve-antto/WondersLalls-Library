import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Student from '../src/models/Student.js';
import Book from '../src/models/Book.js';
import Borrow from '../src/models/Borrow.js';
import Fine from '../src/models/Fine.js';
import Notification from '../src/models/Notification.js';
import { connectDB } from '../src/config/db.js';
import { seedAdmin } from '../src/database/seedAdmin.js';
import { runOverdueReminderJob } from '../src/jobs/overdueReminder.job.js';
import { borrowBook, returnBook, payFine } from '../src/controllers/borrow.controller.js';
import { createBook } from '../src/controllers/book.controller.js';
import logger from '../src/config/logger.js';

// Setup Mock Express Response Object for controllers
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

const runTests = async () => {
    try {
        logger.info('=============================================');
        logger.info('STARTING AUTOMATED API INTEGRATION TEST...');
        logger.info('=============================================');
        
        // 1. Establish DB Connection
        await connectDB();
        
        // 2. Clear collections to start fresh
        logger.info('Cleaning database collections...');
        await User.deleteMany({});
        await Student.deleteMany({});
        await Book.deleteMany({});
        await Borrow.deleteMany({});
        await Fine.deleteMany({});
        await Notification.deleteMany({});
        
        // 3. Verify Admin Seeding
        logger.info('Testing Admin Seeding...');
        await seedAdmin();
        const admin = await User.findOne({ email: 'admin@library.com' });
        if (!admin || admin.role !== 'ADMIN') {
            throw new Error('Admin seeding verification failed!');
        }
        logger.info('Admin Seeding verified successfully!');
        
        // 4. Create Student Account directly (to avoid mock HTTP session for transaction)
        logger.info('Creating Test Student Profile...');
        const studentUser = await User.create({
            name: 'John Doe',
            email: 'john@student.com',
            password: 'StudentPass123!',
            role: 'STUDENT'
        });
        
        const student = await Student.create({
            user: studentUser._id,
            rollNumber: 'ROLL-101',
            department: 'Computer Science',
            phoneNumber: '+1234567890',
            libraryCardNumber: 'CARD-9999'
        });
        logger.info(`Student profile created with ID: ${student._id}`);
        
        // 5. Create Catalog Book
        logger.info('Creating Test Books...');
        const book1 = await Book.create({
            title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
            author: 'Robert C. Martin',
            isbn: '978-0132350884',
            genre: 'Programming',
            totalCopies: 3,
            shelfLocation: 'Shelf A-4',
            publishedYear: 2008
        });
        logger.info(`Book created successfully: "${book1.title}" (Available: ${book1.availableCopies})`);
        
        // 6. Test Book Borrowing
        logger.info('Testing Book Borrowing...');
        const borrowRes = mockResponse();
        await borrowBook({
            body: {
                bookId: book1._id.toString(),
                studentId: student._id.toString(),
                durationInDays: 14
            }
        }, borrowRes, (err) => { if (err) throw err; });
        
        if (!borrowRes.body || !borrowRes.body.success) {
            throw new Error(`Borrow book failed: ${JSON.stringify(borrowRes.body)}`);
        }
        
        const borrowRecord = borrowRes.body.data;
        logger.info(`Book successfully borrowed. Transaction ID: ${borrowRecord._id}`);
        
        // Verify book copy count decreased
        const updatedBook = await Book.findById(book1._id);
        logger.info(`Available copies after borrow: ${updatedBook.availableCopies}`);
        if (updatedBook.availableCopies !== 2) {
            throw new Error(`Book copies not decremented correctly! Expected 2, got ${updatedBook.availableCopies}`);
        }
        
        // 7. Test Overdue & Fines Calculation
        logger.info('Testing Overdue Tracking and Fines Accrual...');
        
        // Manually manipulate the Borrow record to be overdue (e.g., due 5 days ago)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        
        await Borrow.findByIdAndUpdate(borrowRecord._id, {
            dueDate: fiveDaysAgo
        });
        
        // Trigger Overdue reminders job
        await runOverdueReminderJob();
        
        // Verify borrow status changed to OVERDUE and Fine created
        const overdueBorrow = await Borrow.findById(borrowRecord._id);
        logger.info(`Borrow Status after cron run: ${overdueBorrow.status}`);
        if (overdueBorrow.status !== 'OVERDUE') {
            throw new Error(`Expected borrow status to be OVERDUE, got ${overdueBorrow.status}`);
        }
        
        const fineRecord = await Fine.findOne({ borrow: borrowRecord._id });
        if (!fineRecord || fineRecord.status !== 'UNPAID') {
            throw new Error('Fine record was not created or has incorrect status!');
        }
        
        // Under our env configurations, daily rate is 10. For 5 days late, fine should be 50.
        logger.info(`Accumulated fine amount: ${fineRecord.amount}`);
        if (fineRecord.amount !== 50) {
            throw new Error(`Fine calculation incorrect! Expected 50, got ${fineRecord.amount}`);
        }
        
        // Check student outstanding balance
        const updatedStudent = await Student.findById(student._id);
        logger.info(`Student outstanding fine balances: ${updatedStudent.fineAmount}`);
        if (updatedStudent.fineAmount !== 50) {
            throw new Error(`Student fineAmount aggregate not updated! Expected 50, got ${updatedStudent.fineAmount}`);
        }
        
        // 8. Test Book Return
        logger.info('Testing Overdue Book Return...');
        const returnRes = mockResponse();
        await returnBook({
            params: { id: borrowRecord._id.toString() }
        }, returnRes, (err) => { if (err) throw err; });
        
        if (!returnRes.body || !returnRes.body.success) {
            throw new Error(`Book return failed: ${JSON.stringify(returnRes.body)}`);
        }
        
        const refetchedBook = await Book.findById(book1._id);
        logger.info(`Book copies after return: ${refetchedBook.availableCopies}`);
        if (refetchedBook.availableCopies !== 3) {
            throw new Error(`Book copies not incremented back! Expected 3, got ${refetchedBook.availableCopies}`);
        }
        
        // 9. Test Fine Settlement Payment
        logger.info('Testing Fine Payment...');
        const payRes = mockResponse();
        await payFine({
            params: { id: fineRecord._id.toString() }
        }, payRes, (err) => { if (err) throw err; });
        
        if (!payRes.body || !payRes.body.success) {
            throw new Error(`Fine payment failed: ${JSON.stringify(payRes.body)}`);
        }
        
        const finalStudent = await Student.findById(student._id);
        logger.info(`Final student outstanding balance after payment: ${finalStudent.fineAmount}`);
        if (finalStudent.fineAmount !== 0) {
            throw new Error(`Student balance was not cleared! Expected 0, got ${finalStudent.fineAmount}`);
        }
        
        const settledFine = await Fine.findById(fineRecord._id);
        logger.info(`Fine record status: ${settledFine.status}`);
        if (settledFine.status !== 'PAID') {
            throw new Error('Fine record status was not updated to PAID!');
        }
        
        logger.info('=============================================');
        logger.info('ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!');
        logger.info('=============================================');
        
        // Clean up connections
        await mongoose.connection.close();
        process.exit(0);
        
    } catch (error) {
        logger.error(`\nTest Runner Failure: ${error.message}\n${error.stack}`);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

runTests();
