// ==========================================
// models/Course.js - Course Model
// ==========================================
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot exceed 6']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required']
  },
  department: {
    type: String,
    enum: [
      'Information Technology',
      'Computer Science',
      'Software Engineering',
      'Data Science',
      'Physical Science',
      'Mathematics',
      'Management',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: 1000
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  syllabus: {
    type: String
  },
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  academicYear: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
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
courseSchema.index({ code: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ isActive: 1 });

// Method to get enrolled students count
courseSchema.methods.getEnrolledStudentsCount = async function() {
  const Result = mongoose.model('Result');
  return await Result.countDocuments({ courseId: this._id });
};

module.exports = mongoose.model('Course', courseSchema);

// ==========================================
// models/Result.js - Result Model
// ==========================================
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
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
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
  },
  gradePoints: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'revised'],
    default: 'draft'
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String
  },
  examDate: {
    type: Date
  },
  examType: {
    type: String,
    enum: ['Midterm', 'Final', 'Quiz', 'Assignment', 'Project', 'Other'],
    default: 'Final'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  },
  remarks: {
    type: String,
    maxlength: 500
  },
  submittedForApproval: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },
  approvalHistory: [{
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'revised']
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    at: {
      type: Date,
      default: Date.now
    },
    comment: String
  }],
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    marks: Number,
    grade: String,
    gradePoints: Number,
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

// Compound index to prevent duplicate results
resultSchema.index({ studentId: 1, courseId: 1, academicYear: 1 }, { unique: true });

// Other indexes
resultSchema.index({ status: 1 });
resultSchema.index({ uploadedBy: 1 });
resultSchema.index({ publishedAt: -1 });

// Pre-save middleware to calculate grade
resultSchema.pre('save', function(next) {
  if (this.isModified('marks')) {
    const gradeInfo = calculateGrade(this.marks);
    this.grade = gradeInfo.grade;
    this.gradePoints = gradeInfo.points;
  }
  next();
});

// Helper function to calculate grade
function calculateGrade(marks) {
  if (marks >= 90) return { grade: 'A+', points: 4.0 };
  if (marks >= 85) return { grade: 'A', points: 4.0 };
  if (marks >= 80) return { grade: 'A-', points: 3.7 };
  if (marks >= 75) return { grade: 'B+', points: 3.3 };
  if (marks >= 70) return { grade: 'B', points: 3.0 };
  if (marks >= 65) return { grade: 'B-', points: 2.7 };
  if (marks >= 60) return { grade: 'C+', points: 2.3 };
  if (marks >= 55) return { grade: 'C', points: 2.0 };
  if (marks >= 50) return { grade: 'C-', points: 1.7 };
  if (marks >= 40) return { grade: 'D', points: 1.0 };
  return { grade: 'F', points: 0.0 };
}

// Method to submit for approval
resultSchema.methods.submitForApproval = async function(userId) {
  this.submittedForApproval = true;
  this.submittedAt = new Date();
  this.status = 'pending';
  this.approvalHistory.push({
    action: 'submitted',
    by: userId,
    at: new Date()
  });
  return await this.save();
};

// Method to publish result
resultSchema.methods.publish = async function(userId) {
  this.status = 'published';
  this.publishedBy = userId;
  this.publishedAt = new Date();
  this.approvalHistory.push({
    action: 'approved',
    by: userId,
    at: new Date()
  });
  return await this.save();
};

// Method to revise result
resultSchema.methods.revise = async function(newMarks, userId, reason) {
  // Save previous version
  this.previousVersions.push({
    marks: this.marks,
    grade: this.grade,
    gradePoints: this.gradePoints,
    modifiedBy: userId,
    modifiedAt: new Date(),
    reason
  });

  this.marks = newMarks;
  this.version += 1;
  this.status = 'revised';

  return await this.save();
};

module.exports = mongoose.model('Result', resultSchema);