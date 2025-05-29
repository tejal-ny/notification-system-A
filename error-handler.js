

/**
 * Error Handler Module
 * 
 * Provides centralized error handling for the notification system.
 * Includes logging, formatting, and error response preparation.
 */

const path = require('path');
const fs = require('fs');

// Configure error logging
const LOG_DIRECTORY = process.env.LOG_DIRECTORY || 'logs';
const ERROR_LOG_FILE = path.join(LOG_DIRECTORY, 'error.log');
const MAX_LOG_LENGTH = 10000;

// Create log directory if it doesn't exist
try {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create log directory:', error.message);
}

/**
 * Log an error to the console and to file
 * 
 * @param {string} channel - The notification channel (email, sms, etc.)
 * @param {string} recipient - The recipient of the notification
 * @param {Error|string} error - The error object or message
 * @param {Object} [additionalInfo={}] - Any additional information to log
 */
function logError(channel, recipient, error, additionalInfo = {}) {
  // Sanitize recipient for logging to protect privacy
  const sanitizedRecipient = sanitizeRecipient(recipient);
  
  // Format the error message
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : null;
  
  // Create a timestamp
  const timestamp = new Date().toISOString();
  
  // Format the log entry
  const logEntry = {
    timestamp,
    channel,
    recipient: sanitizedRecipient,
    error: errorMessage,
    stack: errorStack,
    ...additionalInfo
  };
  
  // Log to console
  console.error(`[${timestamp}] [ERROR] [${channel.toUpperCase()}] Recipient: ${sanitizedRecipient} | Error: ${errorMessage}`);
  
  // Additional details in debug mode
  if (process.env.DEBUG === 'true' && errorStack) {
    console.error('Stack trace:', errorStack);
  }
  
  // Log to file
  try {
    const logString = JSON.stringify(logEntry, null, process.env.DEBUG === 'true' ? 2 : 0) + '\n';
    fs.appendFileSync(ERROR_LOG_FILE, logString);
  } catch (fileError) {
    // If file logging fails, at least log that to console
    console.error('Failed to write to error log file:', fileError.message);
  }
  
  return logEntry;
}

/**
 * Sanitize recipient information for logging to protect privacy
 * 
 * @param {string} recipient - The recipient to sanitize
 * @returns {string} - Sanitized recipient string
 */
function sanitizeRecipient(recipient) {
  if (!recipient) return 'unknown';
  
  // Email sanitization (show first 3 chars and domain)
  if (recipient.includes('@')) {
    const [localPart, domain] = recipient.split('@');
    if (localPart.length <= 3) {
      return recipient; // Too short to meaningfully redact
    }
    return `${localPart.substring(0, 3)}***@${domain}`;
  }
  
  // Phone number sanitization (show only last 4 digits)
  if (recipient.match(/^\+?[0-9\s\-()]{10,}$/)) {
    return recipient.replace(/[^0-9]/g, '').replace(/^(.*)(\d{4})$/, '******$2');
  }
  
  // Default sanitization for other types
  if (recipient.length > 6) {
    return recipient.substring(0, 3) + '***' + recipient.substring(recipient.length - 3);
  }
  
  return recipient;
}

/**
 * Prepare an error response object to return to the caller
 *
 * @param {string} channel - The notification channel (email, sms, etc.)
 * @param {string} recipient - The recipient of the notification
 * @param {string} message - The message content (truncated if too long)
 * @param {Error|string} error - The error that occurred
 * @param {Object} [additionalFields={}] - Any additional fields for the response
 * @returns {Object} - Formatted error response
 */
function prepareErrorResponse(channel, recipient, message, error, additionalFields = {}) {
  // Log the error
  const loggedError = logError(channel, recipient, error, {
    messagePreview: message?.substring(0, 50)
  });
  
  // Prepare a sanitized response that doesn't expose sensitive details
  return {
    type: channel,
    recipient: sanitizeRecipient(recipient),
    message: message ? (message.length > 20 ? `${message.substring(0, 20)}...` : message) : null,
    status: 'failed',
    error: error instanceof Error ? error.message : error,
    errorId: generateErrorId(loggedError.timestamp),
    dispatched: false,
    dispatchTimestamp: new Date(),
    ...additionalFields
  };
}

/**
 * Generate a unique error ID based on timestamp
 * 
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Unique error ID
 */
function generateErrorId(timestamp) {
  // Create a unique-ish error ID for reference
  const stripped = timestamp.replace(/[-:.TZ]/g, '');
  const random = Math.floor(Math.random() * 1000);
  return `err-${stripped}-${random}`;
}

/**
 * Handle a thrown exception centrally
 * 
 * @param {string} channel - The notification channel
 * @param {string} recipient - The recipient
 * @param {string} message - The message content
 * @param {Error|string} error - The error that occurred 
 * @param {Object} [options={}] - Additional options
 * @returns {Object} - Error response object
 */
function handleException(channel, recipient, message, error, options = {}) {
  return prepareErrorResponse(channel, recipient, message, error, options);
}

/**
 * Wraps a function with error handling
 *
 * @param {Function} fn - The function to wrap
 * @param {string} channel - The channel name for error reporting
 * @returns {Function} - The wrapped function
 */
function withErrorHandling(fn, channel) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      const [recipient, message, options] = args;
      return handleException(channel, recipient, message, error, options);
    }
  };
}

/**
 * Clear the error log file (mainly for testing)
 */
function clearErrorLog() {
  try {
    fs.writeFileSync(ERROR_LOG_FILE, '');
  } catch (error) {
    console.error('Failed to clear error log:', error.message);
  }
}

/**
 * Get the contents of the error log (mainly for monitoring)
 * 
 * @param {number} [maxLines=100] - Maximum number of lines to return
 * @returns {string} - The error log contents
 */
function getErrorLog(maxLines = 100) {
  try {
    if (!fs.existsSync(ERROR_LOG_FILE)) {
      return 'No error log file exists';
    }
    
    const content = fs.readFileSync(ERROR_LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    
    // Return last N lines
    return lines.slice(-maxLines).join('\n');
  } catch (error) {
    return `Failed to read error log: ${error.message}`;
  }
}

module.exports = {
  logError,
  prepareErrorResponse,
  handleException,
  withErrorHandling,
  clearErrorLog,
  getErrorLog
};
