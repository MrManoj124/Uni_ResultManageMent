const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics');
const { authenticate, authorize } = require('../middleware/auth');

