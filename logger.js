/**
 * Notification Logger Module
 * 
 * Provides a centralized logging mechanism for all outgoing notifications,
 * with configurable output formats and destinations.
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const chalk = require('chalk'); // For colorful console output

// Configure logging
const LOG_DIRECTORY = process.env.LOG_DIRECTORY || 'logs';
const NOTIFICATIONS_LOG_FILE = path.join(LOG_DIRECTORY, 'notifications.log');
const MAX_MESSAGE_PREVIEW_LENGTH = process.env.MAX_MESSAGE_PREVIEW_LENGTH || 50;
const ENABLE_CONSOLE_LOGGING = process.env.ENABLE_CONSOLE_LOGGING !== 'false';
const ENABLE_FILE_LOGGING = process.env.ENABLE_FILE_LOGGING !== 'false';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; // debug, info, warn, error

// Create log directory if it doesn't exist
try {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error.message);
}

/**
 * Log levels with their numeric priorities
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2, 
  error: 3
};

/**
 * Check if a given log level should be logged based on the configured level
 * 
 * @param {string} level - The log level to check
 * @returns {boolean} - Whether this level should be logged
 */
function shouldLog(level) {
  const configuredLevelPriority = LOG_LEVELS[LOG_LEVEL] || 1; // Default to info
  const requestedLevelPriority = LOG_LEVELS[level] || 1;
  
  return requestedLevelPriority >= configuredLevelPriority;
}

/**
 * Format a message for preview
 * 
 * @param {string} message - The full message
 * @returns {string} - Truncated message preview
 */
function formatMessagePreview(message) {
  if (!message) return '(no message)';
  
  if (message.length <= MAX_MESSAGE_PREVIEW_LENGTH) {
    return message;
  }
  
  return `${message.substring(0, MAX_MESSAGE_PREVIEW_LENGTH)}...`;
}

/**
 * Format a notification for logging
 * 
 * @param {Object} notification - The notification object
 * @returns {Object} - Formatted log entry
 */
function formatForLog(notification) {
  const { type, recipient, message, options, status, dispatched, isMock } = notification;
  
  return {
    timestamp: new Date().toISOString(),
    type: type || 'unknown',
    recipient: recipient || 'unknown',
    messagePreview: formatMessagePreview(message),
    options: options ? JSON.stringify(options) : '{}',
    status: status || (dispatched ? 'sent' : 'failed'),
    mock: isMock ? true : false,
    ...notification.meta
  };
}

/**
 * Get ANSI color for notification type
 * 
 * @param {string} type - Notification type
 * @returns {Function} - Chalk color function
 */
function getColorForType(type) {
  const colors = {
    email: chalk.blue,
    sms: chalk.green,
    push: chalk.magenta,
    default: chalk.white
  };
  
  return colors[type] || colors.default;
}

/**
 * Get symbol for notification status
 * 
 * @param {string} status - Notification status
 * @param {boolean} isMock - Whether this was a mock/simulated notification
 * @returns {string} - Status symbol
 */
function getStatusSymbol(status, isMock) {
  if (isMock) {
    return chalk.yellow('⊘'); // Simulated (not actually sent)
  }
  
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'success':
      return chalk.green('✓'); // Success
    case 'failed':
    case 'error':
      return chalk.red('✗'); // Failure
    case 'pending':
    case 'queued':
      return chalk.blue('⋯'); // Pending
    default:
      return chalk.gray('?'); // Unknown
  }
}

/**
 * Format a notification for console output
 * 
 * @param {Object} notification - The notification data
 * @returns {string} - Formatted string for console
 */
function formatForConsole(notification) {
  const { 
    timestamp, 
    type, 
    recipient, 
    messagePreview, 
    status = 'unknown',
    mock = false
  } = formatForLog(notification);
  
  // Get the right color for this notification type
  const typeColor = getColorForType(type);
  
  // Build a nicely formatted, colorful console output
  const time = new Date(timestamp).toLocaleTimeString();
  const statusSymbol = getStatusSymbol(status, mock);
  const mockLabel = mock ? chalk.yellow(' [MOCK]') : '';
  
  return [
    chalk.gray(`[${time}]`),
    statusSymbol,
    typeColor.bold(`[${type.toUpperCase()}]`),
    chalk.white(`To: ${recipient}`),
    mockLabel,
    chalk.gray('|'),
    chalk.white(messagePreview)
  ].join(' ');
}

