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
