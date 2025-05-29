/**
 * Notification Logging Examples
 * 
 * This file demonstrates the use of the notification logging functionality.
 * Run this file directly to see examples in action:
 * 
 * node examples/logging-examples.js
 */

// Load environment variables
require('dotenv').config();

// Import the notification system
const notifier = require('../index');
const logger = require('../logger');

/**
 * Example 1: Logging notifications across different channels
 */
async function multiChannelLoggingExample() {
  // Clear the notification log for demonstration purposes
  logger.clearNotificationLog();
  
  console.log('\n------ Multi-Channel Notifications Logging ------');
  console.log('Notice how each notification is logged with consistent formatting');
  
  // Send an email notification
  console.log('\nSending email notification...');
  await notifier.dispatch({
    type: 'email',
    recipient: 'user@example.com',
    message: 'Welcome to our service! This is an example email notification.',
    options: {
      subject: 'Welcome to Our Service'
    }
  });
  
  // Add a small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Send an SMS notification
  console.log('\nSending SMS notification...');
  await notifier.dispatch({
    type: 'sms',
    recipient: '+15551234567',
    message: 'Your verification code is 123456'
  });
  
  // Add a small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Send a push notification
  console.log('\nSending push notification...');
  await notifier.dispatch({
    type: 'push',
    recipient: 'device-token-123',
    message: 'You have a new message waiting',
    options: {
      platform: 'ios',
      appVersion: '2.1.0'
    }
  });
}

/**
 * Example 2: Demonstrating mock mode logging
 */
async function mockModeExample() {
  console.log('\n\n------ Mock Mode Notification Logging ------');
  console.log('Notice the "MOCK" indicator for simulated notifications');
  
  // Send a mock email
  console.log('\nSending mock email...');
  await notifier.dispatch({
    type: 'email',
    recipient: 'user@example.com',
    message: 'This is a simulated email that will not actually be sent',
    options: {
      mockMode: true,
      subject: 'Test Email'
    }
  });
  
  // Add a small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Send a mock SMS
  console.log('\nSending mock SMS...');
  await notifier.dispatch({
    type: 'sms',
    recipient: '+15551234567',
    message: 'This is a simulated SMS that will not actually be sent',
    options: {
      mockMode: true
    }
  });
  
  // Add a small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Send a mock push notification
  console.log('\nSending mock push notification...');
  await notifier.dispatch({
    type: 'push',
    recipient: 'device-token-456',
    message: 'This is a simulated push notification',
    options: {
      mockMode: true,
      platform: 'android',
      appVersion: '3.0.0'
    }
  });
}

/**
 * Example 3: Demonstrating error logging
 */
async function errorLoggingExample() {
  console.log('\n\n------ Error Notification Logging ------');
  console.log('Notice how errors are clearly indicated in the logs');
  
  // Send an email that will fail
  console.log('\nSending email that will fail...');
  await notifier.dispatch({
    type: 'email',
    recipient: 'error@example.com', // This will trigger an error
    message: 'This email will fail and be logged as an error'
  });
  
  // Add a small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Send an SMS that will fail
  console.log('\nSending SMS that will fail...');
  await notifier.dispatch({
    type: 'sms',
    recipient: '+1error4567890', // This will trigger an error
    message: 'This SMS will fail and be logged as an error'
  });
}

/**
 * Example 4: Retrieving notification logs
 */
async function retrieveLogsExample() {
  console.log('\n\n------ Retrieving Notification Logs ------');
  
  // Get the notification logs
  const notificationLogs = logger.getNotificationLog();
  
  console.log('\nRetrieved notification log entries:');
  console.log(`Found ${notificationLogs.length} log entries`);
  
  // Print a summary of the log entries
  console.log('\nLog summary:');
  const typeCounts = {};
  const statusCounts = {};
  const mockCount = notificationLogs.filter(entry => {
    // Parse the JSON
    const log = typeof entry === 'string' ? JSON.parse(entry) : entry;
    
    // Count by type
    typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    
    // Count by status
    statusCounts[log.status] = (statusCounts[log.status] || 0) + 1;
    
    // Return if it's a mock
    return log.mock === true;
  }).length;
  
  console.log('Notification types:', typeCounts);
  console.log('Status distribution:', statusCounts);
  console.log('Mock notifications:', mockCount);
}

/**
 * Run all examples in sequence
 */
async function runAllExamples() {
  try {
    console.log('Running notification logging examples...');
    
    await multiChannelLoggingExample();
    await mockModeExample();
    await errorLoggingExample();
    await retrieveLogsExample();
    
    console.log('\n\nAll logging examples completed successfully.');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  multiChannelLoggingExample,
  mockModeExample,
  errorLoggingExample,
  retrieveLogsExample,
  runAllExamples
};
