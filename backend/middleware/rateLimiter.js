// ==========================================
// middleware/rateLimiter.js - Rate Limiting
// ==========================================
const rateLimit = require('express-rate-limit');

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Auth limiter (stricter)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

// Upload limiter
exports.uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many uploads, please try again later.'
});