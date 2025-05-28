/**
 * Main entry point for the notification system
 */

// Import required modules
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Import notification modules
const notificationSystem = require('./notifications');

// Initialize the notification system
console.log(`Initializing notification system in ${process.env.NODE_ENV || 'development'} mode...`);

// Export notification functionality for use in other modules
module.exports = notificationSystem;

// If this file is run directly, start the notification service
if (require.main === module) {
  console.log('Starting notification service...');

  // Display configuration status
  if (config.environment.isDevelopment) {
    console.log('Running in development mode');

    if (!config.email.host || !config.email.auth.user) {
      console.log('Email configuration incomplete - using mock service');
    } else {
      console.log('Email configured with:', config.email.host);
    }
  }

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
