/**
 * Controller for determining user notification preferences for different channels
 * and handling notification templates based on user preferences
 * @module userNotificationController
 */

const userPreferences = require('../userPreferences');
const { getTemplate } = require('../templateManager');
const mockEmailService = require('../notifications/emails');
const mockSmsService = require('../notifications/sms');

/**
 * Default test data for template personalization
 * This would normally come from the application context or be passed in
 */
const DEFAULT_TEST_DATA = {
  serviceName: 'NotifyHub',
  userName: 'Test User',
  verificationLink: 'https://example.com/verify?token=sample-token-12345',
  resetLink: 'https://example.com/reset-password?token=sample-token-12345',
  supportEmail: 'support@example.com',
  otpCode: '123456',
  expiryTime: '15',
  appointmentDate: '2023-06-15',
  appointmentTime: '14:30',
  amount: '$99.99',
  referenceNumber: 'TRX-123456789'
};

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

/**
 * Determines which notification channels a user has opted in to
 * based on their preferences and notification type
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @returns {Promise<Object>} An object containing the user's notification preferences
 */
function getUserNotificationChannels(email, notificationType) {
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

  try {
    // Get user preferences by email
    const userPrefs = userPreferences.getUserPreferences(email);
    
    if (!userPrefs) {
      console.log(`User preferences not found for email: ${email}`);
      return {
        success: false,
        error: 'User preferences not found',
        channels: []
      };
    }

    // Determine which channels the user has opted in to for this notification type
    const channels = [];
    const preferences = { email: false, sms: false };

    // Check email preferences
    if (userPrefs.emailEnabled) {
      channels.push('email');
      preferences.email = true;
    }

    // Check SMS preferences
    if (userPrefs.smsEnabled) {
      channels.push('sms');
      preferences.sms = true;
    }

    // Return user's notification channels and preferences
    return {
      success: true,
      userData: {
        email: userPrefs.email,
        phone: userPrefs.smsEnabled ? userPrefs.phone : null,
        name: userPrefs.name || 'Valued Customer',
        language: userPrefs.language || 'en'
      },
      channels,
      preferences,
      notificationType
    };
  } catch (error) {
    console.log(`Error retrieving notification preferences for ${email}:`, error);
    return {
      success: false,
      error: error.message || 'Error retrieving user preferences',
      channels: []
    };
  }
}

/**
 * Prepares notification templates for the specified channels based on user preferences
 * 
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Array} channels - Array of channels to prepare templates for
 * @param {Object} userData - User data including language preference
 * @param {Object} data - Data to personalize the templates with
 * @returns {Object} Object containing templates for each channel
 */
function prepareNotificationTemplates(notificationType, channels, userData, data) {
  const templates = {};
  const language = userData.language || 'en';
  
  // Merge default test data with provided data
  const templateData = {
    ...DEFAULT_TEST_DATA,
    userName: userData.name || DEFAULT_TEST_DATA.userName,
    ...data
  };
  
  // Check if email channel is enabled and prepare email template
  if (channels.includes('email')) {
    const emailTemplate = getTemplate('email', notificationType, language);
    
    if (!emailTemplate) {
      console.log(`Email template not found for ${notificationType} in ${language} language`);
      templates.email = null;
    } else {
      // In a real implementation, we would populate the template with data here
      templates.email = {
        subject: emailTemplate.subject,
        body: emailTemplate.body,
        data: templateData
      };
      
      console.log(`Prepared email template for ${notificationType} notification in ${language}`);
    }
  }
  
  // Check if SMS channel is enabled and prepare SMS template
  if (channels.includes('sms')) {
    const smsTemplate = getTemplate('sms', notificationType, language);
    
    if (!smsTemplate) {
      console.log(`SMS template not found for ${notificationType} in ${language} language`);
      templates.sms = null;
    } else {
      templates.sms = {
        message: smsTemplate,
        data: templateData
      };
      
      console.log(`Prepared SMS template for ${notificationType} notification in ${language}`);
    }
  }
  
  return templates;
}

