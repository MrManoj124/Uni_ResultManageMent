const Student = require('../models/Student');
const Course = require('../models/Course');
const Result = require('../models/Results');
const User = require('../models/User');

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

// Get student performance analytics
exports.getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const results = await Result.find({ 
      studentId,
      status: 'published'
    }).populate('courseId', 'code name credits semester');

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          results: [],
          gpa: '0.00',
          totalCredits: 0,
          gradeDistribution: {},
          semesterPerformance: []
        }
      });
    }

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

    // Grade distribution
    const gradeDistribution = {};
    results.forEach(result => {
      gradeDistribution[result.grade] = (gradeDistribution[result.grade] || 0) + 1;
    });

 const semesterPerformance = {};
    results.forEach(result => {
      const semester = result.courseId?.semester || 'Unknown';
      if (!semesterPerformance[semester]) {
        semesterPerformance[semester] = {
          courses: 0,
          totalMarks: 0,
          credits: 0,
          points: 0
        };
      }
      semesterPerformance[semester].courses++;
      semesterPerformance[semester].totalMarks += result.marks;
      semesterPerformance[semester].credits += result.courseId?.credits || 0;
      semesterPerformance[semester].points += result.gradePoints * (result.courseId?.credits || 0);
    });

    // Calculate semester GPA
    Object.keys(semesterPerformance).forEach(semester => {
      const data = semesterPerformance[semester];
      data.averageMarks = (data.totalMarks / data.courses).toFixed(2);
      data.gpa = data.credits > 0 ? (data.points / data.credits).toFixed(2) : '0.00';
    });

    res.json({
      success: true,
      data: {
        results,
        gpa,
        totalCredits,
        totalCourses: results.length,
        gradeDistribution,
        semesterPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get department statistics
exports.getDepartmentStats = async (req, res) => {
  try {
    const departments = await Course.distinct('department');
    const stats = [];

    for (const department of departments) {
      const courses = await Course.countDocuments({ department, isActive: true });
      const staff = await User.countDocuments({ 
        department, 
        role: 'staff', 
        isActive: true 
      });

      stats.push({
        department,
        courses,
        staff
      });
    }

    res.json({
      success: true,
      data: { departments: stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.getTopPerformers = async (req, res) => {
  try {
    const { limit = 10, semester, academicYear } = req.query;

    const matchQuery = { status: 'published' };
    if (semester) matchQuery.semester = semester;
    if (academicYear) matchQuery.academicYear = academicYear;

    const results = await Result.find(matchQuery).populate('courseId', 'credits');

    // Calculate GPA for each student
    const studentGPAs = {};
    results.forEach(result => {
      if (!studentGPAs[result.studentId]) {
        studentGPAs[result.studentId] = { 
          studentId: result.studentId,
          points: 0, 
          credits: 0,
          courses: 0
        };
      }
      const credits = result.courseId?.credits || 0;
      studentGPAs[result.studentId].points += result.gradePoints * credits;
      studentGPAs[result.studentId].credits += credits;
      studentGPAs[result.studentId].courses++;
    });

    // Calculate GPA and sort
    const topPerformers = Object.values(studentGPAs)
      .map(data => ({
        studentId: data.studentId,
        gpa: data.credits > 0 ? (data.points / data.credits).toFixed(2) : '0.00',
        totalCredits: data.credits,
        totalCourses: data.courses
      }))
      .sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa))
      .slice(0, parseInt(limit));

    // Get student details
    const Student = require('../models/Student');
    const enrichedPerformers = await Promise.all(
      topPerformers.map(async (performer) => {
        const student = await Student.findOne({ studentId: performer.studentId });
        return {
          ...performer,
          name: student?.name?.fullName || student?.name || 'Unknown',
          program: student?.program || 'Unknown'
        };
      })
    );

    res.json({
      success: true,
      data: { topPerformers: enrichedPerformers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get recent activities (Admin dashboard)
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Get recent results
    const recentResults = await Result.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('courseId', 'code name')
      .populate('uploadedBy', 'name')
      .select('studentId marks grade status createdAt uploadedBy courseId');

    // Get recent students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('studentId name.fullName program createdAt');

    // Format activities
    const activities = [
      ...recentResults.map(result => ({
        type: 'result',
        action: result.status === 'published' ? 'published' : 'uploaded',
        description: `Result ${result.status} for ${result.studentId} - ${result.courseId?.code}`,
        by: result.uploadedBy?.name || 'Unknown',
        timestamp: result.createdAt
      })),
      ...recentStudents.map(student => ({
        type: 'student',
        action: 'registered',
        description: `New student registered: ${student.name?.fullName || student.studentId}`,
        timestamp: student.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Export data for reports
exports.exportData = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query;

    let data;

    switch (type) {
      case 'students':
        data = await Student.find({ 'enrollment.status': 'Active' })
          .select('studentId name.fullName email program batch enrollmentYear academicInfo.currentGPA');
        break;

      case 'courses':
        data = await Course.find({ isActive: true })
          .select('code name credits semester department');
        break;

      case 'results':
        data = await Result.find({ status: 'published' })
          .populate('courseId', 'code name credits')
          .select('studentId courseId marks grade gradePoints academicYear');
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type. Use: students, courses, or results'
        });
    }

    // Format based on requested format
    if (format === 'csv') {
      // TODO: Implement CSV conversion
      return res.status(501).json({
        success: false,
        error: 'CSV export not yet implemented'
      });
    }

    res.json({
      success: true,
      data: {
        type,
        count: data.length,
        records: data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};





