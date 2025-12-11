const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course');
const {authenticate, authorize} = require('../middleware/auth');

