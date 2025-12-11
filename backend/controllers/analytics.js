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


