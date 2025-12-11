const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const { authenticate, authorize } = require('../middleware/auth');


// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Admin routes
router.post('/', authorize('admin'), notificationController.createNotification);
router.post('/announcement', authorize('admin'), notificationController.sendAnnouncement);

module.exports = router;