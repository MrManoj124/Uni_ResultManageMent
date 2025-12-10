const Student = require('../models/student');
const Course = require('../models/course');
const Result = require('../models/result');
const User = require('../models/user');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ 'enrollment.status': 'Active' });
    const totalCourses = await Course.countDocuments({ isActive: true });
    const publishedResults = await Result.countDocuments({ status: 'published' });
    const pendingResults = await Result.countDocuments({ status: 'pending' });
    const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });

    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        totalStaff,
        publishedResults,
        pendingResults
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};