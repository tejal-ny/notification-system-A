/**
 * Main entry point for the notification system
 */

// Import required modules
const path = require('path');
const fs = require('fs');
const config = require('./config');
const notificationSystem = require('./notifications');
const { dispatcher,dispatchNotification } = require('./dispatcher');
const errorHandler = require('./error-handler');
const logger = require('./logger');
const trackNotification = require('./notificationTracker').trackNotification;

// Initialize the notification system
console.log(`Initializing notification system in ${process.env.NODE_ENV || 'development'} mode...`);

// Export all notification methods
module.exports = {
  dispatch: dispatcher?.dispatchNotification,
  isNotificationTypeSupported: dispatcher?.isTypeSupported,
  getSupportedNotificationTypes: dispatcher?.getSupportedTypes,
  
  // Expose validation utilities
  validateNotification: dispatcher?.validateNotification,
  isValidEmail: dispatcher?.isValidEmail,
  isValidPhoneNumber: dispatcher?.isValidPhoneNumber,
  
  // Expose error handling utilities
  getErrorLog: dispatcher?.getErrorLog,
  clearErrorLog: dispatcher?.clearErrorLog,
  
  // Expose logging utilities
  getNotificationLog: logger.getNotificationLog,
  clearNotificationLog: logger.clearNotificationLog,
  
  // If we need to expose utility modules directly
  errorHandler,
  logger
};


async function sendExampleNotifications() {
  try {
    // Email example
    console.log('\n1. Sending an email notification:');
    const emailResult = await notificationSystem.send(
      notificationSystem.types.EMAIL,
      'user@example.com',
      'This is a test of the notification system.',
      {
        subject: 'Test Notification'
      }
    );
    console.log('Email sent successfully:', emailResult);
    
    // SMS example
    console.log('\n2. Sending an SMS notification:');
    const smsResult = await notificationSystem.send(
      notificationSystem.types.SMS,
      '+12025551234', // Format: +[country code][area code][local number]
      'Your verification code is: 123456'
    );
    console.log('SMS sent successfully:', smsResult);
    
    // Invalid phone number example
    console.log('\n3. Attempting to send to invalid phone number:');
    await notificationSystem.send(
      notificationSystem.types.SMS,
      '555-123-4567', // Invalid format (missing country code)
      'This message should not be sent.'
    );
  } catch (error) {
    console.error('Error caught:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// If this file is run directly, start the notification service
if (require.main === module) {
  const result = trackNotification({
    notificationId: 1717636799123,
    userId: "user123",
    channel: "email",
    message: "Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message Welcome message ",
    recipient: "tejal@example.com",
    // timestamp: "2025-06-03T21:30:00Z",
    status: "sent",
    metadata: {
      orderId: "order123",
      priority: "high"
    }
  });
}
