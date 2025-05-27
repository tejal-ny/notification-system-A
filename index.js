/**
 * Notification System - Main Entry Point
 *
 * This file serves as the main entry point for the notification system.
 * It imports and exports all notification channels from the notifications module.
 */

const notifications = require("./notifications");

// Example function to demonstrate usage
function sendNotification(type, recipient, message, options = {}) {
  if (!notifications[type]) {
    throw new Error(`Notification type '${type}' is not supported`);
  }

  return notifications[type].send(recipient, message, options);
}

// Export all notification methods
module.exports = {
  ...notifications,
  sendNotification,
};

// Example usage (if this file is run directly)
if (require.main === module) {
  console.log("Notification System initialized");
  console.log("Available notification types:", Object.keys(notifications));

  // You could add example calls here for testing purposes
}
