const express = require('express');
const router = express.Router();
const Result = require('../models/Results');
const {sendEmail}   = require('../utils/email');




// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const { 
      program, 
      batch, 
      semester,
      status,
      page = 1, 
      limit = 20, 
      search 
    } = req.query;
    
    const query = {};
    
    // Filters
    if (program) query.program = program;
    if (batch) query.batch = batch;
    if (semester) query.currentSemester = semester;
    if (status) query['enrollment.status'] = status;
    else query['enrollment.status'] = 'Active'; // Default to active students
    
    // Search by name, ID, or email
    if (search) {
      query.$or = [
        { studentId: { $regex: search, $options: 'i' } },
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastName': { $regex: search, $options: 'i' } },
        { 'name.fullName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const students = await Student.find(query)
      .populate('userId', 'username email isActive')
      .populate('academicInfo.advisor', 'name.fullName staffId')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ studentId: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check authorization - students can only view their own profile
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own profile'
      });
    }

    const student = await Student.findOne({ studentId })
      .populate('userId', 'username email phone isEmailVerified lastLogin')
      .populate('academicInfo.advisor', 'name.fullName staffId email designation');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get additional statistics
    const resultCount = await Result.countDocuments({ 
      studentId,
      status: 'published'
    });

    res.json({
      success: true,
      data: {
        student,
        statistics: {
          totalResults: resultCount,
          currentGPA: student.academicInfo.currentGPA,
          totalCredits: student.academicInfo.totalCreditsEarned
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Add new student
exports.addStudent = async (req, res) => {
  try {
    const studentData = req.body;

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ 
      studentId: studentData.studentId 
    });
    
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Student ID already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await Student.findOne({ 
      email: studentData.email 
    });
    
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Generate temporary password
    const username = studentData.studentId;
    const tempPassword = 'student' + Math.random().toString(36).slice(-8);
    
    // Create user account
    const user = await User.create({
      username,
      email: studentData.email,
      password: tempPassword,
      role: 'student',
      name: `${studentData.name.firstName} ${studentData.name.lastName}`,
      studentId: studentData.studentId,
      isEmailVerified: true // Admin-created accounts are pre-verified
    });

    // Create student profile
    const student = await Student.create({
      ...studentData,
      userId: user._id,
      'name.fullName': `${studentData.name.firstName} ${studentData.name.lastName}`
    });

    // Send welcome email with credentials
    await sendEmail({
      to: studentData.email,
      subject: 'Welcome to ResultPro - Your Account Details',
      template: 'studentCredentials',
      data: {
        name: `${studentData.name.firstName} ${studentData.name.lastName}`,
        studentId: studentData.studentId,
        username,
        password: tempPassword,
        loginUrl: process.env.FRONTEND_URL + '/login'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully. Login credentials sent to email.',
      data: {
        student,
        credentials: {
          username,
          temporaryPassword: tempPassword,
          note: 'Please ask the student to change their password after first login'
        }
      }
    });
  } catch (error) {
    // Rollback user creation if student creation fails
    if (error.name === 'ValidationError' && req.body.studentId) {
      await User.deleteOne({ studentId: req.body.studentId });
    }
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};