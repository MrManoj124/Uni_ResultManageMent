require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// ============================================
// DATABASE CONNECTION - FIXED ✅
// ============================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: 'ResultPro API Server',
    version: '1.0.0',
    status: 'Running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      students: '/api/students',
      courses: '/api/courses',
      results: '/api/results',
      staff: '/api/staff',
      analytics: '/api/analytics',
      notifications: '/api/notifications'
    }
  });
});

// Import all routes
const authRoutes = require('./routes/authroute');
const userRoutes = require('./routes/Userroutes');
const studentRoutes = require('./routes/Studentroute');
const courseRoutes = require('./routes/Courseroute');
const resultRoutes = require('./routes/Resultroute');
const staffRoutes = require('./routes/Staffroute');
const notificationRoutes = require('./routes/Notificationroute');
const analyticsRoutes = require('./routes/Analyticsroute');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);


// Error handling
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

app.use(notFound);
app.use(errorHandler);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log('='.repeat(50));
});

module.exports = app;