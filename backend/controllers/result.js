const Result= require('../models/result');
const Course = require('../models/course');
const Student = require('../models/student');
const Notification = require('../models/notification');
const {sendEmail} = require('../utils/email');
const {calculateGrade} = require('../utils/gradeCalculator');


// Get all results (role-based)
exports.getAllResults = async (req, res) => {
  try {
    const { status, studentId, courseId, page = 1, limit = 20 } = req.query;
    
    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.studentId = req.user.studentId;
      query.status = 'published';
    } else if (req.user.role === 'staff') {
      query.uploadedBy = req.user.id;
    }

    // Additional filters
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;
    if (courseId) query.courseId = courseId;

    const results = await Result.find(query)
      .populate('courseId', 'code name credits semester')
      .populate('uploadedBy', 'name email')
      .populate('publishedBy', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Result.countDocuments(query);

    res.json({
      success: true,
      data: {
        results,
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

// Get student results with GPA
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

    const results = await Result.find({ 
      studentId,
      status: 'published'
    }).populate('courseId', 'code name credits semester');

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

    res.json({
      success: true,
      data: {
        results,
        gpa,
        totalCredits,
        totalCourses: results.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add single result
exports.addResult = async (req, res) => {
  try {
    const { studentId, courseId, marks, academicYear, semester, examType } = req.body;

    // Verify student exists
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Calculate grade
    const gradeInfo = calculateGrade(marks);

    // Create result
    const result = await Result.create({
      studentId,
      courseId,
      marks,
      grade: gradeInfo.grade,
      gradePoints: gradeInfo.points,
      academicYear,
      semester: semester || course.semester,
      examType: examType || 'Final',
      uploadedBy: req.user.id,
      status: 'draft'
    });

    const populatedResult = await Result.findById(result._id)
      .populate('courseId', 'code name credits');

    res.status(201).json({
      success: true,
      message: 'Result added successfully',
      data: { result: populatedResult }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Result already exists for this student-course combination'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
