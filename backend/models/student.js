// backend/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    match: [/^\d{4}\/[A-Z]+\/\d+$/, 'Student ID format: YYYY/DEPT/XX']
  },
  indexNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  typeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type'
  },
  faculty: {
    type: String,
    enum: [
      'Business',
      'Technology',
      'Applied Science'
    ]
  },
  department: {
    type: String,
    enum: [
      'Banking Insurance',
      'Business Management',
      'Project Management',
      'Engineering',
      'Computer Engineering',
      'Bio-Science',
      'Physical Science',
      'Information and Communication Technology',
      'Applied Mathematical and Computer Science'
    ]
  },
  name: {
    firstName: {
      type: String,
      required: [true, 'First name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required']
    },
    fullName: String
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  program: {
    type: String,
    required: [true, 'Program is required'],
    enum: [
      // Business Programs
      'BSc Banking Insurance',
      'BSc Business Management',
      'BSc Project Management',
      // Technology Programs
      'BEng Engineering',
      'BEng Computer Engineering',
      // Applied Science Programs
      'BSc Bio-Science',
      'BSc Physical Science',
      'BSc IT',
      'BSc Computer Science',
      'Other'
    ]
  },
  batch: {
    type: String,
    required: true
  },
  enrollmentYear: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 1
  },
  currentSemester: {
    type: Number,
    default: 1,
    min: 1,
    max: 8
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Sri Lanka'
    }
  },
  phone: {
    primary: {
      type: String,
      match: [/^\+?\d{10,15}$/, 'Please provide a valid phone number']
    },
    emergency: String
  },
  guardian: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  academicInfo: {
    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff'
    },
    currentGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    },
    cumulativeGPA: {
      type: Number,
      default: 0,
      min: 0,
      max: 4
    },
    totalCreditsEarned: {
      type: Number,
      default: 0
    },
    totalCreditsAttempted: {
      type: Number,
      default: 0
    },
    academicStanding: {
      type: String,
      enum: ['Good Standing', 'Academic Probation', 'Academic Suspension', 'Honors'],
      default: 'Good Standing'
    }
  },
  enrollment: {
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Suspended', 'Withdrawn'],
      default: 'Active'
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    expectedGraduation: Date,
    actualGraduation: Date
  },
  documents: [{
    type: {
      type: String,
      enum: ['ID', 'Certificate', 'Transcript', 'Other']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
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
studentSchema.index({ studentId: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ program: 1, batch: 1 });
studentSchema.index({ 'enrollment.status': 1 });


// Virtual for full name
studentSchema.virtual('fullName').get(function () {
  return `${this.name.firstName} ${this.name.lastName}`;
});

// Pre-save middleware
studentSchema.pre('save', async function () {
  if (this.name.firstName && this.name.lastName) {
    this.name.fullName = `${this.name.firstName} ${this.name.lastName}`;
  }
});

// Method to calculate GPA
studentSchema.methods.calculateGPA = async function () {
  const Result = mongoose.model('Result');
  const results = await Result.find({
    studentId: this.studentId,
    status: 'published'
  }).populate('courseId');

  if (results.length === 0) {
    return { currentGPA: 0, cumulativeGPA: 0, totalCredits: 0 };
  }

  let totalPoints = 0;
  let totalCredits = 0;

  results.forEach(result => {
    if (result.courseId) {
      totalPoints += result.gradePoints * result.courseId.credits;
      totalCredits += result.courseId.credits;
    }
  });

  const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;

  this.academicInfo.currentGPA = parseFloat(gpa.toFixed(2));
  this.academicInfo.cumulativeGPA = parseFloat(gpa.toFixed(2));
  this.academicInfo.totalCreditsEarned = totalCredits;
  this.academicInfo.totalCreditsAttempted = totalCredits;

  await this.save();

  return {
    currentGPA: this.academicInfo.currentGPA,
    cumulativeGPA: this.academicInfo.cumulativeGPA,
    totalCredits
  };
};

// Method to get student results summary
studentSchema.methods.getResultsSummary = async function () {
  const Result = mongoose.model('Result');
  const results = await Result.find({
    studentId: this.studentId,
    status: 'published'
  }).populate('courseId');

  const summary = {
    totalCourses: results.length,
    passedCourses: results.filter(r => r.grade !== 'F').length,
    failedCourses: results.filter(r => r.grade === 'F').length,
    gpa: this.academicInfo.currentGPA,
    gradeDistribution: {}
  };

  results.forEach(result => {
    const grade = result.grade;
    summary.gradeDistribution[grade] = (summary.gradeDistribution[grade] || 0) + 1;
  });

  return summary;
};

module.exports = mongoose.model('Student', studentSchema);