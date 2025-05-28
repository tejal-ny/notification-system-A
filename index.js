/**
 * Main entry point for the notification system
 */

// Import required modules
const path = require('path');
const fs = require('fs');
const config = require('./config');
const notificationSystem = require('./notifications');


// Example function to demonstrate usage
function sendNotification(type, recipient, message, options = {}) {
  if (!notifications[type]) {
    throw new Error(`Notification type '${type}' is not supported`);
  }
  
  return notifications[type].send(recipient, message, options);
}

// Initialize the notification system
console.log(`Initializing notification system in ${process.env.NODE_ENV || 'development'} mode...`);

// Export all notification methods
module.exports = {
  // ...notifications,
  sendNotification
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
  console.log('Starting notification service with examples...');
  sendExampleNotifications()
   console.log('Notification System initialized');
  // console.log('Available notification types:', Object.keys(notifications));
  // Display configuration status
  // if (config.environment.isDevelopment) {
  //   console.log('Running in development mode');

  //   if (!config.email.host || !config.email.auth.user) {
  //     console.log('Email configuration incomplete - using mock service');
  //   } else {
  //     console.log('Email configured with:', config.email.host);
  //   }
  // }

  // Example: Valid email
  notificationSystem.send(
    notificationSystem.types.EMAIL,
    'recipient@example.com',
    'This is the email body content.',
    {
      subject: 'Test Notification from Environment Variables',
      from: 'sender@example.com'
    }
  ).then(result => {
    console.log('Notification sent successfully:', result);
  }).catch(error => {
    console.error('Failed to send notification:', error);
  });

  // Example: Invalid email format
  notificationSystem.send(
    notificationSystem.types.EMAIL,
    'invalid-email',
    'This email should not be sent due to invalid recipient.',
    { subject: 'Invalid Email Test' }
  ).then(result => {
    if (!result.success) {
      console.log('As expected, validation failed:', result.message);
    } else {
      console.log('Unexpected success with invalid email');
    }
  }).catch(error => {
    console.log('Validation caught the error:', error.message);
  });

  // Example: Empty subject
  notificationSystem.send(
    notificationSystem.types.EMAIL,
    'recipient@example.com',
    'Email with empty subject',
    { subject: '' }
  ).then(result => {
    if (!result.success) {
      console.log('Subject validation failed as expected:', result.message);
    } else {
      console.log('Result:', result);
    }
  }).catch(error => {
    console.log('Subject validation error:', error.message);
  });
}
