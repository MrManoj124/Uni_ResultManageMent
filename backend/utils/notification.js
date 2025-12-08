const Notification = require('../models/Notification');
const { sendEmail } = require('./email');

exports.sendNotification = async (notificationData) => {
  try {
    // Create notification in database
    const notification = await Notification.create(notificationData);

    // Send email if enabled
    if (notificationData.channels && notificationData.channels.email) {
      await sendEmail({
        to: notificationData.recipientEmail,
        subject: notificationData.title,
        template: 'notification',
        data: {
          title: notificationData.title,
          message: notificationData.message,
          actionUrl: notificationData.actionUrl
        }
      });
    }

    // Send push notification if enabled
    if (notificationData.channels && notificationData.channels.push) {
      // Implement Firebase Cloud Messaging here
      await sendPushNotification(notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

exports.sendBulkNotifications = async (recipients, notificationData) => {
  const notifications = recipients.map(recipient => ({
    ...notificationData,
    recipient: recipient._id,
    recipientEmail: recipient.email
  }));

  return await Promise.allSettled(
    notifications.map(n => this.sendNotification(n))
  );
};

// Firebase push notification helper
const sendPushNotification = async (notification) => {
  // Implement Firebase Admin SDK push notification
  // This is a placeholder - implement based on your Firebase setup
  console.log('Push notification sent:', notification.title);
};