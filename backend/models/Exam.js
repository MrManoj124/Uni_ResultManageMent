// backend/models/Exam.js
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: [true, 'Student ID is required'],
        ref: 'Student'
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Course ID is required'],
        ref: 'Course'
    },
    typeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Type ID is required'],
        ref: 'Type'
    },
    examType: {
        type: String,
        required: [true, 'Exam type is required'],
        enum: ['ICA1', 'ICA2', 'ICA3', 'SEMESTER']
    },
    marks: {
        type: Number,
        required: [true, 'Marks are required'],
        min: [0, 'Marks cannot be negative'],
        max: [100, 'Marks cannot exceed 100']
    },
    maxMarks: {
        type: Number,
        default: 100,
        min: 1
    },
    conductedDate: {
        type: Date
    },
    enteredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'published'],
        default: 'draft'
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        match: [/^\d{4}\/\d{4}$/, 'Academic year format: YYYY/YYYY']
    },
    remarks: {
        type: String,
        maxlength: 500
    },
    submittedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    publishedAt: {
        type: Date
    },
    version: {
        type: Number,
        default: 1
    },
    previousVersions: [{
        marks: Number,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        modifiedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate exam entries
examSchema.index({
    studentId: 1,
    courseId: 1,
    examType: 1,
    academicYear: 1
}, { unique: true });

// Other indexes
examSchema.index({ typeId: 1 });
examSchema.index({ status: 1 });
examSchema.index({ enteredBy: 1 });
examSchema.index({ examType: 1 });

// Method to submit exam for approval
examSchema.methods.submit = async function () {
    this.status = 'submitted';
    this.submittedAt = new Date();
    return await this.save();
};

// Method to approve exam
examSchema.methods.approve = async function (userId) {
    this.status = 'approved';
    this.approvedBy = userId;
    this.approvedAt = new Date();
    return await this.save();
};

// Method to publish exam
examSchema.methods.publish = async function () {
    this.status = 'published';
    this.publishedAt = new Date();
    return await this.save();
};

// Method to revise marks
examSchema.methods.reviseMarks = async function (newMarks, userId, reason) {
    // Save previous version
    this.previousVersions.push({
        marks: this.marks,
        modifiedBy: userId,
        modifiedAt: new Date(),
        reason
    });

    this.marks = newMarks;
    this.version += 1;
    this.status = 'draft'; // Reset to draft after revision

    return await this.save();
};

// Static method to get all exams for a student in a course
examSchema.statics.getStudentCourseExams = function (studentId, courseId, academicYear) {
    return this.find({ studentId, courseId, academicYear }).sort({ examType: 1 });
};

// Static method to get exams by type
examSchema.statics.getExamsByType = function (typeId, examType) {
    return this.find({ typeId, examType, status: { $ne: 'draft' } });
};

// Static method to calculate completion status
examSchema.statics.getCompletionStatus = async function (studentId, courseId, academicYear) {
    const exams = await this.find({ studentId, courseId, academicYear });

    const status = {
        ICA1: exams.find(e => e.examType === 'ICA1') || null,
        ICA2: exams.find(e => e.examType === 'ICA2') || null,
        ICA3: exams.find(e => e.examType === 'ICA3') || null,
        SEMESTER: exams.find(e => e.examType === 'SEMESTER') || null,
        isComplete: exams.length === 4
    };

    return status;
};

module.exports = mongoose.model('Exam', examSchema);
