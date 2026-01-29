// backend/routes/Typeroute.js
const express = require('express');
const router = express.Router();
const {
    createType,
    getAllTypes,
    getTypeById,
    updateType,
    deleteType,
    enrollStudent,
    bulkEnrollStudents,
    assignStaff,
    removeStaffAssignment,
    addCourse,
    getTypeStats
} = require('../controllers/type');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Type CRUD operations (Admin only)
router.route('/')
    .get(authorize('admin', 'staff'), getAllTypes)
    .post(authorize('admin'), createType);

router.route('/:id')
    .get(authorize('admin', 'staff'), getTypeById)
    .put(authorize('admin'), updateType)
    .delete(authorize('admin'), deleteType);

// Student enrollment (Admin only)
router.post('/:id/enroll-student', authorize('admin'), enrollStudent);
router.post('/:id/bulk-enroll', authorize('admin'), bulkEnrollStudents);

// Staff assignment (Admin only)
router.post('/:id/assign-staff', authorize('admin'), assignStaff);
router.delete('/:id/staff/:staffId', authorize('admin'), removeStaffAssignment);

// Course management (Admin only)
router.post('/:id/courses', authorize('admin'), addCourse);

// Statistics
router.get('/:id/stats', authorize('admin', 'staff'), getTypeStats);

module.exports = router;
