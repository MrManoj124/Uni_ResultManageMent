// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientRole: {
    type: String,
    enum: ['admin', 'student', 'staff', 'all'],
    required: true
  },
  type: {
    type: String,
    enum: [
      'result_published',
      'result_updated',
      'course_added',
      'course_updated',
      'system_announcement',
      'account_created',
      'password_reset',
      'email_verification',
      'deadline_reminder',
      'grade_appeal',
      'custom'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Additional data related to notification
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    push: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  status: {
    sent: {
      type: Boolean,
      default: false
    },
    delivered: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    deliveredAt: Date,
    readAt: Date
  },
  actionUrl: {
    type: String // Link to relevant page
  },
  actionText: {
    type: String,
    default: 'View Details'
  },
  expiresAt: {
    type: Date
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    deviceType: String,
    ipAddress: String,
    userAgent: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ 'status.read': 1 });
notificationSchema.index({ expiresAt: 1 });

// TTL index - automatically delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.status.read = true;
  this.status.readAt = new Date();
  return this.save();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function () {
  this.status.delivered = true;
  this.status.deliveredAt = new Date();
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function () {
  this.status.sent = true;
  this.status.sentAt = new Date();
  return this.save();
};

// Static method to create result published notification
notificationSchema.statics.createResultNotification = async function (studentId, resultData) {
  const User = mongoose.model('User');
  const user = await User.findOne({ studentId });

  if (!user) return null;

  return this.create({
    recipient: user._id,
    recipientRole: 'student',
    type: 'result_published',
    title: 'New Result Published',
    message: `Your result for ${resultData.courseName} has been published. Grade: ${resultData.grade}`,
    data: resultData,
    priority: 'high',
    channels: {
      push: true,
      email: true,
      inApp: true
    },
    actionUrl: `/student/results/${resultData.resultId}`,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
};

// Static method to create bulk notifications
notificationSchema.statics.createBulkNotifications = async function (recipients, notificationData) {
  const notifications = recipients.map(recipientId => ({
    ...notificationData,
    recipient: recipientId,
    createdAt: new Date()
  }));

  return this.insertMany(notifications);
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    recipient: userId,
    'status.read': false
  });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function (userId) {
  return this.updateMany(
    { recipient: userId, 'status.read': false },
    {
      $set: {
        'status.read': true,
        'status.readAt': new Date()
      }
    }
  );
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = function (userId, page = 1, limit = 20) {
  return this.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

// Static method to delete old notifications
notificationSchema.statics.deleteOldNotifications = function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    'status.read': true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);