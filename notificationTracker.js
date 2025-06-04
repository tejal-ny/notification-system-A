/**
 * Notification tracking utility
 * 
 * This module provides functionality for tracking notification events
 * across different channels.
 */

/**
 * Track a notification event
 * 
 * @param {Object} notificationData - The notification data to track
 * @param {string} notificationData.userId - The ID of the user receiving the notification
 * @param {string} notificationData.channel - The channel the notification was sent on (e.g., 'email', 'sms')
 * @param {string} notificationData.message - The message content or a reference to it
 * @param {string|number} notificationData.timestamp - The timestamp when the notification was sent
 * @returns {void}
 */
function trackNotification({ userId, channel, message, timestamp }) {
    console.log({ userId, channel, message, timestamp });
  }
  
  module.exports = { trackNotification };