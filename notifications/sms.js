/**
 * SMS notification module
 * 
 * This module provides functionality to send SMS notifications
 * using Twilio or a mock implementation for development
 */

// const errorHandler = require('../error-handler');
const { withErrorHandling } = require('../error-handler');
const errorHandler = require('../error-handler');
const logger = require('../logger').createTypedLogger('sms');
// Import Twilio or create mock if credentials are not available
let twilio;
let twilioClient;

// Try to load Twilio if available
try {
  if (process.env.SMS_PROVIDER === 'twilio' && 
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN) {
    
    twilio = require('twilio');
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('Twilio SMS provider initialized');
  }
} catch (error) {
  console.warn('Failed to initialize Twilio client:', error.message);
  console.log('Using mock SMS implementation instead');
}

/**
 * Validates a phone number format
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== 'string') return false;
  
  // Basic E.164 format validation (e.g., +12025551234)
  // This is recommended for international phone numbers with Twilio
  const phonePattern = /^\+[1-9]\d{1,14}$/;
  
  return phonePattern.test(phoneNumber.trim());
}

/**
 * Formats a phone number to E.164 format if possible
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phoneNumber) {
  // Strip all non-digit characters except leading +
  const digits = phoneNumber.replace(/[^\d+]/g, '');
  
  // If no + prefix and starts with country code (e.g., 1 for US)
  if (!digits.startsWith('+') && /^[1-9]/.test(digits)) {
    return `+${digits}`;
  }
  
  return digits;
}

/**
 * Mock implementation for sending SMS
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message content
 * @returns {Promise} - Promise resolving with mock result
 */
function sendSmsMock(to, message) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      console.log('-------------------------');
      console.log('📱 MOCK SMS SENT:');
      console.log(`To: ${to}`);
      console.log('-------------------------');
      console.log(message);
      console.log('-------------------------');
      resolve({ 
        success: true, 
        sid: `mock-sms-${Date.now()}`,
        to: to,
        status: 'sent'
      });
    }, 600);
  });
}

/**
 * Send SMS notification
 * @param {string} to - Recipient phone number
 * @param {string} message - SMS message content
 * @param {Object} options - Additional options (from number, etc.)
 * @returns {Promise} - Promise resolving with send result or error
 */
async function sendSms(to, message, options = {}) {
  // Format and validate the phone number
  const formattedPhone = formatPhoneNumber(to);
  if (!isValidPhoneNumber(formattedPhone)) {
    const error = new Error(`Invalid phone number format: ${to}. Use E.164 format (e.g., +12025551234)`);
    error.code = 'INVALID_PHONE_NUMBER';
    console.error('SMS validation failed:', error.message);
    return Promise.reject(error);
  }
  
  // Validate message length (160 chars is standard SMS length)
  if (!message || typeof message !== 'string') {
    const error = new Error('SMS message is required and must be a string');
    error.code = 'INVALID_MESSAGE';
    return Promise.reject(error);
  }
  
  if (message.length > 1600) {  // Allow for concatenated messages but with a max
    const error = new Error(`SMS message too long: ${message.length} chars (max 1600)`);
    error.code = 'MESSAGE_TOO_LONG';
    return Promise.reject(error);
  }
  
  // Use mock if no Twilio client or in dev mode
  if (!twilioClient || process.env.SMS_MODE === 'mock' || config.isDev) {
    return sendSmsMock(formattedPhone, message);
  }
  
  try {
    // Send via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: options.from || process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: result.to
    };
  } catch (error) {
    console.error('Twilio SMS sending failed:', error);
    
    // Create a more user-friendly error
    const smsError = new Error(`Failed to send SMS: ${error.message}`);
    smsError.code = 'SMS_SEND_FAILED';
    smsError.originalError = error;
    
    throw smsError;
  }
}

