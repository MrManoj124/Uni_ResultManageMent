const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result');
const { authenticate, authorize } = require('../middleware/auth');


