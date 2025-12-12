const Course = require('../models/Course');
const Result = require('../models/result');

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 20, search } = req.query;
    
    const query = { isActive: true };
    
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(query)
      .populate('assignedStaff', 'name.fullName staffId designation')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ code: 1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single course
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('assignedStaff', 'name.fullName staffId designation email')
      .populate('prerequisites', 'code name');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get enrolled students count
    const enrolledCount = await course.getEnrolledStudentsCount();

    res.json({
      success: true,
      data: {
        course,
        enrolledCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get course by code
exports.getCourseByCode = async (req, res) => {
  try {
    const course = await Course.findOne({ code: req.params.code })
      .populate('assignedStaff', 'name.fullName staffId');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add new course
exports.addCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      createdBy: req.user.id
    };

    const course = await Course.create(courseData);

    res.status(201).json({
      success: true,
      message: 'Course added successfully',
      data: { course }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Course code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete course (soft delete)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if course has results
    const hasResults = await Result.countDocuments({ courseId: req.params.id });
    
    if (hasResults > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete course with existing results. Please delete results first.'
      });
    }

    // Soft delete
    course.isActive = false;
    await course.save();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get courses by department
exports.getCoursesByDepartment = async (req, res) => {
  try {
    const courses = await Course.find({
      department: req.params.department,
      isActive: true
    }).sort({ code: 1 });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get courses by semester
exports.getCoursesBySemester = async (req, res) => {
  try {
    const courses = await Course.find({
      semester: req.params.semester,
      isActive: true
    }).sort({ code: 1 });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Assign staff to course
exports.assignStaff = async (req, res) => {
  try {
    const { staffId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    if (course.assignedStaff.includes(staffId)) {
      return res.status(400).json({
        success: false,
        error: 'Staff already assigned to this course'
      });
    }

    course.assignedStaff.push(staffId);
    await course.save();

    res.json({
      success: true,
      message: 'Staff assigned to course successfully',
      data: { course }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove staff from course
exports.removeStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    course.assignedStaff = course.assignedStaff.filter(
      id => id.toString() !== staffId
    );
    await course.save();

    res.json({
      success: true,
      message: 'Staff removed from course successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};