// Check if required environment variables are available
function validateEnvVariables() {
  const requiredVars = [
    'TWILIO_ACCOUNT_SID', 
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for SMS service: ${missingVars.join(', ')}. ` +
      `Please make sure these are defined in your .env file or environment.`
    );
  }
}

// Initialize Twilio client with credentials from environment variables
function getTwilioClient() {
  // Validate environment variables before trying to use them
  validateEnvVariables();
  
  // Dynamically require Twilio to prevent errors if env vars are not set
  const twilio = require('twilio');
  
  // Create and return the Twilio client with credentials from environment variables
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}
/**
 * Send an SMS notification using Twilio
 * @param {string} recipient - Phone number of the recipient in E.164 format
 * @param {string} message - The message to be sent
 * @param {Object} options - Additional options for the SMS
 * @returns {Promise<Object>} - Promise resolving to the result of the operation
 */
async function sendSMS(recipient, message, options = {}) {
 try {
    // Check if we're in mock mode
    const isMock = process.env.SMS_MOCK_MODE === 'true' || options.mockMode === true;
    
    // Log the attempt
    logger.logAttempt(recipient, message, options, isMock);
    
    // Simulate error for testing (if requested)
    if (recipient.includes('error') || (options.simulateError === true)) {
      throw new Error('Simulated SMS sending failure');
    }
    
    // For mock mode, don't actually try to send via Twilio
    if (isMock) {
      // Simulate a delay that might happen with real SMS sending
      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }
      
      // Create a mock result
      const result = {
        type: 'sms',
        provider: 'twilio-mock',
        recipient,
        message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
        messageId: `mock-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(),
        status: 'sent',
        isMock: true
      };
      
      // Log the sent notification with mock flag
      logger.logSent(recipient, message, options, true, {
        provider: 'twilio-mock',
        messageId: result.messageId
      });
      
      return result;
    }
    
    // Only initialize the client when needed (lazy loading)
    const twilioClient = getTwilioClient();
    
    // Send the SMS using Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipient,
      ...options  // Allow passing additional Twilio options
    });
    
    // Create a sanitized response
    const response = {
      type: 'sms',
      provider: 'twilio',
      recipient,
      message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
      messageId: result.sid,
      timestamp: new Date(),
      status: result.status
    };
    
    // Log the successful send
    logger.logSent(recipient, message, options, false, {
      provider: 'twilio',
      messageId: result.sid,
      twilioStatus: result.status
    });
    
    return response;
  } catch (error) {
    // Log the failure
    logger.logFailed(recipient, message, error, options, 
                    process.env.SMS_MOCK_MODE === 'true' || options.mockMode === true, {
      provider: 'twilio'
    });
    
    // Let the error propagate to be handled by the error handler wrapper
    throw error;
  }

  // try {
  //   // Simulate error for testing (if requested)
  //   if (recipient.includes('error') || (options.simulateError === true)) {
  //     throw new Error('Simulated SMS sending failure');
  //   }
    
  //   // For mock mode, don't actually try to send via Twilio
  //   if (process.env.SMS_MOCK_MODE === 'true' || options.mockMode === true) {
  //     console.log(`[SMS] MOCK MODE: Would send to ${recipient}: "${message}"`);
      
  //     // Simulate a delay that might happen with real SMS sending
  //     if (options.delay) {
  //       await new Promise(resolve => setTimeout(resolve, options.delay));
  //     }
      
  //     return {
  //       type: 'sms',
  //       provider: 'twilio-mock',
  //       recipient,
  //       message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
  //       messageId: `mock-sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  //       timestamp: new Date(),
  //       status: 'sent'
  //     };
  //   }
    
  //   // Only initialize the client when needed (lazy loading)
  //   const twilioClient = getTwilioClient();
    
  //   // Log sending attempt (without exposing credentials)
  //   console.log(`[SMS] Sending to: ${recipient}`);
    
  //   // Send the SMS using Twilio
  //   const result = await twilioClient.messages.create({
  //     body: message,
  //     from: process.env.TWILIO_PHONE_NUMBER,
  //     to: recipient,
  //     ...options  // Allow passing additional Twilio options
  //   });
    
  //   // Return a sanitized response
  //   return {
  //     type: 'sms',
  //     provider: 'twilio',
  //     recipient,
  //     message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
  //     messageId: result.sid,
  //     timestamp: new Date(),
  //     status: result.status
  //   };
  // } catch (error) {
  //   // Let the error propagate to be handled by the error handler wrapper
  //   throw error;
  // }
}

// Apply centralized error handling wrapper
// const send = errorHandler.withErrorHandling(sendSMS, 'sms');

const send = errorHandler.withErrorHandling(sendSMS, 'sms');

module.exports = {
  sendSms,
  isValidPhoneNumber,
  send,
  formatPhoneNumber,
};
