// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'staff'],
    required: true,
    default: 'student'
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  studentId: {
    type: String,
    sparse: true, // Allows null for non-students
    unique: true
  },
  staffId: {
    type: String,
    sparse: true, // Allows null for non-staff
    unique: true
  },
  department: {
    type: String
  },
  phone: {
    type: String
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    resultPublished: { type: Boolean, default: true },
    systemAnnouncements: { type: Boolean, default: true }
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

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ staffId: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetExpires;
  return obj;
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function (username, password) {
  // Normalize input and perform case-insensitive lookup so users can
  // login using email or username regardless of casing or surrounding spaces.
  const identifier = String(username || '').trim();

  // Escape regex special chars for username search
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const query = {
    $or: [
      { username: new RegExp(`^${escapeRegExp(identifier)}$`, 'i') },
      { email: new RegExp(`^${escapeRegExp(identifier)}$`, 'i') }
    ],
    isActive: true
  };

  const user = await this.findOne(query).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

// Update last login
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);


