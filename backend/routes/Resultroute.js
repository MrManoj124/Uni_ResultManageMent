const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');
const { authenticate, authorize } = require('../middleware/auth');


// All routes require authentication
router.use(authenticate);

// Get results (role-based access)
router.get('/', resultController.getAllResults);
router.get('/student/:studentId', resultController.getStudentResults);
router.get('/:id', resultController.getResultById);

// Add/Edit results (Staff and Admin)
router.post('/', authorize('admin', 'staff'), resultController.addResult);
router.post('/bulk', authorize('admin', 'staff'), resultController.bulkUploadResults);
router.put('/:id', authorize('admin', 'staff'), resultController.updateResult);

// Submit for approval (Staff only)
router.patch('/:id/submit-for-approval', authorize('staff'), resultController.submitForApproval);

// Publish result (Admin only)
router.patch('/:id/publish', authorize('admin'), resultController.publishResult);

// Delete result (Admin and Staff for own results)
router.delete('/:id', authorize('admin', 'staff'), resultController.deleteResult);

module.exports = router;