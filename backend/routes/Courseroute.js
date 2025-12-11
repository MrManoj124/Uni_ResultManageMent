const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course');
const {authenticate, authorize} = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Public routes (authenticated users)
router.get('/', courseController.getAllCourses);
router.get('/code/:code', courseController.getCourseByCode);
router.get('/department/:department', courseController.getCoursesByDepartment);
router.get('/semester/:semester', courseController.getCoursesBySemester);
router.get('/:id', courseController.getCourseById);

// Admin only routes
router.post('/', authorize('admin'), courseController.addCourse);
router.put('/:id', authorize('admin'), courseController.updateCourse);
router.delete('/:id', authorize('admin'), courseController.deleteCourse);
router.post('/:id/assign-staff', authorize('admin'), courseController.assignStaff);
router.delete('/:id/staff/:staffId', authorize('admin'), courseController.removeStaff);

module.exports = router;