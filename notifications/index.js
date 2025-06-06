/**
 * Notification system module
 */

// Import notification modules
const emailNotifier = require('./emails');
const smsNotifier = require('./sms');

// Define supported notification types
const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook'
};

// Store notification handlers
const notificationHandlers = {
  [NOTIFICATION_TYPES.EMAIL]: emailNotifier.sendEmail,
  [NOTIFICATION_TYPES.SMS]: smsNotifier.sendSms
  // Other handlers will be added as implemented
};

// Notification system core functionality
const notificationSystem = {
  // Send a notification
  send: async (type, recipient, message, options = {}) => {
    console.log(`Sending ${type} notification to ${recipient}`);
    
   if (!notificationHandlers[type]) {
      const error = new Error(`Notification type '${type}' not supported`);
      error.code = 'UNSUPPORTED_TYPE';
      return Promise.reject(error);
    }
     try {
      // For email notifications, use subject and message format
      if (type === NOTIFICATION_TYPES.EMAIL) {
        return await notificationHandlers[type](
          recipient, 
          options.subject || 'Notification', 
          message, 
          options
        );
      }
      
      // For other notification types (SMS, push, webhook)
      return await notificationHandlers[type](recipient, message, options);
    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error.message);
      throw error; // Re-throw for caller to handle
    }
    try {
      // For email type, we expect different parameters
      if (type === NOTIFICATION_TYPES.EMAIL) {
        const subject = options.subject || 'Notification';
        return await handlers[type](recipient, subject, message, options);
      }
      
      // Default handler call for other notification types
      return await handlers[type](recipient, message, options);
    } catch (error) {
      console.error(`Failed to send ${type} notification:`, error);
      throw error;
    }
  },
  
  // Register notification handler
  registerHandler: (type, handler) => {
    console.log(`Registering handler for ${type} notifications`);
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    handlers[type] = handler;
    return true;
  },
  
  // Get available notification types
  getTypes: () => {
    return Object.values(NOTIFICATION_TYPES);
  },
  
  // Check if a notification type is supported
  isSupported: (type) => {
    return !!handlers[type];
  }
};

// Export notification types and system
module.exports = {
  types: NOTIFICATION_TYPES,
  ...notificationSystem
};
