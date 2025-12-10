const Course = require('../models/course');
const Result = require('../models/result');

//Get all courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const {department, semester, page =1, limit =20, search} = req.query;