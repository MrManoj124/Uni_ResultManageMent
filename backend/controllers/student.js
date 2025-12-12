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
