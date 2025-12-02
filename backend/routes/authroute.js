// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRegister, validateLogin, validateEmail } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateEmail, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', validateEmail, authController.resendVerification);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.put('/change-password', authenticate, authController.changePassword);
router.put('/update-profile', authenticate, authController.updateProfile);
router.post('/refresh-token', authenticate, authController.refreshToken);

// Admin only
router.post('/create-user', authenticate, authorize('admin'), authController.createUser);
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);
router.put('/users/:userId/activate', authenticate, authorize('admin'), authController.activateUser);
router.put('/users/:userId/deactivate', authenticate, authorize('admin'), authController.deactivateUser);

module.exports = router;