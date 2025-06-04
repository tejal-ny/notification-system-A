/**
 * Notification tracking utility
 * 
 * This module provides functionality for tracking notification events
 * across different channels and storing them to a file.
 */

const fs = require('fs');
const path = require('path');

// Define the file path for storing notifications
const NOTIFICATION_FILE = 'sent_notifications.json';

/**
 * Track a notification event
 * 
 * This function logs notification data to the console and writes it to a file.
 * If the file doesn't exist, it creates it with an initial empty array.
 * Each notification is assigned a unique notificationId based on the current timestamp.
 * If timestamp is not provided, it automatically generates one.
 * 
 * @param {Object} notificationData - The notification data to track
 * @param {string} notificationData.userId - The ID of the user receiving the notification
 * @param {string} notificationData.channel - The channel the notification was sent on (e.g., 'email', 'sms')
 * @param {string} notificationData.message - The message content or a reference to it
 * @param {string} notificationData.recipient - The contact detail the message was sent to (e.g., email address, phone number)
 * @param {string} notificationData.status - The status of the notification ('sent' or 'failed')
 * @param {string|number} [notificationData.timestamp] - The timestamp when the notification was sent (optional, generated if not provided)
 * @param {Object} [notificationData.metadata] - Optional object containing additional key-value pairs (e.g., orderId, priority)
 * @returns {void}
 */
function trackNotification({ userId, channel, message, recipient, status, timestamp, metadata }) {
    // Generate a unique notification ID using current timestamp
  const notificationId = Date.now();
  
  // Use provided timestamp or generate one if not provided
  const notificationTimestamp = timestamp || new Date().toISOString();
  
  // Check if message exceeds character limit and needs truncation
  const MESSAGE_CHAR_LIMIT = 100;
  let truncated = false;
  let processedMessage = message;
  
  if (message && message.length > MESSAGE_CHAR_LIMIT) {
    processedMessage = message.substring(0, MESSAGE_CHAR_LIMIT);
    truncated = true;
  }
  
  // Create the complete notification object with ID and status
  const notification = {
    notificationId,
    userId,
    channel,
    message: processedMessage,
    recipient, // The contact detail the message was sent to
    status, // This should be either 'sent' or 'failed'
    timestamp: notificationTimestamp
  };
  
  // Add truncation indicator if message was shortened
  if (truncated) {
    notification.truncated = true;
  }
  
  // Add metadata if provided
  if (metadata && typeof metadata === 'object') {
    notification.metadata = metadata;
  }
    
    // Log to console for debugging
  console.log(notification);
  
  // Store the notification in the file, with robust error handling
  try {
    let notifications = [];
    
    // File operations wrapped in try/catch
    try {
      // Check if file exists
      if (fs.existsSync(NOTIFICATION_FILE)) {
        // Read existing notifications
        const fileContent = fs.readFileSync(NOTIFICATION_FILE, 'utf8');
        // Parse the file content (potential JSON parse error)
        notifications = JSON.parse(fileContent);
        
        // Validate that we got an array
        if (!Array.isArray(notifications)) {
          console.error('Error: notification file does not contain an array');
          notifications = []; // Reset to empty array
        }
      }
      
      // Add new notification
      notifications.push(notification);

      // Limit to the most recent 100 notifications
      const MAX_NOTIFICATIONS = 3;
      if (notifications.length > MAX_NOTIFICATIONS) {
        // Remove oldest entries (from the beginning of the array)
        const excessEntries = notifications.length - MAX_NOTIFICATIONS;
        notifications = notifications.slice(excessEntries);
        console.log(`Trimmed ${excessEntries} oldest notification(s) to maintain the 3 entry limit`);
      }
      
      // Write back to file
      fs.writeFileSync(NOTIFICATION_FILE, JSON.stringify(notifications, null, 2), 'utf8');
    } catch (fileError) {
      // Handle specific file operation errors
      if (fileError instanceof SyntaxError) {
        console.error('Error parsing notification file JSON:', fileError);
      } else {
        console.error('Error accessing or writing to notification file:', fileError);
      }
      // Continue execution without throwing
    }
  } catch (error) {
    // Catch any other unexpected errors
    console.error('Unexpected error during notification storage:', error);
    // Function continues execution
  }
  }

module.exports = { trackNotification };
