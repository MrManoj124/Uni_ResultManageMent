// backend/controllers/exam.js
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Staff = require('../models/Staff');
const Type = require('../models/Type');

// @desc    Enter ICA marks
// @route   POST /api/staff/exams/ica
// @access  Staff
exports.enterICAMarks = async (req, res) => {
    try {
        const { studentId, courseId, typeId, examType, marks, conductedDate, remarks } = req.body;

        // Validate exam type
        if (!['ICA1', 'ICA2', 'ICA3'].includes(examType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type. Must be ICA1, ICA2, or ICA3'
            });
        }

        // Get staff info
        const staff = await Staff.findOne({ userId: req.user._id });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        // Verify course is assigned to this staff
        if (!staff.assignedCourses.includes(courseId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this course'
            });
        }

        // Get course to determine academic year
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if exam already exists
        const existingExam = await Exam.findOne({
            studentId,
            courseId,
            examType,
            academicYear: course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
        });

        if (existingExam) {
            // Update existing exam
            existingExam.marks = marks;
            existingExam.conductedDate = conductedDate;
            existingExam.remarks = remarks;
            existingExam.enteredBy = staff._id;
            await existingExam.save();

            return res.status(200).json({
                success: true,
                data: existingExam,
                message: `${examType} marks updated successfully`
            });
        }

        // Create new exam record
        const exam = await Exam.create({
            studentId,
            courseId,
            typeId,
            examType,
            marks,
            conductedDate,
            enteredBy: staff._id,
            academicYear: course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
            remarks,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            data: exam,
            message: `${examType} marks entered successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Enter semester exam marks
// @route   POST /api/staff/exams/semester
// @access  Staff
exports.enterSemesterExamMarks = async (req, res) => {
    try {
        const { studentId, courseId, typeId, marks, conductedDate, remarks } = req.body;

        // Get staff info
        const staff = await Staff.findOne({ userId: req.user._id });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        // Verify course is assigned to this staff
        if (!staff.assignedCourses.includes(courseId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this course'
            });
        }

        // Get course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const academicYear = course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

        // Check if exam already exists
        const existingExam = await Exam.findOne({
            studentId,
            courseId,
            examType: 'SEMESTER',
            academicYear
        });

        if (existingExam) {
            // Update existing exam
            existingExam.marks = marks;
            existingExam.conductedDate = conductedDate;
            existingExam.remarks = remarks;
            existingExam.enteredBy = staff._id;
            await existingExam.save();

            return res.status(200).json({
                success: true,
                data: existingExam,
                message: 'Semester exam marks updated successfully'
            });
        }

        // Create new exam record
        const exam = await Exam.create({
            studentId,
            courseId,
            typeId,
            examType: 'SEMESTER',
            marks,
            conductedDate,
            enteredBy: staff._id,
            academicYear,
            remarks,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            data: exam,
            message: 'Semester exam marks entered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Calculate and save final marks for a student's course
// @route   POST /api/staff/results/calculate
// @access  Staff
exports.calculateFinalMarks = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        // Get staff info
        const staff = await Staff.findOne({ userId: req.user._id });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        // Get course with weightages
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const academicYear = course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

        // Get all exams for this student and course
        const exams = await Exam.getStudentCourseExams(studentId, courseId, academicYear);

        if (exams.length !== 4) {
            return res.status(400).json({
                success: false,
                message: 'All exam marks (3 ICAs + 1 Semester exam) must be entered before calculating final marks',
                data: {
                    entered: exams.length,
                    required: 4,
                    missing: ['ICA1', 'ICA2', 'ICA3', 'SEMESTER'].filter(
                        type => !exams.find(e => e.examType === type)
                    )
                }
            });
        }

        // Extract marks
        const ica1 = exams.find(e => e.examType === 'ICA1');
        const ica2 = exams.find(e => e.examType === 'ICA2');
        const ica3 = exams.find(e => e.examType === 'ICA3');
        const semester = exams.find(e => e.examType === 'SEMESTER');

        // Check if result already exists
        let result = await Result.findOne({ studentId, courseId, academicYear });

        if (result) {
            // Update existing result
            result.ica1Marks = ica1.marks;
            result.ica2Marks = ica2.marks;
            result.ica3Marks = ica3.marks;
            result.semesterExamMarks = semester.marks;
            result.icaWeightage = course.icaWeightage;
            result.semesterWeightage = course.semesterExamWeightage;
            result.typeId = course.typeId;
            result.uploadedBy = req.user._id;

            // Calculate final marks (will be done by pre-save middleware)
            await result.save();
        } else {
            // Create new result
            result = await Result.create({
                studentId,
                courseId,
                typeId: course.typeId,
                ica1Marks: ica1.marks,
                ica2Marks: ica2.marks,
                ica3Marks: ica3.marks,
                semesterExamMarks: semester.marks,
                icaWeightage: course.icaWeightage,
                semesterWeightage: course.semesterExamWeightage,
                academicYear,
                semester: course.semester,
                uploadedBy: req.user._id,
                status: 'draft'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                result,
                breakdown: {
                    ica1: ica1.marks,
                    ica2: ica2.marks,
                    ica3: ica3.marks,
                    avgICA: (ica1.marks + ica2.marks + ica3.marks) / 3,
                    semesterExam: semester.marks,
                    icaWeightage: course.icaWeightage,
                    semesterWeightage: course.semesterExamWeightage,
                    finalMarks: result.finalMarks,
                    grade: result.grade
                }
            },
            message: 'Final marks calculated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Submit result sheet to admin
// @route   POST /api/staff/results/submit
// @access  Staff
exports.submitResultSheetToAdmin = async (req, res) => {
    try {
        const { courseId, typeId, studentIds } = req.body;

        // Get staff info
        const staff = await Staff.findOne({ userId: req.user._id });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        // Verify course is assigned to this staff
        if (!staff.assignedCourses.includes(courseId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this course'
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const academicYear = course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

        const submitted = [];
        const failed = [];

        for (const studentId of studentIds) {
            try {
                const result = await Result.findOne({ studentId, courseId, academicYear });

                if (!result) {
                    failed.push({ studentId, reason: 'Result not found. Please calculate final marks first.' });
                    continue;
                }

                if (!result.finalMarks) {
                    failed.push({ studentId, reason: 'Final marks not calculated' });
                    continue;
                }

                // Submit to admin
                await result.submitToAdmin(req.user._id);
                submitted.push(studentId);
            } catch (error) {
                failed.push({ studentId, reason: error.message });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                submitted: submitted.length,
                failed: failed.length,
                failedDetails: failed
            },
            message: `Submitted ${submitted.length} results to admin for approval`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get assigned types for staff
// @route   GET /api/staff/types
// @access  Staff
exports.getAssignedTypes = async (req, res) => {
    try {
        const staff = await Staff.findOne({ userId: req.user._id })
            .populate('assignedTypes');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: staff.assignedTypes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get students by type and course
// @route   GET /api/staff/types/:typeId/students
// @access  Staff
exports.getStudentsByType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const { courseId } = req.query;

        const staff = await Staff.findOne({ userId: req.user._id });
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff profile not found'
            });
        }

        const type = await Type.findById(typeId).populate('students');
        if (!type) {
            return res.status(404).json({
                success: false,
                message: 'Type not found'
            });
        }

        let students = type.students;

        // If courseId is provided, get exam completion status for each student
        if (courseId) {
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found'
                });
            }

            const academicYear = course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

            const studentsWithExamStatus = await Promise.all(
                students.map(async (student) => {
                    const examStatus = await Exam.getCompletionStatus(student.studentId, courseId, academicYear);
                    const result = await Result.findOne({
                        studentId: student.studentId,
                        courseId,
                        academicYear
                    });

                    return {
                        ...student.toObject(),
                        examStatus,
                        result: result ? {
                            finalMarks: result.finalMarks,
                            grade: result.grade,
                            status: result.status
                        } : null
                    };
                })
            );

            students = studentsWithExamStatus;
        }

        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get exam marks for a student in a course
// @route   GET /api/staff/exams/:studentId/:courseId
// @access  Staff
exports.getStudentExamMarks = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        const academicYear = course.academicYear || new Date().getFullYear() + '/' + (new Date().getFullYear() + 1);

        const exams = await Exam.getStudentCourseExams(studentId, courseId, academicYear);
        const result = await Result.findOne({ studentId, courseId, academicYear });

        res.status(200).json({
            success: true,
            data: {
                exams,
                result,
                completionStatus: await Exam.getCompletionStatus(studentId, courseId, academicYear)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
