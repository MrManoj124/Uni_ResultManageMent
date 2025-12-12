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


// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    // Find student
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check authorization
    // Students can update their own profile (limited fields)
    // Admin can update everything
    if (req.user.role === 'student') {
      if (req.user.studentId !== studentId) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own profile'
        });
      }

      // Students can only update specific fields
      const allowedFields = ['phone', 'address', 'guardian'];
      const updateFields = {};
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          updateFields[field] = updates[field];
        }
      });

      Object.assign(student, updateFields);
    } else {
      // Admin can update all fields
      Object.assign(student, updates);
    }

    // Update fullName if first or last name changed
    if (updates.name?.firstName || updates.name?.lastName) {
      student.name.fullName = `${student.name.firstName} ${student.name.lastName}`;
    }

    await student.save();

    // Also update user email if changed
    if (updates.email && req.user.role === 'admin') {
      await User.findByIdAndUpdate(student.userId, { email: updates.email });
    }

    const updatedStudent = await Student.findOne({ studentId })
      .populate('userId', 'username email')
      .populate('academicInfo.advisor', 'name.fullName staffId');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Delete student (soft delete)
exports.deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if student has published results
    const hasPublishedResults = await Result.countDocuments({
      studentId,
      status: 'published'
    });

    if (hasPublishedResults > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete student with published results. Please archive the student instead.',
        suggestion: 'Use the deactivate endpoint to archive this student.'
      });
    }

    // Soft delete - change enrollment status
    student.enrollment.status = 'Withdrawn';
    student.isActive = false;
    await student.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(student.userId, { isActive: false });

    // Delete unpublished results
    await Result.deleteMany({
      studentId,
      status: { $ne: 'published' }
    });

    res.json({
      success: true,
      message: 'Student deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get student results
exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Check authorization
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Verify student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    const results = await Result.find({ 
      studentId,
      status: 'published'
    })
    .populate('courseId', 'code name credits semester department')
    .sort({ 'courseId.semester': 1, 'courseId.code': 1 });

    // Calculate GPA
    let totalPoints = 0;
    let totalCredits = 0;

    results.forEach(result => {
      if (result.courseId) {
        totalPoints += result.gradePoints * result.courseId.credits;
        totalCredits += result.courseId.credits;
      }
    });

    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';

    // Group by semester
    const resultsBySemester = {};
    results.forEach(result => {
      const semester = result.courseId?.semester || 'Unknown';
      if (!resultsBySemester[semester]) {
        resultsBySemester[semester] = [];
      }
      resultsBySemester[semester].push(result);
    });

    res.json({
      success: true,
      data: {
        studentId,
        studentName: student.name.fullName,
        results,
        resultsBySemester,
        summary: {
          gpa,
          cgpa: gpa, // Same as GPA for now
          totalCredits,
          totalCourses: results.length,
          passedCourses: results.filter(r => r.grade !== 'F').length,
          failedCourses: results.filter(r => r.grade === 'F').length
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


// Calculate student GPA
exports.calculateStudentGPA = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Calculate and update GPA
    const gpaData = await student.calculateGPA();

    res.json({
      success: true,
      message: 'GPA calculated and updated successfully',
      data: {
        studentId,
        currentGPA: gpaData.currentGPA,
        cumulativeGPA: gpaData.cumulativeGPA,
        totalCredits: gpaData.totalCredits
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get student summary/dashboard
exports.getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check authorization
    if (req.user.role === 'student' && req.user.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const student = await Student.findOne({ studentId })
      .populate('academicInfo.advisor', 'name.fullName email');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Get results summary
    const summary = await student.getResultsSummary();

    res.json({
      success: true,
      data: {
        student: {
          studentId: student.studentId,
          name: student.name.fullName,
          email: student.email,
          program: student.program,
          batch: student.batch,
          currentSemester: student.currentSemester,
          advisor: student.academicInfo.advisor
        },
        academic: {
          currentGPA: student.academicInfo.currentGPA,
          cumulativeGPA: student.academicInfo.cumulativeGPA,
          totalCreditsEarned: student.academicInfo.totalCreditsEarned,
          academicStanding: student.academicInfo.academicStanding
        },
        performance: summary
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get students by program
exports.getStudentsByProgram = async (req, res) => {
  try {
    const { program } = req.params;

    const students = await Student.find({ 
      program,
      'enrollment.status': 'Active'
    })
    .select('studentId name.fullName email currentSemester academicInfo.currentGPA')
    .sort({ studentId: 1 });

    res.json({
      success: true,
      data: {
        program,
        count: students.length,
        students
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get students by batch
exports.getStudentsByBatch = async (req, res) => {
  try {
    const { batch } = req.params;

    const students = await Student.find({ 
      batch,
      'enrollment.status': 'Active'
    })
    .select('studentId name.fullName email program currentSemester')
    .sort({ studentId: 1 });

    res.json({
      success: true,
      data: {
        batch,
        count: students.length,
        students
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
