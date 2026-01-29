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
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type'
  },
  // Individual exam component marks
  ica1Marks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  ica2Marks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  ica3Marks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  semesterExamMarks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  // Weightages (from course configuration)
  icaWeightage: {
    type: Number,
    enum: [30, 40]
  },
  semesterWeightage: {
    type: Number,
    enum: [60, 70]
  },
  // Calculated final marks
  finalMarks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  // Overall marks (same as finalMarks, kept for compatibility)
  marks: {
    type: Number,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  grade: {
    type: String,
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
  submittedToAdmin: {
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
resultSchema.index({ typeId: 1 });

// Pre-save middleware to calculate final marks
resultSchema.pre('save', function () {
  // Calculate final marks if all components are present
  if (this.ica1Marks != null && this.ica2Marks != null &&
    this.ica3Marks != null && this.semesterExamMarks != null &&
    this.icaWeightage != null && this.semesterWeightage != null) {

    // Calculate average ICA marks
    const avgICAMarks = (this.ica1Marks + this.ica2Marks + this.ica3Marks) / 3;

    // Calculate final marks based on weightages
    this.finalMarks = (avgICAMarks * this.icaWeightage / 100) +
      (this.semesterExamMarks * this.semesterWeightage / 100);

    // Round to 2 decimal places
    this.finalMarks = Math.round(this.finalMarks * 100) / 100;

    // Set marks to finalMarks for compatibility
    this.marks = this.finalMarks;
  }

  // Calculate grade if marks are present
  if (this.marks != null) {
    const gradeInfo = calculateGrade(this.marks);
    this.grade = gradeInfo.grade;
    this.gradePoints = gradeInfo.points;
  }
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
resultSchema.methods.submitForApproval = async function (userId) {
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
resultSchema.methods.publish = async function (userId) {
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
resultSchema.methods.revise = async function (newMarks, userId, reason) {
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

// Method to calculate final marks from exam components
resultSchema.methods.calculateFinalMarks = function () {
  if (this.ica1Marks != null && this.ica2Marks != null &&
    this.ica3Marks != null && this.semesterExamMarks != null &&
    this.icaWeightage != null && this.semesterWeightage != null) {

    const avgICAMarks = (this.ica1Marks + this.ica2Marks + this.ica3Marks) / 3;
    this.finalMarks = (avgICAMarks * this.icaWeightage / 100) +
      (this.semesterExamMarks * this.semesterWeightage / 100);
    this.finalMarks = Math.round(this.finalMarks * 100) / 100;
    this.marks = this.finalMarks;

    const gradeInfo = calculateGrade(this.marks);
    this.grade = gradeInfo.grade;
    this.gradePoints = gradeInfo.points;
  }
  return this;
};

// Method to submit result to admin
resultSchema.methods.submitToAdmin = async function (userId) {
  this.submittedToAdmin = true;
  this.submittedForApproval = true;
  this.submittedAt = new Date();
  this.status = 'pending';
  this.approvalHistory.push({
    action: 'submitted',
    by: userId,
    at: new Date(),
    comment: 'Result sheet submitted to admin for approval'
  });
  return await this.save();
};

module.exports = mongoose.model('Result', resultSchema);
