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
const DEFAULT_DATA = {
  serviceName: 'NotifyHub',
  userName: 'Valued Customer',
  verificationLink: 'https://example.com/verify?token=sample-token-12345',
  resetLink: 'https://example.com/reset-password?token=sample-token-12345',
  supportEmail: 'support@example.com',
  otpCode: '000000',
  expiryTime: '10',
  appointmentDate: 'your scheduled date',
  appointmentTime: 'your scheduled time',
  amount: 'the specified amount',
  referenceNumber: 'your reference number'
};

/**
 * Renders a template by replacing placeholders with actual values
 * 
 * @param {string} template - The template string containing placeholders
 * @param {Object} data - The data object with values to inject
 * @returns {string} The rendered template with placeholders replaced with values
 */
function renderTemplate(template, data) {
  if (!template) {
    return '';
  }
  
  // Replace all {{variableName}} occurrences with their corresponding values
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    // Use the value from data if it exists, otherwise return the placeholder
    return data[key] !== undefined ? data[key] : match;
  });
}

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
 * Prepares and renders notification templates for the specified channels based on user preferences
 * with language fallback mechanism
 * 
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Array} channels - Array of channels to prepare templates for
 * @param {Object} userData - User data including language preference
 * @param {Object} dynamicData - Dynamic data to personalize the templates with
 * @returns {Object} Object containing rendered templates for each channel
 */
function prepareNotificationTemplates(notificationType, channels, userData, dynamicData) {
  const templates = {};
  const preferredLanguage = userData.language || 'en';
  const DEFAULT_FALLBACK_LANGUAGE = 'en';
  
  // Prepare personalization data by merging default values, user data and dynamic data
  const templateData = {
    ...DEFAULT_DATA,
    // Add user-specific information
    userName: userData.name || dynamicData.name || DEFAULT_DATA.userName,
    userEmail: userData.email || dynamicData.email,
    userPhone: userData.phone || dynamicData.phone,
    // Add any additional dynamic data provided
    ...dynamicData
  };
  
  console.log(`Preparing templates with data: ${JSON.stringify(templateData, null, 2)}`);
  
  /**
   * Helper to get template with fallback language support
   * @param {string} type - The template type (email, sms)
   * @param {string} notifType - The notification type (welcome, otp, etc.)
   * @param {string} lang - The preferred language
   * @returns {Object} Template and metadata about fallback
   */
  function getTemplateWithFallback(type, notifType, lang) {
    // First try with preferred language
    const template = getTemplate(type, notifType, lang);
    
    if (template) {
      return {
        template,
        language: lang,
        fallbackUsed: false
      };
    }
    
    // If preferred language is not available and is not already English,
    // try falling back to English
    if (lang !== DEFAULT_FALLBACK_LANGUAGE) {
      console.log(`${type} template not found for ${notifType} in "${lang}" language. Falling back to ${DEFAULT_FALLBACK_LANGUAGE}`);
      
      const fallbackTemplate = getTemplate(type, notifType, DEFAULT_FALLBACK_LANGUAGE);
      
      if (fallbackTemplate) {
        return {
          template: fallbackTemplate,
          language: DEFAULT_FALLBACK_LANGUAGE,
          fallbackUsed: true
        };
      }
    }
    
    // If we reach here, no template was found in either language
    console.log(`No ${type} template found for ${notifType} in either "${lang}" or fallback language "${DEFAULT_FALLBACK_LANGUAGE}"`);
    return {
      template: null,
      language: null,
      fallbackUsed: false
    };
  }
  
  // Check if email channel is enabled and prepare email template
  if (channels.includes('email')) {
    const { template: emailTemplate, language: usedLanguage, fallbackUsed } = 
      getTemplateWithFallback('email', notificationType, preferredLanguage);
    
    if (!emailTemplate) {
      templates.email = null;
    } else {
      // Render the subject and body templates with the personalized data
      const renderedSubject = renderTemplate(emailTemplate.subject, templateData);
      const renderedBody = renderTemplate(emailTemplate.body, templateData);
      
      templates.email = {
        subject: renderedSubject,
        body: renderedBody,
        originalTemplate: emailTemplate,
        language: usedLanguage,
        fallbackUsed,
        data: templateData
      };
      
      const languageInfo = fallbackUsed 
        ? ` in ${usedLanguage} (fallback from ${preferredLanguage})` 
        : ` in ${usedLanguage}`;
        
      console.log(`Prepared personalized email template for ${notificationType} notification${languageInfo}`);
      console.log(`Email subject: "${renderedSubject.substring(0, 30)}..."`);
    }
  }
  
  // Check if SMS channel is enabled and prepare SMS template
  if (channels.includes('sms')) {
    const { template: smsTemplate, language: usedLanguage, fallbackUsed } = 
      getTemplateWithFallback('sms', notificationType, preferredLanguage);
    
    if (!smsTemplate) {
      templates.sms = null;
    } else {
      // Render the SMS template with the personalized data
      const renderedMessage = renderTemplate(smsTemplate, templateData);
      
      templates.sms = {
        message: renderedMessage,
        originalTemplate: smsTemplate,
        language: usedLanguage,
        fallbackUsed,
        data: templateData
      };
      
      const languageInfo = fallbackUsed 
        ? ` in ${usedLanguage} (fallback from ${preferredLanguage})` 
        : ` in ${usedLanguage}`;
        
      console.log(`Prepared personalized SMS template for ${notificationType} notification${languageInfo}`);
      console.log(`SMS message (truncated): "${renderedMessage.substring(0, 30)}..."`);
    }
  }
  
  return templates;
}

