/**
 * Push Notification Module
 * 
 * This module provides functionality for sending push notifications.
 */
// const errorHandler = require('../error-handler');
const { withErrorHandling } = require('../error-handler');

/**
 * Send a push notification
 * @param {string} recipient - Device token or user identifier
 * @param {string} message - The message to be sent
 * @param {Object} options - Additional options for the push notification
 * @returns {Promise<Object>} - Promise resolving to the result of the operation
 */
async function sendPush(recipient, message, options = {}) {
  try {
    // Simulate error for testing (if requested)
    if (recipient.includes('error') || (options.simulateError === true)) {
      throw new Error('Simulated push notification failure');
    }
    
    // In a real implementation, this would use a push notification service
    console.log(`[PUSH] To: ${recipient} | Message: ${message}`);
    console.log(`[PUSH] Options:`, options);
    
    // Simulate a delay that might happen with real push notifications
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    
    // Return a response like a real push notification API might
    return {
      type: 'push',
      recipient,
      message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
      messageId: `push-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      status: 'sent',
      deviceInfo: {
        platform: options.platform || 'unknown',
        appVersion: options.appVersion || 'unknown'
      }
    };
  } catch (error) {
    // Let the error propagate to be handled by the error handler wrapper
    throw error;
  }
}

// Apply centralized error handling wrapper
// const send = errorHandler.withErrorHandling(sendPush, 'push');
const send = withErrorHandling(sendPush, 'push');
module.exports = {
  send,
  // Also export the unwrapped function for testing or direct use
  sendPush
};