/**
 * Email notification module
 * 
 * This module provides functionality to send email notifications
 * using Nodemailer with environment-based configuration
 */

const nodemailer = require('nodemailer');
const config = require('../config.js');
const { isValidEmail, isNotEmpty } = require('../utilities/validators');

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
async function sendEmail(to, subject, body, options = {}) {
  // Validate input parameters
  const validation = validateEmailInput(to, subject, body);
  
  if (!validation.isValid) {
    const errorMessage = `Email validation failed: ${validation.errors.join('; ')}`;
    console.error(errorMessage);
    
    // Reject with validation errors
    return Promise.reject({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errorMessage,
      details: validation.errors
    });
  }
  
  // Get from address from options or default from config
  const from = options.from || config.email.defaultFrom;
  
  // Validate sender email if provided in options
  if (options.from && !isValidEmail(options.from)) {
    const errorMessage = `Invalid sender email format: ${options.from}`;
    console.error(errorMessage);
    
    return Promise.reject({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errorMessage
    });
  }
  
  // Use mock implementation in development or mock mode
  if (process.env.EMAIL_MODE === 'mock' || config.isDev) {
    return sendEmailMock(to, subject, body, { ...options, from });
  }
  
  // Initialize transporter if not already done
  if (!transporter) {
    transporter = initTransporter();
  }
  
  try {
    // Send email using nodemailer
    const result = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      text: body,
      html: options.html || body
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw {
      success: false,
      error: 'SEND_ERROR',
      message: `Failed to send email: ${error.message}`,
      originalError: error
    };
  }
}

module.exports = {
  sendEmail,
  validateEmailInput  // Export the validation function for testing
};