/**
 * Processes notification for a user based on their preferences
 * and prepares appropriate personalized templates
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Object} [dynamicData={}] - Dynamic data to populate the notification templates
 * @returns {Promise<Object>} A result object with details about the notification preparation
 */
async function processUserNotification(email, notificationType, dynamicData = {}) {
  // Get user notification channels
  const channelInfo = await getUserNotificationChannels(email, notificationType);
  
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
  
  // Prepare and render templates for enabled channels
  const templates = prepareNotificationTemplates(notificationType, channels, userData, dynamicData);
  
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
  console.log(`Successfully prepared ${channels.join(', ')} personalized templates for ${email}`);
  
  return {
    success: true,
    message: `Personalized templates prepared successfully for ${channels.length} channel(s)`,
    channels,
    userData,
    notificationType,
    templates
  };
}

/**
 * Sends personalized notifications to a user through their preferred channels
 * using mock services for demonstration purposes
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Object} [dynamicData={}] - Dynamic data to populate the notification templates
 * @returns {Promise<Object>} A result object with details about the notification attempts
 */
async function sendUserNotification(email, notificationType, dynamicData = {}) {
  // Process and create personalized notification templates based on user preferences
  const processResult = await processUserNotification(email, notificationType, dynamicData);
  
  if (!processResult.success) {
    return processResult;
  }
  
  const { channels, userData, templates } = processResult;
  const results = { 
    success: false, 
    channels: [],
    results: {},
    sentContent: {} // Store snippets of the actual content sent
  };
  
  // Use mock services to send through enabled channels
  
  if (channels.includes('email') && templates.email) {
    try {
      const fallbackInfo = templates.email.fallbackUsed 
        ? ` using fallback language (${templates.email.language})` 
        : '';
        
      console.log(`Sending personalized ${notificationType} email to: ${email}${fallbackInfo}`);
      
      // In a real implementation, we would call an actual email service here
      // For mock purposes, we'll log and simulate a successful send
      
      // This is where the actual email service would be called with the rendered templates
      // emailService.send({
      //   to: email,
      //   subject: templates.email.subject,
      //   body: templates.email.body,
      //   isHtml: false
      // });
      
      results.results.email = {
        success: true,
        messageId: `mock-email-${Date.now()}`,
        sentTo: email,
        subject: templates.email.subject,
        language: templates.email.language,
        fallbackUsed: templates.email.fallbackUsed,
        timestamp: new Date().toISOString()
      };
      
      // Store a preview of the rendered content
      results.sentContent.email = {
        subject: templates.email.subject,
        body: templates.email.body.substring(0, 100) + (templates.email.body.length > 100 ? '...' : ''),
        language: templates.email.language,
        fallbackUsed: templates.email.fallbackUsed
      };
      
      console.log(`Successfully sent personalized ${notificationType} email to ${email}${fallbackInfo}`);
    } catch (error) {
      console.log(`Failed to send email to ${email}:`, error);
      results.results.email = {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Send SMS if enabled
  if (channels.includes('sms') && templates.sms) {
    try {
      const fallbackInfo = templates.sms.fallbackUsed 
        ? ` using fallback language (${templates.sms.language})` 
        : '';
        
      console.log(`Sending personalized ${notificationType} SMS to: ${userData.phone}${fallbackInfo}`);
      
      // In a real implementation, we would call an actual SMS service here
      // For mock purposes, we'll log and simulate a successful send
      
      // This is where the actual SMS service would be called with the rendered message
      // smsService.send({
      //   to: userData.phone,
      //   message: templates.sms.message
      // });
      
      results.results.sms = {
        success: true,
        messageId: `mock-sms-${Date.now()}`,
        sentTo: userData.phone,
        language: templates.sms.language,
        fallbackUsed: templates.sms.fallbackUsed,
        timestamp: new Date().toISOString()
      };
      
      // Store a preview of the rendered content
      results.sentContent.sms = {
        message: templates.sms.message.substring(0, 100) + (templates.sms.message.length > 100 ? '...' : ''),
        language: templates.sms.language,
        fallbackUsed: templates.sms.fallbackUsed
      };
      
      console.log(`Successfully sent personalized ${notificationType} SMS to ${userData.phone}${fallbackInfo}`);
    } catch (error) {
      console.log(`Failed to send SMS to ${userData.phone}:`, error);
      results.results.sms = {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // Mark overall success if at least one channel succeeded
  results.success = Object.values(results.results).some(result => result.success);
  results.channels = channels;
  
  // Add error summary if any channel failed
  const failedChannels = Object.entries(results.results)
    .filter(([_, result]) => !result.success)
    .map(([channel, result]) => ({
      channel,
      error: result.error,
      errorType: result.errorType || 'unknown'
    }));
    
  if (failedChannels.length > 0) {
    results.failedChannels = failedChannels;
    
    // Log a summary of failures
    const failureSummary = failedChannels
      .map(f => `${f.channel} (${f.errorType}): ${f.error}`)
      .join('; ');
      
    console.log(`Notification had ${failedChannels.length} delivery failures: ${failureSummary}`);
  }
  
  // Record notification attempt for audit purposes
  console.log(`Notification attempt complete for ${email}, type: ${notificationType}, ` +
    `success: ${results.success}, channels attempted: ${channels.length}, ` +
    `channels succeeded: ${Object.values(results.results).filter(r => r.success).length}`);
  
  return results;
}

/**
 * Sends a notification to a user based on their communication preferences
 * 
 * @param {string} email - The email address of the user
 * @param {string} notificationType - The type of notification (e.g., 'welcome', 'otp')
 * @param {Object} [data={}] - Data to populate the notification templates
 * @param {Object} [options={}] - Additional options for notification delivery
 * @returns {Promise<Object>} An object containing the results of notification attempts
 */
const sendNotificationByPreference = async (email, notificationType, data = {}, options = {}) => {
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
  const userPrefs = await userPreferences.getUserPreferences(email);
  
  if (!userPrefs) {
    console.log(`User preferences not found for email: ${email}`);
    return {
      success: false,
      error: 'User preferences not found',
      channels: []
    };
  }

  // Determine which channels the user has opted in to
  const channels = [];
  const results = {
    success: false,
    channels: [],
    results: {}
  };

  // Check email preferences
  if (userPrefs.emailEnabled) {
    channels.push('email');
  }

  // Check SMS preferences
  if (userPrefs.smsEnabled) {
    channels.push('sms');
  }

  // If no channels are enabled for this notification type, return early
  if (channels.length === 0) {
    console.log(`User ${email} has not opted in to receive ${notificationType} notifications on any channel`);
    return {
      success: false,
      error: 'No notification channels enabled for this notification type',
      channels: []
    };
  }

  // Send notifications through each enabled channel
  for (const channel of channels) {
    try {
      if (channel === 'email') {
        // Get appropriate email template
        const template = getTemplate('email', notificationType, userPrefs.language || 'en');
        
        if (!template) {
          console.log(`No ${notificationType} template found for ${userPrefs.language} language`);
          results.results.email = { 
            success: false, 
            error: 'Template not found' 
          };
          continue;
        }
        
        const emailResult = mockEmailService.sendEmailMock({
          to: email,
          type: notificationType,
          data: {
            ...data,
            userName: userPrefs.name || 'Valued Customer'
          }
        });
        
        results.results.email = {
          success: !!emailResult.dispatched,
          messageId: emailResult.messageId || null,
          error: emailResult.error || null
        };
        
        console.log(`Email ${notificationType} notification ${emailResult.dispatched ? 'sent' : 'failed'} to ${email}`);
      } 
      
      else if (channel === 'sms') {
        // Get appropriate SMS template
        const template = getTemplate('sms', notificationType, userPrefs.language || 'en');
        
        if (!template) {
          console.log(`No ${notificationType} SMS template found for ${userPrefs.language} language`);
          results.results.sms = { 
            success: false, 
            error: 'Template not found' 
          };
          continue;
        }
        
        const smsResult = mockSmsService.sendSmsMock({
          type: 'sms',
          recipient: userPrefs.phone,
          message: template,
          data: {
            ...data,
            userName: userPrefs.name || 'Valued Customer'
          }
        });
        
        results.results.sms = {
          success: !!smsResult.dispatched,
          messageId: smsResult.messageId || null,
          error: smsResult.error || null
        };
        
        console.log(`SMS ${notificationType} notification ${smsResult.dispatched ? 'sent' : 'failed'} to ${userPrefs.phone}`);
      }
    } catch (error) {
      console.log(`Error sending ${channel} notification to ${email}:`, error);
      results.results[channel] = {
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  // Mark overall success if at least one channel succeeded
  results.success = Object.values(results.results).some(result => result.success);
  results.channels = channels;

  return results;
};

/**
 * Sends the same notification to multiple users at once
 * 
 * This function accepts an array of email addresses and sends the same type
 * of notification to all users, processing each independently according to
 * their notification preferences.
 * 
 * @param {string[]} emails - Array of email addresses to send notifications to
 * @param {string} notificationType - The type of notification to send (e.g., 'welcome', 'otp')
 * @param {Object} [data={}] - Shared data to populate the notification templates
 * @param {Object} [options={}] - Additional options for notification delivery
 * @param {boolean} [options.failFast=false] - If true, stops processing on first failure
 * @param {boolean} [options.parallelSend=true] - If true, sends notifications in parallel
 * @param {boolean} [options.validateTemplatesFirst=true] - If true, validates templates before processing
 * @returns {Promise<Object>} Detailed results of the batch operation
 */
const sendBatchNotifications = async (emails, notificationType, data = {}, options = {}) => {
  // Validate inputs
  if (!Array.isArray(emails) || emails.length === 0) {
    console.log('Invalid or empty emails array provided to batch notification');
    return {
      success: false,
      error: 'An array of email addresses is required',
      processedCount: 0,
      statusCounts: { success: 0, skipped: 0, failed: 0 },
      results: []
    };
  }

  if (!notificationType) {
    console.log('Notification type is required for batch notification');
    return {
      success: false,
      error: 'Notification type is required',
      processedCount: 0,
      statusCounts: { success: 0, skipped: 0, failed: 0 },
      results: []
    };
  }

  // Extract and default batch-specific options
  const { 
    failFast = false, 
    parallelSend = true,
    validateTemplatesFirst = true,
    ...notificationOptions 
  } = options;

  // Pre-validate templates if requested
  if (validateTemplatesFirst) {
    console.log('Pre-validating templates for notification type:', notificationType);
    // Check if email template exists (using default language)
    const emailTemplate = getTemplate('email', notificationType, 'en');
    if (!emailTemplate) {
      console.log(`Email template not found for type '${notificationType}'`);
      return {
        success: false,
        error: `Email template not found for type '${notificationType}'`,
        processedCount: 0,
        statusCounts: { success: 0, skipped: 0, failed: emails.length },
        results: emails.map(email => ({
          email,
          status: 'failed',
          success: false,
          error: `Email template not found for type '${notificationType}'`,
          channels: []
        }))
      };
    }
    
    // Check if SMS template exists (using default language)
    const smsTemplate = getTemplate('sms', notificationType, 'en');
    if (!smsTemplate) {
      console.log(`SMS template not found for type '${notificationType}' - SMS notifications may be skipped`);
    }
  }

  console.log(`Starting batch notification of type "${notificationType}" to ${emails.length} recipients`);
  
  const startTime = Date.now();
  const statusCounts = {
    success: 0,
    skipped: 0,
    failed: 0
  };
  
  // Results container
  const results = [];
  
  try {
    // Process notifications in parallel or sequentially based on options
    if (parallelSend) {
      // Map each email to a notification promise and process all in parallel
      const notificationPromises = emails.map(async (email) => {
        try {
          // Check if email is valid before proceeding
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            statusCounts.failed++;
            console.log(`Invalid email address format: ${email}`);
            return {
              email: email || 'invalid-email',
              status: 'failed',
              success: false,
              error: 'Invalid email address format',
              channels: []
            };
          }
          
          const result = await sendNotificationByPreference(
            email, 
            notificationType, 
            data, 
            notificationOptions
          );
          
          // Determine the status based on the result
          let status;
          
          if (result.success) {
            status = 'success';
            statusCounts.success++;
            console.log(`Successfully sent ${notificationType} notification to ${email}`);
          } else if (result.error === 'No notification channels enabled for this notification type') {
            status = 'skipped';
            statusCounts.skipped++;
            console.log(`User ${email} not opted-in for ${notificationType} notifications - skipped`);
          } else if (result.error === 'User preferences not found') {
            status = 'skipped';
            statusCounts.skipped++;
            console.log(`User preferences not found for ${email} - skipped`);
          } else if (result.results && Object.values(result.results).some(r => r.error === 'Template not found')) {
            status = 'failed';
            statusCounts.failed++;
            console.log(`Template not found for ${notificationType} notification to ${email}`);
          } else {
            status = 'failed';
            statusCounts.failed++;
            console.log(`Failed to send ${notificationType} notification to ${email}: ${result.error || 'Unknown error'}`);
          }
          
          // Return the enhanced user result
          return {
            email,
            status,
            ...result
          };
        } catch (error) {
          statusCounts.failed++;
          console.log(`Exception while processing notification for ${email}:`, error);
          return {
            email,
            status: 'failed',
            success: false,
            error: error.message || 'Unknown error',
            channels: []
          };
        }
      });
      
      // Await all notification promises
      const batchResults = await Promise.all(notificationPromises);
      results.push(...batchResults);
    } else {
      // Process sequentially
      for (const email of emails) {
        try {
          // Check if email is valid before proceeding
          if (!email || typeof email !== 'string' || !email.includes('@')) {
            statusCounts.failed++;
            console.log(`Invalid email address format: ${email}`);
            
            const userResult = {
              email: email || 'invalid-email',
              status: 'failed',
              success: false,
              error: 'Invalid email address format',
              channels: []
            };
            
            results.push(userResult);
            
            if (failFast) {
              console.log(`Stopping batch processing due to failFast option after invalid email: ${email}`);
              break;
            }
            
            continue;
          }
          
          const result = await sendNotificationByPreference(
            email, 
            notificationType, 
            data, 
            notificationOptions
          );
          
          // Determine the status based on the result
          let status;
          
          if (result.success) {
            status = 'success';
            statusCounts.success++;
            console.log(`Successfully sent ${notificationType} notification to ${email}`);
          } else if (result.error === 'No notification channels enabled for this notification type') {
            status = 'skipped';
            statusCounts.skipped++;
            console.log(`User ${email} not opted-in for ${notificationType} notifications - skipped`);
          } else if (result.error === 'User preferences not found') {
            status = 'skipped';
            statusCounts.skipped++;
            console.log(`User preferences not found for ${email} - skipped`);
          } else if (result.results && Object.values(result.results).some(r => r.error === 'Template not found')) {
            status = 'failed';
            statusCounts.failed++;
            console.log(`Template not found for ${notificationType} notification to ${email}`);
          } else {
            status = 'failed';
            statusCounts.failed++;
            console.log(`Failed to send ${notificationType} notification to ${email}: ${result.error || 'Unknown error'}`);
          }
          
          // Add the enhanced user result
          const userResult = {
            email,
            status,
            ...result
          };
          
          results.push(userResult);
          
          // Stop processing if failFast is enabled and we had a failure
          if (failFast && status === 'failed') {
            console.log(`Stopping batch processing due to failFast option after failure for ${email}`);
            break;
          }
        } catch (error) {
          statusCounts.failed++;
          
          const userResult = {
            email,
            status: 'failed',
            success: false,
            error: error.message || 'Unknown error',
            channels: []
          };
          
          results.push(userResult);
          
          console.log(`Exception while processing notification for ${email}:`, error);
          
          // Stop processing if failFast is enabled
          if (failFast) {
            console.log(`Stopping batch processing due to failFast option after exception for ${email}`);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log(`Unexpected error in batch notification process:`, error);
    return {
      success: false,
      error: `Batch processing error: ${error.message || 'Unknown error'}`,
      processedCount: statusCounts.success + statusCounts.skipped + statusCounts.failed,
      statusCounts,
      results
    };
  }
  
  const endTime = Date.now();
  const processingTime = (endTime - startTime) / 1000; // in seconds
  
  console.log(
    `Batch notification complete: ${statusCounts.success} succeeded, ${statusCounts.skipped} skipped, ` +
    `${statusCounts.failed} failed, took ${processingTime.toFixed(2)}s`
  );
  
  return {
    success: statusCounts.success > 0,
    processedCount: statusCounts.success + statusCounts.skipped + statusCounts.failed,
    statusCounts,
    processingTimeSeconds: processingTime,
    results
  };
};

module.exports = {
  determineNotificationChannels,
  sendNotification,
  getUserNotificationChannels,
  processUserNotification,
  prepareNotificationTemplates,
  sendUserNotification,
  renderTemplate,
  sendNotificationByPreference,
  sendBatchNotifications
};