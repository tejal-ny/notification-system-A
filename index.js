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
const initializeNewUserWithAllEnabled = require('./userPreferences').initializeNewUserWithAllEnabled;
const updateExistingUserPreferences = require('./userPreferences').updateExistingUserPreferences;
const getUserPreferences = require('./userPreferences').getUserPreferences;
const initializeUserPreferences = require('./userPreferences').initializeUserPreferences;
const toggleChannelPreference = require('./userPreferences').toggleChannelPreference;
const getUsersOptedInToChannel = require('./userPreferences').getUsersOptedInToChannel;
const getUsersByLanguage = require('./userPreferences').getUsersByLanguage;
// const renderTemplate = require('./notificationTemplates').renderTemplate;
const notificationTemplates = require('./notificationTemplates').notificationTemplates;
const renderTemplateByLanguage = require('./notificationTemplates').renderTemplateByLanguage;
const templateManager = require('./templateManager');
const getTemplate = require('./templateUtils').getTemplate;
const renderTemplate = require('./templateUtils').renderTemplate;
const getTemplatesByType = require('./templateUtils').getTemplatesByType;
const getTemplatesByLanguage = require('./templateUtils').getTemplatesByLanguage;
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
 sendNotification,
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
  const allSpanishTemplates = getTemplatesByLanguage('es');
console.log('Spanish templates available:', allSpanishTemplates);

  // getUsersByLanguage('en')
  // getUsersOptedInToChannel('email')
  // toggleChannelPreference('tejal1@example.com');
  // initializeUserPreferences(['tejal1@example.com', 'tejal2@example.com'])
  // getUserPreferences('tejal3@example.com')
  // updateExistingUserPreferences("tejal@example.com", {
  //   emailEnabled: false,
  //   smsEnabled: true
  // });
  //  console.log('Notification System initialized');
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
 
  // Example of using the new dispatcher
  // console.log('\nExample: Using the notification dispatcher');

    // Example: Email notification
  // dispatchNotification({
  //   type: 'email',
  //   recipient: 'example@example.com',
  //   message: 'Hello from the notification dispatcher!',
  //   options: {
  //     subject: 'Test Email'
  //   }
  // }).then(result => {
  //   console.log('Email dispatch result:', result);
  // }).catch(error => {
  //   console.error('Email dispatch error:', error.message);
  // });

  // Example: SMS notification
  // setTimeout(() => {
  //   dispatchNotification({
  //     type: 'sms',
  //     recipient: '+15551234567',
  //     message: 'Your verification code is 123456',
  //   }).then(result => {
  //     console.log('SMS dispatch result:', result);
  //   }).catch(error => {
  //     console.error('SMS dispatch error:', error.message);
  //   });
  // }, 1000);
  
  // Example: Unsupported notification type
  // setTimeout(() => {
  //   dispatchNotification({
  //     type: 'invalid_type',
  //     recipient: 'recipient',
  //     message: 'This should fail gracefully',
  //   }).then(result => {
  //     console.log('Invalid type result:', result);
  //   }).catch(error => {
  //     console.error('Invalid type properly handled:', error.message);
  //   });
  // }, 2000);
  // Example: Valid email
  // notificationSystem.send(
  //   notificationSystem.types.EMAIL,
  //   'recipient@example.com',
  //   'This is the email body content.',
  //   {
  //     subject: 'Test Notification from Environment Variables',
  //     from: 'sender@example.com'
  //   }
  // ).then(result => {
  //   console.log('Notification sent successfully:', result);
  // }).catch(error => {
  //   console.error('Failed to send notification:', error);
  // });

  // Example: Invalid email format
  // notificationSystem.send(
  //   notificationSystem.types.EMAIL,
  //   'invalid-email',
  //   'This email should not be sent due to invalid recipient.',
  //   { subject: 'Invalid Email Test' }
  // ).then(result => {
  //   if (!result.success) {
  //     console.log('As expected, validation failed:', result.message);
  //   } else {
  //     console.log('Unexpected success with invalid email');
  //   }
  // }).catch(error => {
  //   console.log('Validation caught the error:', error.message);
  // });

  // // Example: Empty subject
  // notificationSystem.send(
  //   notificationSystem.types.EMAIL,
  //   'recipient@example.com',
  //   'Email with empty subject',
  //   { subject: '' }
  // ).then(result => {
  //   if (!result.success) {
  //     console.log('Subject validation failed as expected:', result.message);
  //   } else {
  //     console.log('Result:', result);
  //   }
  // }).catch(error => {
  //   console.log('Subject validation error:', error.message);
  // });
}
