// backend/models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    required: [true, 'Staff ID is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    title: {
      type: String,
      enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'],
      default: 'Mr.'
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
  designation: {
    type: String,
    required: true,
    enum: [
      'Lecturer',
      'Senior Lecturer',
      'Professor',
      'Assistant Professor',
      'Teaching Assistant',
      'Lab Instructor',
      'Administrative Staff',
      'Other'
    ]
  },
  qualifications: [{
    degree: String,
    field: String,
    institution: String,
    year: Number
  }],
  specialization: [String],
  phone: {
    office: String,
    mobile: {
      type: String,
      match: [/^\+?\d{10,15}$/, 'Please provide a valid phone number']
    }
  },
  officeLocation: {
    building: String,
    room: String,
    floor: String
  },
  workingHours: {
    days: [String],
    startTime: String,
    endTime: String
  },
  responsibilities: [{
    type: String,
    enum: [
      'Teaching',
      'Research',
      'Administration',
      'Result Management',
      'Course Coordination',
      'Student Advising',
      'Examination',
      'Other'
    ]
  }],
  permissions: {
    canUploadResults: {
      type: Boolean,
      default: true
    },
    canEditResults: {
      type: Boolean,
      default: true
    },
    canPublishResults: {
      type: Boolean,
      default: false // Only admin can publish by default
    },
    canViewAllResults: {
      type: Boolean,
      default: true
    },
    canManageStudents: {
      type: Boolean,
      default: false
    },
    canManageCourses: {
      type: Boolean,
      default: false
    }
  },
  assignedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  assignedTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Type'
  }],
  advisingStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  employmentStatus: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Visiting', 'Retired'],
    default: 'Full-time'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  researchInterests: [String],
  publications: [{
    title: String,
    year: Number,
    journal: String,
    url: String
  }],
  awards: [{
    title: String,
    year: Number,
    organization: String
  }],
  socialLinks: {
    linkedIn: String,
    researchGate: String,
    googleScholar: String,
    website: String
  },
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
staffSchema.index({ staffId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ designation: 1 });
staffSchema.index({ isActive: 1 });

// Virtual for full name with title
staffSchema.virtual('fullNameWithTitle').get(function () {
  return `${this.name.title} ${this.name.firstName} ${this.name.lastName}`;
});

// Pre-save middleware
staffSchema.pre('save', async function () {
  if (this.name.firstName && this.name.lastName) {
    this.name.fullName = `${this.name.firstName} ${this.name.lastName}`;
  }
});

// Method to get assigned courses
staffSchema.methods.getAssignedCourses = async function () {
  await this.populate('assignedCourses');
  return this.assignedCourses;
};

// Method to get advising students
staffSchema.methods.getAdvisingStudents = async function () {
  await this.populate('advisingStudents');
  return this.advisingStudents;
};

// Method to check if staff can perform action
staffSchema.methods.canPerformAction = function (action) {
  const permissionMap = {
    'uploadResults': this.permissions.canUploadResults,
    'editResults': this.permissions.canEditResults,
    'publishResults': this.permissions.canPublishResults,
    'viewAllResults': this.permissions.canViewAllResults,
    'manageStudents': this.permissions.canManageStudents,
    'manageCourses': this.permissions.canManageCourses
  };

  return permissionMap[action] || false;
};

// Static method to find staff by department
staffSchema.statics.findByDepartment = function (department) {
  return this.find({ department, isActive: true });
};

// Static method to find staff by designation
staffSchema.statics.findByDesignation = function (designation) {
  return this.find({ designation, isActive: true });
};

module.exports = mongoose.model('Staff', staffSchema);