// backend/controllers/staff.controller.js
const Staff = require('../models/Staff');
const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Result = require('../models/Result');

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const { department, designation, page = 1, limit = 20, search } = req.query;
    
    const query = { isActive: true };
    
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (search) {
      query.$or = [
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastName': { $regex: search, $options: 'i' } },
        { staffId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const staff = await Staff.find(query)
      .populate('assignedCourses', 'code name credits')
      .populate('advisingStudents', 'studentId name.fullName')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: {
        staff,
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

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const staff = await Staff.findOne({ staffId })
      .populate('assignedCourses')
      .populate('advisingStudents')
      .populate('userId', '-password');

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get staff by department
exports.getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    
    const staff = await Staff.findByDepartment(department);

    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add new staff
exports.addStaff = async (req, res) => {
  try {
    const staffData = req.body;

    // Check if staff ID already exists
    const existingStaff = await Staff.findOne({ staffId: staffData.staffId });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        error: 'Staff ID already exists'
      });
    }

    // Create user account for staff
    const username = staffData.staffId;
    const password = `staff${Math.random().toString(36).slice(-8)}`; // Generate random password
    
    const user = await User.create({
      username,
      email: staffData.email,
      password,
      role: 'staff',
      name: `${staffData.name.firstName} ${staffData.name.lastName}`,
      staffId: staffData.staffId,
      department: staffData.department,
      isEmailVerified: true
    });

    // Create staff profile
    const staff = await Staff.create({
      ...staffData,
      userId: user._id
    });

    // Send welcome email with credentials
    // TODO: Implement email sending

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: {
        staff,
        credentials: {
          username,
          temporaryPassword: password
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

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const updates = req.body;

    // Check if user is updating their own profile or is admin
    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    if (req.user.role !== 'admin' && req.user.staffId !== staffId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile'
      });
    }

    // Prevent updating certain fields if not admin
    if (req.user.role !== 'admin') {
      delete updates.staffId;
      delete updates.permissions;
      delete updates.department;
      delete updates.designation;
    }

    const updatedStaff = await Staff.findOneAndUpdate(
      { staffId },
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Staff updated successfully',
      data: { staff: updatedStaff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Soft delete - just mark as inactive
    staff.isActive = false;
    await staff.save();

    // Also deactivate user account
    await User.findByIdAndUpdate(staff.userId, { isActive: false });

    res.json({
      success: true,
      message: 'Staff member deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get assigned courses
exports.getAssignedCourses = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findOne({ staffId }).populate('assignedCourses');
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: { courses: staff.assignedCourses }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Assign course to staff
exports.assignCourse = async (req, res) => {
  try {
    const { staffId, courseId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if already assigned
    if (staff.assignedCourses.includes(courseId)) {
      return res.status(400).json({
        success: false,
        error: 'Course already assigned to this staff member'
      });
    }

    staff.assignedCourses.push(courseId);
    await staff.save();

    res.json({
      success: true,
      message: 'Course assigned successfully',
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove course from staff
exports.removeCourse = async (req, res) => {
  try {
    const { staffId, courseId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    staff.assignedCourses = staff.assignedCourses.filter(
      id => id.toString() !== courseId
    );
    await staff.save();

    res.json({
      success: true,
      message: 'Course removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get advising students
exports.getAdvisingStudents = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findOne({ staffId }).populate('advisingStudents');
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: { students: staff.advisingStudents }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Assign student to staff advisor
exports.assignStudent = async (req, res) => {
  try {
    const { staffId, studentId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Check if already assigned
    if (staff.advisingStudents.includes(student._id)) {
      return res.status(400).json({
        success: false,
        error: 'Student already assigned to this advisor'
      });
    }

    staff.advisingStudents.push(student._id);
    await staff.save();

    // Update student's advisor
    student.academicInfo.advisor = staff._id;
    await student.save();

    res.json({
      success: true,
      message: 'Student assigned to advisor successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove student from staff advisor
exports.removeStudent = async (req, res) => {
  try {
    const { staffId, studentId } = req.params;

    const staff = await Staff.findOne({ staffId });
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    const student = await Student.findOne({ studentId });
    if (student) {
      student.academicInfo.advisor = null;
      await student.save();
    }

    staff.advisingStudents = staff.advisingStudents.filter(
      id => id.toString() !== student._id.toString()
    );
    await staff.save();

    res.json({
      success: true,
      message: 'Student removed from advisor successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update permissions
exports.updatePermissions = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { permissions } = req.body;

    const staff = await Staff.findOneAndUpdate(
      { staffId },
      { permissions },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: { staff }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get dashboard stats for staff
exports.getDashboardStats = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findOne({ staffId })
      .populate('assignedCourses')
      .populate('advisingStudents');

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found'
      });
    }

    // Get results uploaded by this staff
    const uploadedResults = await Result.countDocuments({
      uploadedBy: staff.userId
    });

    const pendingResults = await Result.countDocuments({
      uploadedBy: staff.userId,
      status: 'pending'
    });

    const stats = {
      assignedCourses: staff.assignedCourses.length,
      advisingStudents: staff.advisingStudents.length,
      uploadedResults,
      pendingResults,
      courses: staff.assignedCourses,
      students: staff.advisingStudents
    };

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};