/**
 * Log a notification to the console and/or log file
 * 
 * @param {Object} notification - The notification object 
 * @param {string} level - Log level (debug, info, warn, error)
 */
function logNotification(notification, level = 'info') {
  // Skip logging if this level shouldn't be logged
  if (!shouldLog(level)) {
    return;
  }
  
  try {
    // Format the notification for logging
    const logEntry = formatForLog(notification);
    const consoleFormatted = formatForConsole(notification);
    
    // Console logging (if enabled)
    if (ENABLE_CONSOLE_LOGGING) {
      if (level === 'debug') console.debug(consoleFormatted);
      else if (level === 'warn') console.warn(consoleFormatted);
      else if (level === 'error') console.error(consoleFormatted);
      else console.log(consoleFormatted);
    }
    
    // File logging (if enabled)
    if (ENABLE_FILE_LOGGING) {
      const logString = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(NOTIFICATIONS_LOG_FILE, logString);
    }
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

/**
 * Log a notification that was successfully sent
 * 
 * @param {string} type - Notification type (email, sms, etc.)
 * @param {string} recipient - Recipient of the notification
 * @param {string} message - Message content
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [isMock=false] - Whether this was a simulated message
 * @param {Object} [meta={}] - Additional metadata to include
 */
function logSentNotification(type, recipient, message, options = {}, isMock = false, meta = {}) {
  logNotification({
    type,
    recipient,
    message,
    options,
    status: 'sent',
    dispatched: true,
    isMock,
    meta
  }, 'info');
}

/**
 * Log a notification that failed to send
 * 
 * @param {string} type - Notification type (email, sms, etc.)
 * @param {string} recipient - Recipient of the notification
 * @param {string} message - Message content
 * @param {string|Error} error - The error that occurred
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [isMock=false] - Whether this was a simulated message
 * @param {Object} [meta={}] - Additional metadata to include
 */
function logFailedNotification(type, recipient, message, error, options = {}, isMock = false, meta = {}) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  logNotification({
    type,
    recipient,
    message,
    options,
    status: 'failed',
    dispatched: false,
    error: errorMessage,
    isMock,
    meta
  }, 'error');
}

/**
 * Log a notification dispatch attempt (before sending)
 * 
 * @param {string} type - Notification type (email, sms, etc.)
 * @param {string} recipient - Recipient of the notification
 * @param {string} message - Message content
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [isMock=false] - Whether this is a simulated message
 */
function logNotificationAttempt(type, recipient, message, options = {}, isMock = false) {
  logNotification({
    type,
    recipient,
    message,
    options,
    status: 'pending',
    isMock,
    meta: {
      stage: 'attempt'
    }
  }, 'debug');
}

/**
 * Get the contents of the notification log
 * 
 * @param {number} [maxLines=100] - Maximum number of lines to return
 * @returns {string} - The notification log contents
 */
function getNotificationLog(maxLines = 100) {
  try {
    if (!fs.existsSync(NOTIFICATIONS_LOG_FILE)) {
      return 'No notification log file exists';
    }
    
    const content = fs.readFileSync(NOTIFICATIONS_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    
    // Return last N lines
    return lines.slice(-maxLines);
  } catch (error) {
    return `Failed to read notification log: ${error.message}`;
  }
}

/**
 * Clear the notification log file
 */
function clearNotificationLog() {
  try {
    fs.writeFileSync(NOTIFICATIONS_LOG_FILE, '');
  } catch (error) {
    console.error('Failed to clear notification log:', error.message);
  }
}

/**
 * Create a logger instance for a specific notification type
 * 
 * @param {string} type - Notification type (email, sms, etc.)
 * @returns {Object} - Logger methods specific to this type
 */
function createTypedLogger(type) {
  return {
    logSent: (recipient, message, options, isMock, meta) => 
      logSentNotification(type, recipient, message, options, isMock, meta),
      
    logFailed: (recipient, message, error, options, isMock, meta) =>
      logFailedNotification(type, recipient, message, error, options, isMock, meta),
      
    logAttempt: (recipient, message, options, isMock) =>
      logNotificationAttempt(type, recipient, message, options, isMock)
  };
}

module.exports = {
  logSentNotification,
  logFailedNotification,
  logNotificationAttempt,
  getNotificationLog,
  clearNotificationLog,
  createTypedLogger,
  // Also export utility methods that might be useful
  formatMessagePreview,
  shouldLog
};
