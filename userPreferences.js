/**
 * User Notification Preferences Module
 * 
 * Manages user opt-in/opt-out preferences for different notification channels.
 * Provides a centralized system to check and update user preferences with
 * persistence to a JSON file.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PREFERENCES_FILE = process.env.PREFERENCES_FILE || 'data/user-preferences.json';
const PREFERENCES_DIR = path.dirname(PREFERENCES_FILE);

// In-memory store for user preferences
let preferencesStore = {};

// Ensure preferences directory exists
try {
  if (!fs.existsSync(PREFERENCES_DIR)) {
    fs.mkdirSync(PREFERENCES_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Failed to create preferences directory:', error.message);
}

/**
 * Initialize the preferences store from the JSON file if it exists
 * 
 * @returns {boolean} Whether initialization was successful
 */
function initializePreferences() {
  try {
    if (fs.existsSync(PREFERENCES_FILE)) {
      const data = fs.readFileSync(PREFERENCES_FILE, 'utf8');
      preferencesStore = JSON.parse(data);
      return true;
    }
    
    // File doesn't exist yet, save empty preferences
    savePreferences();
    return true;
  } catch (error) {
    console.error('Failed to initialize preferences:', error.message);
    return false;
  }
}

/**
 * Save the current preferences store to the JSON file
 * 
 * @returns {boolean} Whether the save was successful
 */
function savePreferences() {
  try {
    const data = JSON.stringify(preferencesStore, null, 2);
    fs.writeFileSync(PREFERENCES_FILE, data, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save preferences:', error.message);
    return false;
  }
}

/**
 * Validate a user ID or email
 * 
 * @param {string} userId - User ID or email to validate
 * @returns {boolean} Whether the ID is valid
 */
function isValidUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  
  // If it's an email, validate email format
  if (userId.includes('@')) {
    // Simple email validation regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
  }
  
  // Otherwise, ensure it's not empty and at least 3 characters
  return userId.trim().length >= 3;
}

/**
 * Create default preferences object for a new user
 * 
 * @returns {Object} Default preferences object
 */
