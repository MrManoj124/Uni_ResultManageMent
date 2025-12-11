const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification');
const { authenticate, authorize } = require('../middleware/auth');