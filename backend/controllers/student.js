const express = require('express');
const router = express.Router();


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

    const Result = require('../models/Result');
    const results = await Result.find({ 
      studentId,
      status: 'published'
    }).populate('courseId', 'code name credits semester');

    res.json({
      success: true,
      data: { results }
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

    const gpaData = await student.calculateGPA();

    res.json({
      success: true,
      data: gpaData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
