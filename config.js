/**
 * Configuration module for the notification system
 * Loads environment variables and provides configuration settings
 */

// Load environment variables from .env file
require('dotenv').config();

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  defaultFrom: process.env.EMAIL_FROM || 'notification-system@example.com'
};



// SMS configuration
const smsConfig = {
  provider: process.env.SMS_PROVIDER || 'mock',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  defaultFrom: process.env.TWILIO_PHONE_NUMBER
};

// Validate required configuration
function validateConfig() {
  const missingVars = [];
  
  // Validate email configuration if we're not in mock mode
  if (process.env.EMAIL_MODE !== 'mock') {
    if (!emailConfig.host) missingVars.push('EMAIL_HOST');
    if (!emailConfig.auth.user) missingVars.push('EMAIL_USER');
    if (!emailConfig.auth.pass) missingVars.push('EMAIL_PASSWORD');
  }
  
  // Validate SMS configuration if we're using Twilio
  if (process.env.SMS_PROVIDER === 'twilio' && process.env.SMS_MODE !== 'mock') {
    if (!smsConfig.twilioAccountSid) missingVars.push('TWILIO_ACCOUNT_SID');
    if (!smsConfig.twilioAuthToken) missingVars.push('TWILIO_AUTH_TOKEN');
    if (!smsConfig.defaultFrom) missingVars.push('TWILIO_PHONE_NUMBER');
  }
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('Some notification functionality may be limited. Check your .env file.');
  }
}

// Environment settings
const environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// Export configuration
module.exports = {
  email: emailConfig,
  sms: smsConfig,
  isDev: process.env.NODE_ENV !== 'production',
  validateConfig
};