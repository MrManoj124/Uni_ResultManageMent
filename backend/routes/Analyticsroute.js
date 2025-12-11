const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Admin and Staff can access analytics
router.use(authorize('admin', 'staff'));

// Dashboard statistics
router.get('/dashboard-stats', analyticsController.getDashboardStats);
router.get('/recent-activities', analyticsController.getRecentActivities);

// Grade and performance analytics
router.get('/grade-distribution', analyticsController.getGradeDistribution);
router.get('/pass-rate', analyticsController.getPassRate);
router.get('/student-performance/:studentId', analyticsController.getStudentPerformance);
router.get('/course-analytics/:courseId', analyticsController.getCourseAnalytics);
router.get('/top-performers', analyticsController.getTopPerformers);

// Department and semester statistics
router.get('/department-stats', analyticsController.getDepartmentStats);
router.get('/semester-stats', analyticsController.getSemesterStats);

// Export data
router.get('/export', authorize('admin'), analyticsController.exportData);

module.exports = router;