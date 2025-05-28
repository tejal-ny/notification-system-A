
/**
 * Notification Dispatcher
 * 
 * This module provides a dispatcher function that routes notifications
 * based on their type to the appropriate notification service.
 */

// Load environment variables from .env file
require('dotenv').config();

// Import notification channels
const notifications = require('./notifications');

/**
 * Dispatches notifications based on their type to the appropriate service
 * 
 * @param {Object} notification - Notification object to be dispatched
 * @param {string} notification.type - Type of notification (email, sms)
 * @param {string} notification.recipient - Recipient of the notification
 * @param {string} notification.message - Content of the notification
 * @param {Object} [notification.options={}] - Additional options for the notification
 * @returns {Promise<Object>} - Promise resolving to the result of the operation
 * @throws {Error} - If the notification type is unsupported or required fields are missing
 */
async function dispatchNotification(notification) {
  // Validate notification object
  if (!notification) {
    throw new Error('Notification object is required');
  }
  
  const { type, recipient, message, options = {} } = notification;
  
  // Check required fields
  if (!type) {
    throw new Error('Notification type is required');
  }
  
  if (!recipient) {
    throw new Error('Notification recipient is required');
  }
  
  if (!message) {
    throw new Error('Notification message is required');
  }
  
  // Convert type to lowercase for case-insensitive comparison
  const normalizedType = type.toLowerCase();
  
  // Check if notification type is supported
  if (!notifications[normalizedType]) {
    console.error(`Notification type '${type}' is not supported. Supported types: ${Object.keys(notifications).join(', ')}`);
    throw new Error(`Notification type '${type}' is not supported`);
  }
  
  // Dispatch to the appropriate notification service
  try {
    console.log(`Dispatching ${normalizedType} notification to ${recipient}`);
    return await notifications[normalizedType].send(recipient, message, options);
  } catch (error) {
    console.error(`Failed to dispatch ${normalizedType} notification:`, error.message);
    throw error;
  }
}

module.exports = {
  dispatchNotification
};
