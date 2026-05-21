import mongoose from 'mongoose';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { generateToken } from '../utils/generateToken.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Register a new user (Students can be self-registered or added by Admin/Librarian)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { name, email, password, role = 'STUDENT', rollNumber, department, phoneNumber, libraryCardNumber } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return sendError(res, 'User with this email already exists', 400);
        }
        
        // If student, check roll number or card number duplication
        if (role === 'STUDENT') {
            const existingRoll = await Student.findOne({ rollNumber }).session(session);
            if (existingRoll) {
                await session.abortTransaction();
                session.endSession();
                return sendError(res, 'Student with this roll number already exists', 400);
            }
            
            const existingCard = await Student.findOne({ libraryCardNumber }).session(session);
            if (existingCard) {
                await session.abortTransaction();
                session.endSession();
                return sendError(res, 'Library Card Number is already in use', 400);
            }
        }
        
        // Create user
        const user = await User.create([{
            name,
            email,
            password,
            role,
        }], { session });
        
        const createdUser = user[0];
        let profile = null;
        
        // Create student profile if role is STUDENT
        if (role === 'STUDENT') {
            const student = await Student.create([{
                user: createdUser._id,
                rollNumber,
                department,
                phoneNumber,
                libraryCardNumber
            }], { session });
            profile = student[0];
        }
        
        await session.commitTransaction();
        session.endSession();
        
        // Generate Token
        const token = generateToken(createdUser._id, createdUser.role);
        
        return sendSuccess(res, 'User registered successfully', {
            user: {
                id: createdUser._id,
                _id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
            },
            studentProfile: profile,
            token
        }, 201);
        
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Fetch user with password selected
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return sendError(res, 'Invalid email or password', 401);
        }
        
        if (!user.activeStatus) {
            return sendError(res, 'Account has been deactivated. Please contact administration.', 403);
        }
        
        // Generate Token
        const token = generateToken(user._id, user.role);
        
        // Fetch student profile if user is a student
        let profile = null;
        if (user.role === 'STUDENT') {
            profile = await Student.findOne({ user: user._id });
        }
        
        return sendSuccess(res, 'Login successful', {
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            studentProfile: profile,
            token
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        let profile = null;
        
        if (user.role === 'STUDENT') {
            profile = await Student.findOne({ user: user._id });
        }
        
        return sendSuccess(res, 'User profile fetched successfully', {
            user: {
                id: user._id,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                activeStatus: user.activeStatus,
                createdAt: user.createdAt,
            },
            studentProfile: profile
        });
    } catch (error) {
        next(error);
    }
};
