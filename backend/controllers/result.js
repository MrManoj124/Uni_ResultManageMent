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
