/**
 * Email Notification Module
 *
 * This module provides functionality for sending email notifications.
 */

/**
 * Send an email notification
 * @param {string} recipient - Email address of the recipient
 * @param {string} message - The message to be sent
 * @param {Object} options - Additional options for the email
 * @returns {Promise<Object>} - Promise resolving to the result of the operation
 */
function send(recipient, message, options = {}) {
  // In a real implementation, this would use an email service/library
  console.log(`[EMAIL] To: ${recipient} | Message: ${message}`);
  console.log(`[EMAIL] Options:`, options);

  // Return a promise to simulate async operation
  return Promise.resolve({
    type: "email",
    recipient,
    message,
    timestamp: new Date(),
    status: "sent",
  });
}

module.exports = {
  send,
};