/**
 * Processes notification for a user based on their preferences
 * and prepares appropriate templates
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Object} [data={}] - Data to populate the notification templates
 * @returns {Promise<Object>} A result object with details about the notification preparation
 */
function processUserNotification(email, notificationType, data = {}) {
  // Get user notification channels
  const channelInfo = getUserNotificationChannels(email, notificationType);
  
  if (!channelInfo.success) {
    console.log(`Cannot process notification: ${channelInfo.error}`);
    return {
      success: false,
      error: channelInfo.error,
      details: 'Failed to determine notification channels'
    };
  }
  
  const { channels, userData } = channelInfo;
  
  // If no channels are enabled, log and exit gracefully
  if (channels.length === 0) {
    console.log(`User ${email} has not opted in to receive ${notificationType} notifications on any channel`);
    return {
      success: false,
      error: 'No notification channels enabled for this notification type',
      channels: []
    };
  }
  
  // Prepare templates for enabled channels
  const templates = prepareNotificationTemplates(notificationType, channels, userData, data);
  
  // Check if we have at least one valid template
  const hasValidTemplates = Object.values(templates).some(template => template !== null);
  
  if (!hasValidTemplates) {
    console.log(`No valid templates found for ${notificationType} notification`);
    return {
      success: false,
      error: 'No valid templates found for this notification type',
      channels
    };
  }
  
  // Log success and return templates and channel info
  console.log(`Successfully prepared ${channels.join(', ')} templates for ${email}`);
  
  return {
    success: true,
    message: `Templates prepared successfully for ${channels.length} channel(s)`,
    channels,
    userData,
    notificationType,
    templates
  };
}

/**
 * Sends notifications to a user through their preferred channels
 * using mock services for demonstration purposes
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Object} [data={}] - Data to populate the notification templates
 * @returns {Promise<Object>} A result object with details about the notification attempts
 */
function sendUserNotification(email, notificationType, data = {}) {
  // Process notification templates based on user preferences
  const processResult = processUserNotification(email, notificationType, data);
  
  if (!processResult.success) {
    return processResult;
  }
  
  const { channels, userData, templates } = processResult;
  const results = { success: false, channels: [], results: {} };
  
  // For demonstration, we'll just simulate sending through enabled channels
  // using mock services
  
  // Send email if enabled
  if (channels.includes('email') && templates.email) {
    try {
      console.log(`Sending ${notificationType} email to: ${email}`);
      
      // This would normally call the actual email service
      // For now, we'll just simulate success
      results.results.email = {
        success: true,
        messageId: `mock-email-${Date.now()}`,
        sentTo: email,
        subject: templates.email.subject
      };
      
      console.log(`Successfully sent ${notificationType} email to ${email}`);
    } catch (error) {
      console.log(`Failed to send email to ${email}:`, error);
      results.results.email = {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Send SMS if enabled
  if (channels.includes('sms') && templates.sms) {
    try {
      console.log(`Sending ${notificationType} SMS to: ${userData.phone}`);
      
      // This would normally call the actual SMS service
      // For now, we'll just simulate success
      results.results.sms = {
        success: true,
        messageId: `mock-sms-${Date.now()}`,
        sentTo: userData.phone
      };
      
      console.log(`Successfully sent ${notificationType} SMS to ${userData.phone}`);
    } catch (error) {
      console.log(`Failed to send SMS to ${userData.phone}:`, error);
      results.results.sms = {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Mark overall success if at least one channel succeeded
  results.success = Object.values(results.results).some(result => result.success);
  results.channels = channels;
  
  return results;
}

module.exports = {
  determineNotificationChannels,
  sendNotification,
  getUserNotificationChannels,
  processUserNotification,
  prepareNotificationTemplates,
  sendUserNotification
};