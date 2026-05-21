import Student from '../models/Student.js';
import User from '../models/User.js';
import Borrow from '../models/Borrow.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin/Librarian)
export const getStudents = async (req, res, next) => {
    try {
        const { search, department } = req.query;
        let userQuery = { role: 'STUDENT' };
        
        if (search) {
            userQuery.name = { $regex: search, $options: 'i' };
        }
        
        // Find matching users first
        const studentUsers = await User.find(userQuery);
        const userIds = studentUsers.map(u => u._id);
        
        let studentQuery = { user: { $in: userIds } };
        
        if (department) {
            studentQuery.department = { $regex: department, $options: 'i' };
        }
        
        if (search && studentUsers.length === 0) {
            // Also search by rollNumber or card number directly
            studentQuery = {
                $or: [
                    { rollNumber: { $regex: search, $options: 'i' } },
                    { libraryCardNumber: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const students = await Student.find(studentQuery).populate('user', 'name email activeStatus');
        return sendSuccess(res, 'Students fetched successfully', students);
    } catch (error) {
        next(error);
    }
};

// @desc    Get student details by ID
// @route   GET /api/students/:id
// @access  Private (Admin/Librarian/Owner Student)
export const getStudentById = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id).populate('user', 'name email activeStatus');
        
        if (!student) {
            return sendError(res, 'Student profile not found', 404);
        }
        
        // Authorize owner or admin/librarian
        if (req.user.role === 'STUDENT' && req.user._id.toString() !== student.user._id.toString()) {
            return sendError(res, 'Access denied, you can only view your own profile', 403);
        }
        
        return sendSuccess(res, 'Student details fetched successfully', student);
    } catch (error) {
        next(error);
    }
};

// @desc    Update student profile details
// @route   PUT /api/students/:id
// @access  Private (Admin/Librarian/Owner Student)
export const updateStudentProfile = async (req, res, next) => {
    try {
        const { name, department, phoneNumber, activeStatus, borrowLimit } = req.body;
        const student = await Student.findById(req.params.id).populate('user');
        
        if (!student) {
            return sendError(res, 'Student profile not found', 404);
        }
        
        const isOwner = req.user._id.toString() === student.user._id.toString();
        const isAdminOrLibrarian = ['ADMIN', 'LIBRARIAN'].includes(req.user.role);
        
        if (!isOwner && !isAdminOrLibrarian) {
            return sendError(res, 'Access denied, you cannot update this profile', 403);
        }
        
        // Student can only update phone number
        if (isOwner && !isAdminOrLibrarian) {
            if (phoneNumber) student.phoneNumber = phoneNumber;
        }
        
        // Admin or Librarian can update anything
        if (isAdminOrLibrarian) {
            if (department) student.department = department;
            if (phoneNumber) student.phoneNumber = phoneNumber;
            if (borrowLimit !== undefined) student.borrowLimit = borrowLimit;
            
            if (name) {
                await User.findByIdAndUpdate(student.user._id, { name });
            }
            
            if (activeStatus !== undefined) {
                await User.findByIdAndUpdate(student.user._id, { activeStatus });
            }
        }
        
        const updatedStudent = await student.save();
        const refetched = await Student.findById(updatedStudent._id).populate('user', 'name email activeStatus');
        
        return sendSuccess(res, 'Student profile updated successfully', refetched);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete student profile and core user
// @route   DELETE /api/students/:id
// @access  Private (Admin/Librarian)
export const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return sendError(res, 'Student not found', 404);
        }
        
        // Block deletion if student has outstanding fines
        if (student.fineAmount > 0) {
            return sendError(res, `Cannot delete student because they have outstanding unpaid fines of amount ${student.fineAmount}`, 400);
        }
        
        // Block deletion if student currently has active borrowed books
        const activeBorrows = await Borrow.findOne({ student: student._id, status: { $in: ['BORROWED', 'OVERDUE'] } });
        if (activeBorrows) {
            return sendError(res, 'Cannot delete student while they have active book borrowings', 400);
        }
        
        // Delete User and Student documents
        await User.findByIdAndDelete(student.user);
        await Student.findByIdAndDelete(req.params.id);
        
        return sendSuccess(res, 'Student profile and account successfully deleted');
    } catch (error) {
        next(error);
    }
};
