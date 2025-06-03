/**
 * Controller for handling user notification preferences
 * @module userNotificationController
 */

const userPreferences = require('../userPreferences');
const mockEmailService = require('../notifications/emails');
const mockSmsService = require('../notifications/sms');
// const console.log require('../utils/logger');

/**
 * Determines which notification channels to use based on user preferences
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'otp', 'welcome')
 * @returns {Promise<Object>} Object containing user preferences and available channels
 */
function determineNotificationChannels(email, notificationType) {
  try {
    // Input validation
    if (!email) {
      console.log('Email address is required');
      return {
        success: false,
        error: 'Email address is required',
        channels: []
      };
    }

    if (!notificationType) {
      console.log('Notification type is required');
      return {
        success: false,
        error: 'Notification type is required',
        channels: []
      };
    }

    // Get user preferences by email
    const userPrefs = userPreferences.getUserPreferences(email);
    
    if (!userPrefs) {
      console.log(`User preferences not found for email: ${email}`);
      return {
        success: false,
        error: 'User not found',
        channels: []
      };
    }

    // Determine which channels the user has opted in to
    const channels = [];

    // console.log(`Determining notification channels for ${JSON.stringify(userPrefs)}`);
    
    // Check email preferences
    if (userPrefs.emailEnabled) {
      channels.push('email');
    }

    // Check SMS preferences
    if (userPrefs.smsEnabled) {
      channels.push('sms');
    }

    // No channels enabled
    if (channels.length === 0) {
      return {
        success: true,
        user: {
          email: userPrefs.email,
          name: userPrefs.name,
          phone: userPrefs.phone
        },
        message: `User has not opted in to receive ${notificationType} notifications on any channel`,
        channels: []
      };
    }

    // Return successful result with available channels
    return {
      success: true,
      user: {
        email: userPrefs.email,
        name: userPrefs.name,
        phone: userPrefs.phone
      },
      channels,
      canSendEmail: channels.includes('email'),
      canSendSms: channels.includes('sms')
    };
  } catch (error) {
    console.log(`Error determining notification channels for ${email}:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      channels: []
    };
  }
};

/**
 * Sends a notification to a user based on their communication preferences
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'otp', 'welcome')
 * @param {Object} [data={}] - Data to populate the notification templates
 * @returns {Promise<Object>} Results of the notification attempts
 */
function sendNotification(email, notificationType, data = {}) {
  // First determine which channels we can use
  const channelInfo = determineNotificationChannels(email, notificationType);
  
  if (!channelInfo.success) {
    return {
      success: false,
      error: channelInfo.error,
      channels: []
    };
  }
  
  if (channelInfo.channels.length === 0) {
    return {
      success: true,
      message: channelInfo.message,
      channels: []
    };
  }
  
  const results = {
    success: false,
    channels: channelInfo.channels,
    results: {}
  };
  
  // Send through available channels using mock services
  if (channelInfo.canSendEmail) {
    try {
      const emailResult = mockEmailService.sendEmailMock({
        to: email,
        type: notificationType,
        data: {
          ...data,
          userName: channelInfo.user.name || 'Valued Customer'
        }
      });
      
      results.results.email = {
        success: !!emailResult.sent,
        messageId: emailResult.messageId || null,
        error: emailResult.error || null
      };
      
      console.log(`Email ${notificationType} notification ${emailResult.sent ? 'sent' : 'failed'} to ${email}`);
    } catch (error) {
      results.results.email = {
        success: false,
        error: error.message || 'Failed to send email'
      };
      console.log(`Error sending ${notificationType} email to ${email}:`, error);
    }
  }
  
  if (channelInfo.canSendSms && channelInfo.user.phone) {
    try {
      const smsResult = mockSmsService.sendSmsMock({
        to: channelInfo.user.phone,
        type: notificationType,
        data: {
          ...data,
          userName: channelInfo.user.name || 'Valued Customer'
        }
      });
      
      results.results.sms = {
        success: !!smsResult.sent,
        messageId: smsResult.messageId || null,
        error: smsResult.error || null
      };
      
      console.log(`SMS ${notificationType} notification ${smsResult.sent ? 'sent' : 'failed'} to ${channelInfo.user.phone}`);
    } catch (error) {
      results.results.sms = {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
      console.log(`Error sending ${notificationType} SMS to ${channelInfo.user.phone}:`, error);
    }
  }
  
  // Mark overall success if at least one channel succeeded
  results.success = Object.values(results.results).some(result => result.success);
  
  return results;
};

module.exports = {
  determineNotificationChannels,
  sendNotification
};