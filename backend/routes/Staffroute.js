// backend/routes/staff.routes.js
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff');
const examController = require('../controllers/exam');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all staff (Admin and Staff can view)
router.get('/', authorize('admin', 'staff'), staffController.getAllStaff);

// Get single staff
router.get('/:staffId', authorize('admin', 'staff'), staffController.getStaffById);

// Get staff by department
router.get('/department/:department', authorize('admin', 'staff'), staffController.getStaffByDepartment);

// Add new staff (Admin only)
router.post('/', authorize('admin'), staffController.addStaff);

// Update staff (Admin only, or staff updating own profile)
router.put('/:staffId', staffController.updateStaff);

// Delete staff (Admin only)
router.delete('/:staffId', authorize('admin'), staffController.deleteStaff);

// Get staff's assigned courses
router.get('/:staffId/courses', authorize('admin', 'staff'), staffController.getAssignedCourses);

// Assign course to staff (Admin only)
router.post('/:staffId/courses/:courseId', authorize('admin'), staffController.assignCourse);

// Remove course from staff (Admin only)
router.delete('/:staffId/courses/:courseId', authorize('admin'), staffController.removeCourse);

// Get staff's advising students
router.get('/:staffId/students', authorize('admin', 'staff'), staffController.getAdvisingStudents);

// Assign student to staff advisor (Admin only)
router.post('/:staffId/students/:studentId', authorize('admin'), staffController.assignStudent);

// Remove student from staff advisor (Admin only)
router.delete('/:staffId/students/:studentId', authorize('admin'), staffController.removeStudent);

// Update staff permissions (Admin only)
router.put('/:staffId/permissions', authorize('admin'), staffController.updatePermissions);

// Get staff dashboard stats
router.get('/:staffId/dashboard', authorize('admin', 'staff'), staffController.getDashboardStats);

// ============================================
// EXAM MARKS ENTRY ROUTES (Staff only)
// ============================================

// Enter ICA marks
router.post('/exams/ica', authorize('staff'), examController.enterICAMarks);

// Enter semester exam marks
router.post('/exams/semester', authorize('staff'), examController.enterSemesterExamMarks);

// Get exam marks for a student in a course
router.get('/exams/:studentId/:courseId', authorize('staff'), examController.getStudentExamMarks);

// Calculate final marks
router.post('/results/calculate', authorize('staff'), examController.calculateFinalMarks);

// Submit result sheet to admin
router.post('/results/submit', authorize('staff'), examController.submitResultSheetToAdmin);

// Get assigned types
router.get('/types', authorize('staff'), examController.getAssignedTypes);

// Get students by type
router.get('/types/:typeId/students', authorize('staff'), examController.getStudentsByType);

module.exports = router;