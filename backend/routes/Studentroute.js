const express = require('express');
const router = express.Router();
const studentController = require('../controllers/user');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'staff'), studentController.getAllStudents);
router.get('/:studentId', studentController.getStudentById);
router.post('/', authorize('admin'), studentController.addStudent);
router.put('/:studentId', authorize('admin'), studentController.updateStudent);
router.delete('/:studentId', authorize('admin'), studentController.deleteStudent);

module.exports = router;