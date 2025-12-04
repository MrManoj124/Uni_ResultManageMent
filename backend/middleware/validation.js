// ==========================================
// middleware/validation.js - Input Validation
// ==========================================
const { validationResult } = require('express-validator');

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

const { body, param, query } = require('express-validator');

exports.validateRegister = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').isIn(['admin', 'student', 'staff']).withMessage('Invalid role')
];

exports.validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

exports.validateEmail = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];