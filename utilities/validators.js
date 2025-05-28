/**
 * Validation utility functions
 * 
 * Contains functions for validating different types of input
 */

/**
 * Validates email address format
 * 
 * Tests if a string is a valid email address according to RFC 5322 Official Standard
 * 
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Email validation regex pattern
  // This pattern follows RFC 5322 standards for email validation
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  return emailRegex.test(email.trim());
}

/**
 * Validates if a string is not empty (after trimming)
 * 
 * @param {string} str - The string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function isNotEmpty(str) {
  if (typeof str !== 'string') return false;
  return str.trim().length > 0;
}

module.exports = {
  isValidEmail,
  isNotEmpty
};