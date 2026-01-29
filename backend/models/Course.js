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
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type'
  },
  // Configurable weightages per course
  icaWeightage: {
    type: Number,
    enum: [30, 40],
    default: 40,
    required: true
  },
  semesterExamWeightage: {
    type: Number,
    enum: [60, 70],
    default: 60,
    required: true
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
courseSchema.methods.getEnrolledStudentsCount = async function () {
  const Result = mongoose.model('Result');
  return await Result.countDocuments({ courseId: this._id });
};

module.exports = mongoose.model('Course', courseSchema);