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

// Get grade distribution
exports.getGradeDistribution = async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.query;

    const matchQuery = { status: 'published' };
    if (courseId) matchQuery.courseId = courseId;
    if (semester) matchQuery.semester = semester;
    if (academicYear) matchQuery.academicYear = academicYear;

    const distribution = await Result.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { distribution }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get pass rate
exports.getPassRate = async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.query;

    const matchQuery = { status: 'published' };
    if (courseId) matchQuery.courseId = courseId;
    if (semester) matchQuery.semester = semester;
    if (academicYear) matchQuery.academicYear = academicYear;

    const totalResults = await Result.countDocuments(matchQuery);
    const passedResults = await Result.countDocuments({ 
      ...matchQuery,
      grade: { $ne: 'F' }
    });

    const passRate = totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalResults,
        passedResults,
        failedResults: totalResults - passedResults,
        passRate: parseFloat(passRate)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

