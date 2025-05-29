/**
 * Email notification module
 * 
 * This module provides functionality to send email notifications
 * using Nodemailer with environment-based configuration
 */

const nodemailer = require('nodemailer');
const config = require('../config.js');
const { isValidEmail, isNotEmpty } = require('../utilities/validators');

const errorHandler = require('../error-handler');
const logger = require('../logger.js').createTypedLogger('email');

// const errorHandler = require('../error-handler.js');
const { withErrorHandling } = require('../error-handler');
// Validate email configuration on module load
// config.validateConfig();

// Create transporter based on environment (mock or real)
let transporter;

// Initialize email transport
function initTransporter() {
  if (process.env.EMAIL_MODE === 'mock' || config.isDev) {
    console.log('📧 Using mock email transport in development mode');
    return null; // No actual transporter needed for mock
  } else {
    // Create real nodemailer transport with configs from environment
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth
    });
  }
}

// Mock implementation for sending emails (for development/testing)
function sendEmailMock(to, subject, body, options = {}) {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      console.log('-------------------------');
      console.log('📧 MOCK EMAIL SENT:');
      console.log(`From: ${options.from || config.email.defaultFrom}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('-------------------------');
      console.log(body);
      console.log('-------------------------');
      resolve({ success: true, messageId: `mock-${Date.now()}` });
    }, 500);
  });
}

/**
 * Validates email input parameters
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @returns {object} - { isValid, errors } 
 */
function validateEmailInput(to, subject, body) {
  const errors = [];
  
  // Validate recipient email
  if (!to) {
    errors.push('Recipient email address is required');
  } else if (!isValidEmail(to)) {
    errors.push(`Invalid recipient email format: ${to}`);
  }
  
  // Validate subject
  if (!isNotEmpty(subject)) {
    errors.push('Email subject cannot be empty');
  }
  
  // Validate body
  if (!body) {
    errors.push('Email body cannot be empty');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sends an email notification with input validation
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @param {Object} options - Additional options
 * @returns {Promise} - Resolves with send result or rejects with validation errors
 */
/**
 * Send an email notification
 * @param {string} recipient - Email address of the recipient
 * @param {string} message - The message to be sent
 * @param {Object} options - Additional options for the email
 * @returns {Promise<Object>} - Promise resolving to the result of the operation
 */
async function sendEmail(recipient, message, options = {}) {
  try {
    // Check if we're in mock mode
    const isMock = process.env.EMAIL_MOCK_MODE === 'true' || options.mockMode === true;
    
    // Log the attempt
    logger.logAttempt(recipient, message, options, isMock);
    
    // Simulate potential errors (for demonstration)
    if (recipient.includes('error') || (options.simulateError === true)) {
      throw new Error('Simulated email sending failure');
    }
    
    // For mock mode, don't actually try to send
    if (isMock) {
      // Log success with mock flag
      const result = {
        type: 'email',
        recipient,
        message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
        messageId: `mock-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date(),
        status: 'sent',
        isMock: true
      };
      
      // Log the sent notification with mock flag
      logger.logSent(recipient, message, options, true, {
        messageId: result.messageId
      });
      
      return result;
    }
    
    // In a real implementation, this would use an email service/library
    // Such as nodemailer, sendgrid, AWS SES, etc.
    
    // Simulate a delay that might happen with real email sending
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    
    // Return a response like a real email API might
    const result = {
      type: 'email',
      recipient,
      message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
      messageId: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Log the successful send
    logger.logSent(recipient, message, options, false, {
      messageId: result.messageId
    });
    
    return result;
  } catch (error) {
    // Log the failure
    logger.logFailed(recipient, message, error, options, 
                     process.env.EMAIL_MOCK_MODE === 'true' || options.mockMode === true);
    
    // Let the error propagate to be handled by the error handler wrapper
    throw error;
  }
  // try {
  //   // Simulate potential errors (for demonstration)
  //   if (recipient.includes('error') || (options.simulateError === true)) {
  //     throw new Error('Simulated email sending failure');
  //   }
    
  //   // In a real implementation, this would use an email service/library
  //   console.log(`[EMAIL] To: ${recipient} | Message: ${message}`);
  //   console.log(`[EMAIL] Options:`, options);
    
  //   // Simulate a delay that might happen with real email sending
  //   if (options.delay) {
  //     await new Promise(resolve => setTimeout(resolve, options.delay));
  //   }
    
  //   // Return a response like a real email API might
  //   return {
  //     type: 'email',
  //     recipient,
  //     message: message.length > 30 ? `${message.substring(0, 30)}...` : message,
  //     messageId: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  //     timestamp: new Date(),
  //     status: 'sent'
  //   };
  // } catch (error) {
  //   // Use the error handler to format and log the error
  //   throw error; // Let the dispatcher handle this
  // }
}

const send = errorHandler.withErrorHandling(sendEmail, 'email');

module.exports = {
  sendEmail,
  send,
  validateEmailInput  // Export the validation function for testing
};