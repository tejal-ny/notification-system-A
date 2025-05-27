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
// console.log('Initializing notification system...');
console.log(`Initializing notification system in ${process.env.NODE_ENV || 'development'} mode...`);


// Example function to demonstrate sending an email
// async function sendExampleEmail() {
//   try {
//     const result = await notificationSystem.send(
//       notificationSystem.types.EMAIL,
//       'user@example.com',
//       'This is the email body content.',
//       {
//         subject: 'Test Notification',
//         isHtml: false,
//         additionalOptions: {
//           // Any additional options for the email
//         }
//       }
//     );
    
//     console.log('Email sent successfully:', result);
//   } catch (error) {
//     console.error('Failed to send example email:', error);
//   }
// }
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
  
  // Example of sending an email notification
  notificationSystem.send(
    notificationSystem.types.EMAIL,
    'recipient@example.com',
    'This is the email body content.',
    {
      subject: 'Test Notification from Environment Variables',
    }
  ).then(result => {
    console.log('Notification sent successfully');
  }).catch(error => {
    console.error('Failed to send notification:', error);
  });
}