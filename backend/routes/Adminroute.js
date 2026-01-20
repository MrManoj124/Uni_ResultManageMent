const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authenticate, authorize } = require('../middleware/auth');


// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Admin Dashboard Summary (can be a more comprehensive aggregate than analytics)
router.get('/summary', adminController.getAdminSummary);

// System Management
router.get('/system-status', adminController.getSystemStatus);
router.post('/maintenance-mode', adminController.toggleMaintenanceMode);

// Advanced User Management
router.post('/users/bulk-activate', adminController.bulkActivateUsers);
router.delete('/users/bulk-delete', adminController.bulkDeleteUsers);

// Audit Logs (placeholder for future implementation)
router.get('/logs', adminController.getSystemLogs);

module.exports = router;

