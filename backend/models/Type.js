// backend/models/Type.js
const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    typeId: {
        type: String,
        required: [true, 'Type ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
        // Format: [Faculty Code][Year][Semester] e.g., B11, B12, T21, AS31
        match: [/^[A-Z]+[1-4][1-2]$/, 'Type ID format: [FacultyCode][Year][Semester]']
    },
    faculty: {
        type: String,
        required: [true, 'Faculty is required'],
        enum: [
            'Business',
            'Technology',
            'Applied Science'
        ]
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: [
            // Business Faculty
            'Banking Insurance',
            'Business Management',
            'Project Management',
            // Technology Faculty
            'Engineering',
            'Computer Engineering',
            // Applied Science Faculty
            'Bio-Science',
            'Physical Science',
            'Information and Communication Technology',
            'Applied Mathematical and Computer Science'
        ]
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: 1,
        max: 4
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required'],
        min: 1,
        max: 2
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        // Format: YYYY/YYYY
        match: [/^\d{4}\/\d{4}$/, 'Academic year format: YYYY/YYYY']
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    assignedStaff: [{
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff',
            required: true
        },
        courses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
        assignedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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

// Indexes
typeSchema.index({ typeId: 1 });
typeSchema.index({ faculty: 1, department: 1 });
typeSchema.index({ year: 1, semester: 1 });
typeSchema.index({ academicYear: 1 });
typeSchema.index({ isActive: 1 });

// Compound index for unique type per academic year
typeSchema.index({ typeId: 1, academicYear: 1 }, { unique: true });

// Virtual for full description
typeSchema.virtual('fullDescription').get(function () {
    return `${this.faculty} - ${this.department} - Year ${this.year} Semester ${this.semester}`;
});

// Method to add student to type
typeSchema.methods.enrollStudent = async function (studentId) {
    if (!this.students.includes(studentId)) {
        this.students.push(studentId);
        await this.save();
    }
    return this;
};

// Method to remove student from type
typeSchema.methods.removeStudent = async function (studentId) {
    this.students = this.students.filter(id => !id.equals(studentId));
    await this.save();
    return this;
};

// Method to assign staff to courses
typeSchema.methods.assignStaffToCourses = async function (staffId, courseIds) {
    const existingAssignment = this.assignedStaff.find(
        assignment => assignment.staffId.equals(staffId)
    );

    if (existingAssignment) {
        // Update existing assignment
        existingAssignment.courses = courseIds;
    } else {
        // Create new assignment
        this.assignedStaff.push({
            staffId,
            courses: courseIds,
            assignedAt: new Date()
        });
    }

    await this.save();
    return this;
};

// Method to remove staff assignment
typeSchema.methods.removeStaffAssignment = async function (staffId) {
    this.assignedStaff = this.assignedStaff.filter(
        assignment => !assignment.staffId.equals(staffId)
    );
    await this.save();
    return this;
};

// Method to add course to type
typeSchema.methods.addCourse = async function (courseId) {
    if (!this.courses.includes(courseId)) {
        this.courses.push(courseId);
        await this.save();
    }
    return this;
};

// Method to get all students with details
typeSchema.methods.getStudentsWithDetails = async function () {
    await this.populate('students');
    return this.students;
};

// Method to get all staff with details
typeSchema.methods.getStaffWithDetails = async function () {
    await this.populate('assignedStaff.staffId');
    await this.populate('assignedStaff.courses');
    return this.assignedStaff;
};

// Static method to find types by faculty
typeSchema.statics.findByFaculty = function (faculty) {
    return this.find({ faculty, isActive: true });
};

// Static method to find types by department
typeSchema.statics.findByDepartment = function (department) {
    return this.find({ department, isActive: true });
};

// Static method to find types by year and semester
typeSchema.statics.findByYearAndSemester = function (year, semester) {
    return this.find({ year, semester, isActive: true });
};

module.exports = mongoose.model('Type', typeSchema);
