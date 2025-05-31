/**
 * notificationController.js
 * 
 * Controller for handling user notifications based on user preferences
 * and routing to appropriate notification channels.
 */

// Import notification services
const emailService = require('../notifications/emails');
const smsService = require('../notifications/sms');
// const errorHandler = require('../utils/error-handler');
const logger = require('../logger');

// Create a typed logger for the notification controller
// const controllerLogger = logger.createTypedLogger('notification-controller');

/**
 * Mock user preferences store - in a real application, this would be replaced
 * with a database query or API call to retrieve user preferences
 */
const mockUserPreferences = {
  'user@example.com': {
    name: 'John Doe',
    language: 'en',
    channels: {
      email: {
        enabled: true,
        address: 'user@example.com'
      },
      sms: {
        enabled: true,
        phoneNumber: '+15551234567'
      },
      push: {
        enabled: false
      }
    },
    preferences: {
      otp: ['email', 'sms'],
      welcome: ['email'],
      marketing: ['email'],
      alerts: ['sms'],
      updates: ['email', 'sms']
    }
  },
  'alice@example.com': {
    name: 'Alice Smith',
    language: 'fr',
    channels: {
      email: {
        enabled: true,
        address: 'alice@example.com'
      },
      sms: {
        enabled: true,
        phoneNumber: '+15559876543'
      },
      push: {
        enabled: true,
        deviceId: 'device-id-123'
      }
    },
    preferences: {
      otp: ['email'],
      welcome: ['email', 'sms'],
      marketing: [],
      alerts: ['email', 'push'],
      updates: ['email']
    }
  }
};

/**
 * Get user notification preferences by email
 * 
 * @param {string} email - The user's email address
 * @returns {Object|null} The user preferences object or null if not found
 */
function getUserPreferences(email) {
  if (!email || typeof email !== 'string') {
    console.log('Invalid email provided to getUserPreferences');
    return null;
  }
  
  return mockUserPreferences[email] || null;
}

/**
 * Send notification to a user based on their preferences and notification type
 * 
 * @param {string} email - User's email address
 * @param {string} notificationType - Type of notification (e.g., otp, welcome)
 * @param {Object} data - Data to be used for the notification template
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Result of the notification dispatch
 */
async function sendNotificationByPreference(email, notificationType, data = {}, options = {}) {
  // Validate inputs
  if (!email || typeof email !== 'string') {
    return {
      success: false,
      error: 'Invalid email address',
      channels: []
    };
  }

  if (!notificationType || typeof notificationType !== 'string') {
    return {
      success: false,
      error: 'Invalid notification type',
      channels: []
    };
  }

  // Get user preferences
  const userPrefs = getUserPreferences(email);

  console.log(`Fetching preferences for user: ${email}`);
  
  if (!userPrefs) {
    console.log(`User preferences not found for email: ${email}`);
    return {
      success: false,
      error: 'User preferences not found',
      channels: []
    };
  }

  // Check if user has opted in to receive this type of notification
  const enabledChannels = userPrefs.preferences[notificationType] || [];

  console.log(`Enabled channels for notification type "${notificationType}": ${enabledChannels.join(', ')}`);
  
  if (enabledChannels.length === 0) {
    console.log(`User ${email} has no enabled channels for notification type: ${notificationType}`);
    return {
      success: true,
      message: 'User has not opted-in to this notification type',
      channels: []
    };
  }

  // Prepare notification data with user information
  const notificationData = {
    ...data,
    userName: userPrefs.name,
    language: userPrefs.language,
    // Add any other user-specific data needed for templates
  };

  console.log(`Notification data prepared for user ${email}:`, notificationData);

  // Track results of each notification channel
  const results = [];
  const successfulChannels = [];

  // Send notifications through each enabled channel
  for (const channel of enabledChannels) {
    if (channel === 'email' && userPrefs.channels.email.enabled) {
      try {
        const emailResult = await emailService.sendEmailMock({
          to: userPrefs.channels.email.address,
          templateName: notificationType,
          language: userPrefs.language,
          data: notificationData,
          ...options.email
        });

        console.log(`Email notification sent to ${userPrefs.channels.email.address} for type "${notificationType}"`);
        
        results.push({ channel: 'email', result: emailResult });
        if (emailResult.dispatched) {
          successfulChannels.push('email');
        }
      } catch (error) {
        console.log(`Error sending email notification: ${error.message}`);
        results.push({ 
          channel: 'email', 
          error: error.message,
          dispatched: false
        });
      }
    }
    
    if (channel === 'sms' && userPrefs.channels.sms.enabled) {
      try {
        const smsResult = await smsService.sendSmsMock({
          to: userPrefs.channels.sms.phoneNumber,
          templateName: notificationType,
          language: userPrefs.language,
          data: notificationData,
          ...options.sms
        });
        
        results.push({ channel: 'sms', result: smsResult });
        if (smsResult.success) {
          successfulChannels.push('sms');
        }
      } catch (error) {
        console.log(`Error sending SMS notification: ${error.message}`);
        results.push({ 
          channel: 'sms', 
          error: error.message,
          dispatched: false
        });
      }
    }
    
    // Additional channels like push notifications can be added here
  }

  // Determine overall success
  const isSuccess = successfulChannels.length > 0;
  
  // Log the result
  if (isSuccess) {
    console.log(`Notification "${notificationType}" sent to ${email} via channels: ${successfulChannels.join(', ')}`);
  } else {
    console.log(`Failed to send notification "${notificationType}" to ${email} on all channels`);
  }

  // Return the overall result
  return {
    success: isSuccess,
    message: isSuccess 
      ? `Notification sent via: ${successfulChannels.join(', ')}` 
      : 'Failed to send notification on all channels',
    channels: successfulChannels,
    results: results
  };
}

module.exports = {
  getUserPreferences,
  sendNotificationByPreference
};