function createDefaultPreferences() {
  return {
    emailEnabled: true,  // Default to opt-in for email
    smsEnabled: false,   // Default to opt-out for SMS (requires explicit opt-in)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Create default preferences object for a new user
 * 
 * @param {Object} [overrides={}] - Override default values
 * @returns {Object} Default preferences object
 */
function createDefaultPreferences(overrides = {}) {
  return {
    emailEnabled: true,  // Default to opt-in for email
    smsEnabled: false,   // Default to opt-out for SMS (requires explicit opt-in)
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Initialize a new user with both email and SMS notification preferences enabled
 * 
 * This function only creates the user if they don't already exist in the preferences store.
 * 
 * @param {string} userId - User ID or email 
 * @returns {Object|null} The new user preferences or null if user already exists/invalid ID
 */
function initializeNewUserWithAllEnabled(userId) {
  // Validate user ID
  if (!isValidUserId(userId)) {
    console.error(`Invalid user ID: ${userId}`);
    return null;
  }
  
  // Check if user already exists
  if (preferencesStore[userId]) {
    console.log(`User ${userId} already exists in preferences store. No changes made.`);
    return null; // User already exists, don't overwrite
  }
  
  // Create new user with both email and SMS enabled
  const preferences = createDefaultPreferences({
    emailEnabled: true,
    smsEnabled: true
  });
  
  // Store in the preferences object
  preferencesStore[userId] = preferences;
  
  // Save to file
  savePreferences();

  console.log(`Successfully added and initialized new user: ${userId}`);
  
  return preferences;
}

/**
 * Check if a user has opted in to a specific notification channel
 * 
 * @param {string} userId - User ID or email
 * @param {string} channel - Notification channel ('email' or 'sms')
 * @returns {boolean} Whether the user has opted in
 */
function hasUserOptedIn(userId, channel) {
  // Default response if invalid input
  if (!isValidUserId(userId) || !channel) {
    return false;
  }
  
  // Get user preferences
  const preferences = getUserPreferences(userId);
  
  // Check the appropriate preference based on channel
  switch (channel.toLowerCase()) {
    case 'email':
      return preferences.emailEnabled === true;
    case 'sms':
      return preferences.smsEnabled === true;
    default:
      console.error(`Unknown notification channel: ${channel}`);
      return false;
  }
}

/**
 * Update a user's notification preferences
 * 
 * @param {string} userId - User ID or email
 * @param {Object} updates - Preference updates to apply
 * @returns {Object|null} Updated preferences or null if failed
 */
function updateUserPreferences(userId, updates) {
  // Validate user ID
  if (!isValidUserId(userId)) {
    console.error(`Invalid user ID: ${userId}`);
    return null;
  }
  
  // Ensure updates is an object
  if (!updates || typeof updates !== 'object') {
    console.error('Updates must be an object');
    return null;
  }
  
  // Get current preferences or defaults
  const currentPrefs = getUserPreferences(userId);
  
  // Apply updates
  const updatedPrefs = {
    ...currentPrefs,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // Store updated preferences
  preferencesStore[userId] = updatedPrefs;
  
  // Persist to file
  savePreferences();
  
  return updatedPrefs;
}

/**
 * Set a user's opt-in status for a specific channel
 * 
 * @param {string} userId - User ID or email
 * @param {string} channel - Notification channel ('email' or 'sms')
 * @param {boolean} optIn - Whether to opt in (true) or out (false)
 * @returns {boolean} Whether the update was successful
 */
function setChannelOptInStatus(userId, channel, optIn) {
  // Validate inputs
  if (!isValidUserId(userId) || !channel) {
    return false;
  }
  
  // Ensure optIn is a boolean
  const optInValue = optIn === true;
  
  // Prepare the update
  const updates = {};
  
  // Set the appropriate field based on channel
  switch (channel.toLowerCase()) {
    case 'email':
      updates.emailEnabled = optInValue;
      break;
    case 'sms':
      updates.smsEnabled = optInValue;
      break;
    default:
      console.error(`Unknown notification channel: ${channel}`);
      return false;
  }
  
  // Perform the update
  const result = updateUserPreferences(userId, updates);
  
  return result !== null;
}

/**
 * Remove a user's preferences
 * 
 * @param {string} userId - User ID or email
 * @returns {boolean} Whether the removal was successful
 */
function removeUserPreferences(userId) {
  // Validate user ID
  if (!isValidUserId(userId) || !preferencesStore[userId]) {
    return false;
  }
  
  // Remove from store
  delete preferencesStore[userId];
  
  // Persist changes
  return savePreferences();
}

/**
 * Get all user preferences
 * 
 * @returns {Object} All user preferences
 */
function getAllPreferences() {
  return { ...preferencesStore };
}

/**
 * Import preferences from a JSON object
 * 
 * @param {Object} data - Preferences data to import
 * @param {boolean} [merge=true] - Whether to merge with existing data (true) or replace (false)
 * @returns {boolean} Whether the import was successful
 */
function importPreferences(data, merge = true) {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Import data must be an object');
    }
    
    // Merge or replace
    if (merge) {
      preferencesStore = {
        ...preferencesStore,
        ...data
      };
    } else {
      preferencesStore = { ...data };
    }
    
    return savePreferences();
  } catch (error) {
    console.error('Failed to import preferences:', error.message);
    return false;
  }
}

/**
 * Export preferences to a JSON file
 * 
 * @param {string} [filePath=null] - Optional custom file path
 * @returns {boolean} Whether the export was successful
 */
function exportPreferences(filePath = null) {
  try {
    const targetPath = filePath || PREFERENCES_FILE;
    const data = JSON.stringify(preferencesStore, null, 2);
    
    // Ensure directory exists
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(targetPath, data, 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to export preferences:', error.message);
    return false;
  }
}

/**
 * Update preferences for an existing user only with strict validation
 * 
 * Unlike updateUserPreferences, this function will not create a new user
 * if they don't exist. It only updates existing users and enforces strict
 * data type validation.
 * 
 * @param {string} userId - User ID or email
 * @param {Object} preferences - Object containing preferences to update
 * @param {boolean} [preferences.emailEnabled] - Whether email notifications are enabled
 * @param {boolean} [preferences.smsEnabled] - Whether SMS notifications are enabled
 * @returns {Object|{error: string}} - Updated preferences or error object with description
 */
function updateExistingUserPreferences(userId, preferences) {
  // Validate user ID
  if (!isValidUserId(userId)) {
    const error = `Invalid user ID: ${userId}`;
    console.error(error);
    return { error };
  }
  
  // Validate preferences object
  if (!preferences || typeof preferences !== 'object') {
    const error = 'Preferences must be a valid object';
    console.error(error);
    return { error };
  }
  
  // Check if user exists
  if (!preferencesStore[userId]) {
    const error = `User ${userId} not found in preferences store`;
    console.error(error);
    return { error };
  }
  
  // Validate email preference if provided
  if ('emailEnabled' in preferences) {
    if (typeof preferences.emailEnabled !== 'boolean') {
      const error = `Invalid emailEnabled value: ${preferences.emailEnabled}. Must be a boolean.`;
      console.error(error);
      return { error };
    }
  }
  
  // Validate SMS preference if provided
  if ('smsEnabled' in preferences) {
    if (typeof preferences.smsEnabled !== 'boolean') {
      const error = `Invalid smsEnabled value: ${preferences.smsEnabled}. Must be a boolean.`;
      console.error(error);
      return { error };
    }
  }
  
  // If no preference fields provided, return error
  if (!('emailEnabled' in preferences) && !('smsEnabled' in preferences)) {
    const error = 'No preference fields provided. Must include emailEnabled and/or smsEnabled.';
    console.error(error);
    return { error };
  }
  
  // Create a new preferences object with only validated fields
  const updates = {};
  
  // Only include valid preference fields
  if ('emailEnabled' in preferences) {
    updates.emailEnabled = preferences.emailEnabled;
  }
  
  if ('smsEnabled' in preferences) {
    updates.smsEnabled = preferences.smsEnabled;
  }
  
  // Update the user's preferences
  const updatedPrefs = {
    ...preferencesStore[userId],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  // Store updated preferences
  preferencesStore[userId] = updatedPrefs;
  
  // Persist to file
  savePreferences();
  
  return updatedPrefs;
}

/**
 * Get preferences for a specific user, creating default preferences if user doesn't exist
 * 
 * If the user doesn't exist in the preferences data, this function will automatically
 * initialize them with default preferences and persist this to the JSON file.
 * 
 * @param {string} userId - User ID or email
 * @param {Object} [defaultOverrides={}] - Override default values if creating new user
 * @returns {Object|null} User preferences or null if invalid userId
 */
function getUserPreferences(userId, defaultOverrides = {}) {
  // Validate user ID
  if (!isValidUserId(userId)) {
    console.error(`Invalid user ID: ${userId}`);
    return null;
  }
  
  // Check if user exists in the preferences store
  if (!preferencesStore[userId]) {
    // User doesn't exist - create default preferences
    console.log(`Creating default preferences for new user: ${userId}`);
    
    // Create default preferences with any overrides
    const defaultPrefs = createDefaultPreferences(defaultOverrides);
    
    // Store in preferences store
    preferencesStore[userId] = defaultPrefs;
    
    // Persist to file
    savePreferences();
    
    console.log(`Default preferences created and saved for: ${userId}`);
  }

  console.log(`User Preference for email: ${preferencesStore[userId].emailEnabled}`);
  console.log(`User Preference for sms: ${preferencesStore[userId].smsEnabled}`);

  // Return existing (or newly created) preferences
  return preferencesStore[userId];
}

/**
 * Initialize default preferences for multiple users
 * 
 * This function takes an array of user IDs and creates default preferences
 * for each user that doesn't already exist in the preferences store.
 * It skips users who already have preferences.
 * 
 * @param {string[]} userIds - Array of user IDs or emails
 * @param {Object} [defaultOverrides={}] - Override default values if creating new users
 * @returns {Object} Stats object with counts of processed users
 */
function initializeUserPreferences(userIds, defaultOverrides = {}) {
  // Validate input
  if (!Array.isArray(userIds)) {
    console.error('User IDs must be provided as an array');
    return { 
      success: false, 
      totalUsers: 0,
      newUsers: 0,
      skippedUsers: 0,
      invalidUsers: 0 
    };
  }

  // Stats to return
  const stats = {
    success: true,
    totalUsers: userIds.length,
    newUsers: 0,
    skippedUsers: 0,
    invalidUsers: 0
  };

  // Process each user ID
  for (const userId of userIds) {
    // Validate the user ID
    if (!isValidUserId(userId)) {
      console.error(`Skipping invalid user ID: ${userId}`);
      stats.invalidUsers++;
      continue;
    }
    
    // Check if user already exists in preferences store
    if (preferencesStore[userId]) {
      console.log(`User ${userId} already has preferences, skipping`);
      stats.skippedUsers++;
      continue;
    }
    
    // User doesn't exist - create default preferences
    console.log(`Creating default preferences for new user: ${userId}`);
    
    // Create default preferences with any overrides
    const defaultPrefs = createDefaultPreferences(defaultOverrides);
    
    // Store in preferences store
    preferencesStore[userId] = defaultPrefs;
    
    stats.newUsers++;
  }
  
  // Save the updated preferences to file
  if (stats.newUsers > 0) {
    savePreferences();
    console.log(`Default preferences created for ${stats.newUsers} new users`);
  }
  
  return stats;
}

/**
 * Toggle a user's notification preference for a specific channel
 * 
 * This function flips the current boolean value of the specified channel's preference,
 * turning true to false or false to true. It also updates the updatedAt timestamp.
 * 
 * @param {string} userId - User ID or email
 * @param {string} channel - Notification channel ('email' or 'sms')
 * @returns {Object|null} Updated preferences object or null if failed
 */
function toggleChannelPreference(userId, channel) {
  // Validate inputs
  if (!isValidUserId(userId)) {
    console.error(`Invalid user ID: ${userId}`);
    return null;
  }
  
  if (!channel) {
    console.error('Channel must be specified');
    return null;
  }
  
  // Get current preferences (will create default if user doesn't exist)
  const currentPrefs = getUserPreferences(userId);
  if (!currentPrefs) {
    console.error(`Could not get preferences for user: ${userId}`);
    return null;
  }
  
  // Prepare the update
  const updates = {};
  
  // Determine which preference to toggle based on the channel
  switch (channel.toLowerCase()) {
    case 'email':
      // Flip the current value
      updates.emailEnabled = !currentPrefs.emailEnabled;
      console.log(`Toggling email preference for ${userId} from ${currentPrefs.emailEnabled} to ${updates.emailEnabled}`);
      break;
      
    case 'sms':
      // Flip the current value
      updates.smsEnabled = !currentPrefs.smsEnabled;
      console.log(`Toggling SMS preference for ${userId} from ${currentPrefs.smsEnabled} to ${updates.smsEnabled}`);
      break;
      
    default:
      console.error(`Unknown notification channel: ${channel}`);
      return null;
  }
  
  // Update the preference and get the result
  const updatedPrefs = updateUserPreferences(userId, updates);
  
  return updatedPrefs;
}

/**
 * Initialize a new user with both email and SMS notification preferences enabled
 * 
 * This function only creates the user if they don't already exist in the preferences store.
 * 
 * @param {string} userId - User ID or email 
 * @returns {Object|null} The new user preferences or null if user already exists/invalid ID
 */

// Initialize preferences when the module is loaded
initializePreferences();

// Export public API
module.exports = {
  hasUserOptedIn,
  updateUserPreferences,
  setChannelOptInStatus,
  removeUserPreferences,
  getAllPreferences,
  importPreferences,
  exportPreferences,
  initializeNewUserWithAllEnabled,
  updateExistingUserPreferences,
  getUserPreferences,
  initializeUserPreferences,
  toggleChannelPreference
};