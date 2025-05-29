
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
const errorHandler = require('./error-handler');



/**
 * Validates an email address format
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if the email format is valid, false otherwise
 */
function isValidEmail(email) {
  if (!email) return false;
  
  // Basic email validation using regex
  // This checks for a pattern like name@domain.tld
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a phone number format
 * 
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if the phone number format is valid, false otherwise
 */
function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  
  // Remove spaces, dashes, parentheses for validation
  const cleaned = phoneNumber.replace(/\s+|-|\(|\)/g, '');
  
  // Basic phone validation - checks for a reasonable length and optional + prefix
  // This allows formats like: +1234567890, 1234567890, etc.
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validates a notification based on its type
 * 
 * @param {Object} notification - The notification object to validate
 * @returns {Object} - Validation result { isValid: boolean, error: string or null }
 */
function validateNotification(notification) {
  const { type, recipient, message } = notification;
  
  // Common validations for all notification types
  if (!type) {
    return { isValid: false, error: 'Notification type is required' };
  }
  
  if (!recipient) {
    return { isValid: false, error: 'Notification recipient is required' };
  }
  
  if (!message) {
    return { isValid: false, error: 'Notification message is required' };
  }
  
  if (message.length > 10000) {
    return { isValid: false, error: 'Message is too long (max 10,000 characters)' };
  }
  
  // Type-specific validations
  const normalizedType = type.toLowerCase();
  
  switch (normalizedType) {
    case 'email':
      if (!isValidEmail(recipient)) {
        return { 
          isValid: false, 
          error: `Invalid email address: ${recipient}`
        };
      }
      break;
    
    case 'sms':
      if (!isValidPhoneNumber(recipient)) {
        return { 
          isValid: false, 
          error: `Invalid phone number: ${recipient}. Expected format: +1234567890 or 1234567890`
        };
      }
      
      // Check SMS message length
      if (message.length > 160) {
        return { 
          isValid: false, 
          error: `SMS message exceeds maximum length of 160 characters (${message.length})`
        };
      }
      break;
    
    case 'push':
      // Validate push notification token/ID if needed
      if (typeof recipient !== 'string' || recipient.length < 5) {
        return { 
          isValid: false, 
          error: `Invalid device token/ID: ${recipient}`
        };
      }
      break;
    
    default:
      return { 
        isValid: false, 
        error: `Notification type '${type}' is not supported. Supported types are: ${Object.keys(notifications).join(', ')}`
      };
  }
  
  // All validations passed
  return { isValid: true, error: null };
}

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
  try {
    // Validate the notification object
    if (!notification) {
      return errorHandler.handleException(
        'dispatcher', 
        'unknown', 
        null, 
        'Notification object is required'
      );
    }
    
    const { type, recipient, message, options = {} } = notification;
    
    // Convert type to lowercase for case-insensitive comparison
    const normalizedType = type ? type.toLowerCase() : null;
    
    // Validate notification based on its type
    const validationResult = validateNotification(notification);
    
    if (!validationResult.isValid) {
      // Handle validation error through the error handler
      return errorHandler.handleException(
        normalizedType || 'dispatcher', 
        recipient || 'unknown', 
        message || null, 
        validationResult.error,
        { validationError: true }
      );
    }
    
    // Check if the notification type is supported
    if (!notifications[normalizedType]) {
      const error = `Notification type '${type}' is not supported. Supported types are: ${Object.keys(notifications).join(', ')}`;
      
      return errorHandler.handleException(
        'dispatcher',
        recipient,
        message,
        error,
        { unsupportedType: true }
      );
    }
    
    // Log the dispatch attempt
    console.log(`[DISPATCHER] Sending ${normalizedType} notification to: ${recipient}`);
    
    try {
      // Dispatch to the appropriate notification service
      const result = await notifications[normalizedType].send(recipient, message, options);
      
      // Add dispatch metadata to the result
      return {
        ...result,
        dispatched: true,
        dispatchTimestamp: new Date()
      };
    } catch (error) {
      // Handle service-specific errors through error handler
      return errorHandler.handleException(
        normalizedType,
        recipient,
        message,
        error,
        { options }
      );
    }
  } catch (unexpectedError) {
    // Catch any unexpected errors in the dispatcher itself
    return errorHandler.handleException(
      'dispatcher',
      notification?.recipient || 'unknown',
      notification?.message || null,
      unexpectedError,
      { unexpectedError: true }
    );
  }
}
/**
 * Utility function to check if a notification type is supported
 * 
 * @param {string} type - The notification type to check
 * @returns {boolean} - True if supported, false otherwise
 */
function isTypeSupported(type) {
  if (!type) return false;
  return Object.keys(notifications).includes(type.toLowerCase());
}

/**
 * Get a list of all supported notification types
 * 
 * @returns {string[]} - Array of supported notification types
 */
function getSupportedTypes() {
  return Object.keys(notifications);
}

/**
 * Get the error log contents
 * 
 * @param {number} [maxLines=100] - Maximum number of lines to return
 * @returns {string} - Error log contents
 */
function getErrorLog(maxLines = 100) {
  return errorHandler.getErrorLog(maxLines);
}

/**
 * Clear the error log (mainly for testing)
 */
function clearErrorLog() {
  errorHandler.clearErrorLog();
}

module.exports = {
  dispatchNotification,
  isTypeSupported,
  getSupportedTypes,
  validateNotification,
  isValidEmail,
  isValidPhoneNumber,
  getErrorLog,
  clearErrorLog
};