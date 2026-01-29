// backend/controllers/type.js
const Type = require('../models/Type');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Course = require('../models/Course');

// @desc    Create new type
// @route   POST /api/types
// @access  Admin
exports.createType = async (req, res) => {
    try {
        const { typeId, faculty, department, year, semester, academicYear, description } = req.body;

        // Check if type already exists
        const existingType = await Type.findOne({ typeId, academicYear });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Type already exists for this academic year'
            });
        }

        const type = await Type.create({
            typeId,
            faculty,
            department,
            year,
            semester,
            academicYear,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: type,
            message: 'Type created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all types
// @route   GET /api/types
// @access  Admin, Staff
exports.getAllTypes = async (req, res) => {
    try {
        const { faculty, department, year, semester, academicYear, isActive } = req.query;

        const filter = {};
        if (faculty) filter.faculty = faculty;
        if (department) filter.department = department;
        if (year) filter.year = parseInt(year);
        if (semester) filter.semester = parseInt(semester);
        if (academicYear) filter.academicYear = academicYear;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const types = await Type.find(filter)
            .populate('courses', 'code name credits')
            .populate('students', 'studentId name.fullName email')
            .populate('assignedStaff.staffId', 'staffId name.fullName designation')
            .populate('assignedStaff.courses', 'code name')
            .sort({ typeId: 1 });

        res.status(200).json({
            success: true,
            count: types.length,
            data: types
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get type by ID
// @route   GET /api/types/:id
// @access  Admin, Staff
exports.getTypeById = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id)
            .populate('courses')
            .populate('students')
            .populate('assignedStaff.staffId')
            .populate('assignedStaff.courses');

        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: type
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update type
// @route   PUT /api/types/:id
// @access  Admin
exports.updateType = async (req, res) => {
    try {
        const type = await Type.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: type,
            message: 'Type updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete type
// @route   DELETE /api/types/:id
// @access  Admin
exports.deleteType = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);

        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        // Soft delete - set isActive to false
        type.isActive = false;
        await type.save();

        res.status(200).json({
            success: true,
            message: 'Type deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Enroll student to type
// @route   POST /api/types/:id/enroll-student
// @access  Admin
exports.enrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;

        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Update student with type information
        student.typeId = type._id;
        student.faculty = type.faculty;
        student.department = type.department;
        await student.save();

        // Add student to type
        await type.enrollStudent(studentId);

        res.status(200).json({
            success: true,
            data: type,
            message: 'Student enrolled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Bulk enroll students to type
// @route   POST /api/types/:id/bulk-enroll
// @access  Admin
exports.bulkEnrollStudents = async (req, res) => {
    try {
        const { studentIds } = req.body;

        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        const enrolled = [];
        const failed = [];

        for (const studentId of studentIds) {
            try {
                const student = await Student.findById(studentId);
                if (student) {
                    student.typeId = type._id;
                    student.faculty = type.faculty;
                    student.department = type.department;
                    await student.save();
                    await type.enrollStudent(studentId);
                    enrolled.push(studentId);
                } else {
                    failed.push({ studentId, reason: 'Student not found' });
                }
            } catch (error) {
                failed.push({ studentId, reason: error.message });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                enrolled: enrolled.length,
                failed: failed.length,
                failedDetails: failed
            },
            message: `Enrolled ${enrolled.length} students successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Assign staff to courses in type
// @route   POST /api/types/:id/assign-staff
// @access  Admin
exports.assignStaff = async (req, res) => {
    try {
        const { staffId, courseIds } = req.body;

        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        // Verify all courses exist and belong to this type
        const courses = await Course.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more courses not found'
            });
        }

        // Update staff with assigned courses and type
        if (!staff.assignedTypes.includes(type._id)) {
            staff.assignedTypes.push(type._id);
        }

        courseIds.forEach(courseId => {
            if (!staff.assignedCourses.includes(courseId)) {
                staff.assignedCourses.push(courseId);
            }
        });

        await staff.save();

        // Assign staff to courses in type
        await type.assignStaffToCourses(staffId, courseIds);

        res.status(200).json({
            success: true,
            data: type,
            message: 'Staff assigned successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove staff assignment from type
// @route   DELETE /api/types/:id/staff/:staffId
// @access  Admin
exports.removeStaffAssignment = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        await type.removeStaffAssignment(req.params.staffId);

        res.status(200).json({
            success: true,
            data: type,
            message: 'Staff assignment removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Add course to type
// @route   POST /api/types/:id/courses
// @access  Admin
exports.addCourse = async (req, res) => {
    try {
        const { courseId } = req.body;

        const type = await Type.findById(req.params.id);
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Update course with type information
        course.typeId = type._id;
        course.faculty = type.faculty;
        course.department = type.department;
        await course.save();

        // Add course to type
        await type.addCourse(courseId);

        res.status(200).json({
            success: true,
            data: type,
            message: 'Course added successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get type statistics
// @route   GET /api/types/:id/stats
// @access  Admin, Staff
exports.getTypeStats = async (req, res) => {
    try {
        const type = await Type.findById(req.params.id)
            .populate('students')
            .populate('courses')
            .populate('assignedStaff.staffId');

        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        const stats = {
            totalStudents: type.students.length,
            totalCourses: type.courses.length,
            totalStaff: type.assignedStaff.length,
            activeStudents: type.students.filter(s => s.enrollment?.status === 'Active').length,
            typeInfo: {
                typeId: type.typeId,
                faculty: type.faculty,
                department: type.department,
                year: type.year,
                semester: type.semester,
                academicYear: type.academicYear
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
