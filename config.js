/**
 * Configuration module for the notification system
 * Loads environment variables and provides configuration settings
 */

// Load environment variables from .env file
require('dotenv').config();

// Email configuration
const email = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  defaultFrom: process.env.EMAIL_FROM || 'notification-system@example.com'
};

// Environment settings
const environment = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test'
};

// Export configuration
module.exports = {
  email,
  environment
};