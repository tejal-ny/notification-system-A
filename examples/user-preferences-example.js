const userPreferences = require('../userPreferences');

// Example usage: Check user preferences
console.log('\n--- Checking User Preferences ---');
const johnPrefs = userPreferences.getUserPreferences('john.doe@example.com');
console.log('John\'s preferences:', johnPrefs);

// Example usage: Check opt-in status
console.log('\n--- Checking Opt-In Status ---');
const isJohnEmailOptedIn = userPreferences.hasUserOptedIn('john.doe@example.com', 'email');
const isJohnSmsOptedIn = userPreferences.hasUserOptedIn('john.doe@example.com', 'sms');
console.log('John opted in to email?', isJohnEmailOptedIn);
console.log('John opted in to SMS?', isJohnSmsOptedIn);

// Example usage: Update preferences
console.log('\n--- Updating User Preferences ---');
const updatedPrefs = userPreferences.updateUserPreferences('jane.doe@example.com', {
  emailEnabled: true,
  smsEnabled: true
});
console.log('Jane\'s updated preferences:', updatedPrefs);

// Example usage: Opt out of email
console.log('\n--- Opting Out of Email ---');
userPreferences.setChannelOptInStatus('jane.doe@example.com', 'email', false);
const janePrefs = userPreferences.getUserPreferences('jane.doe@example.com');
console.log('Jane\'s preferences after opt-out:', janePrefs);

// Example usage: Check multiple users
console.log('\n--- All User Preferences ---');
console.log(userPreferences.getAllPreferences());

// Example usage: Remove a user's preferences
console.log('\n--- Removing User Preferences ---');
userPreferences.removeUserPreferences('temp-user@example.com');

// Example usage: Initialize a new user with all channels enabled
console.log('\n--- Initializing New User with All Channels Enabled ---');
const newUser = 'new.user@example.com';
const initResult = userPreferences.initializeNewUserWithAllEnabled(newUser);
console.log(`New user ${newUser} initialized:`, initResult);

// Try initializing the same user again (should not overwrite)
console.log('\n--- Attempting to Re-Initialize Existing User ---');
const retryResult = userPreferences.initializeNewUserWithAllEnabled(newUser);
console.log('Result of re-initialization attempt:', retryResult);

// Example usage: Export preferences to a custom file
console.log('\n--- Exporting Preferences ---');
const exportSuccess = userPreferences.exportPreferences('data/preferences-backup.json');
console.log('Export successful?', exportSuccess);

// Example usage: Update existing user's preferences
console.log('\n--- Updating Existing User\'s Preferences ---');
// First let's try to update a non-existent user
const nonExistentUpdate = userPreferences.updateExistingUserPreferences(
  'non.existent@example.com', 
  { emailEnabled: false }
);
console.log('Update non-existent user result:', nonExistentUpdate);

// Now update an existing user
const existingUpdate = userPreferences.updateExistingUserPreferences(
  newUser, 
  { smsEnabled: false }
);
console.log('Updated preferences for existing user:', existingUpdate);

// Update with multiple values
const multiUpdate = userPreferences.updateExistingUserPreferences(
  'jane.doe@example.com',
  { emailEnabled: true, smsEnabled: true }
);
console.log('Multiple preferences update result:', multiUpdate);

// Example usage: Update existing user's preferences with enhanced validation
console.log('\n--- Updating Existing User\'s Preferences (With Enhanced Validation) ---');

// Try updating with invalid data types
console.log('\n--- Testing Validation with Invalid Data Types ---');

// String instead of boolean
const invalidTypeUpdate = userPreferences.updateExistingUserPreferences(
  newUser, 
  { emailEnabled: "true" }  // String instead of boolean
);
console.log('Invalid data type update result:', invalidTypeUpdate);

// Update with undefined values
const noFieldsUpdate = userPreferences.updateExistingUserPreferences(
  newUser, 
  { otherField: true }  // No valid preference fields
);
console.log('No valid fields update result:', noFieldsUpdate);

// Now update with valid data
console.log('\n--- Updates with Valid Data ---');

// Single field update
const singleFieldUpdate = userPreferences.updateExistingUserPreferences(
  newUser, 
  { smsEnabled: false }
);
console.log('Single field update result:', 
  'error' in singleFieldUpdate ? singleFieldUpdate.error : 'Success!');
console.log('Updated preferences:', singleFieldUpdate);

// Multiple fields update
const multiFieldUpdate = userPreferences.updateExistingUserPreferences(
  'jane.doe@example.com',
  { emailEnabled: true, smsEnabled: true }
);
console.log('Multiple fields update result:', 
  'error' in multiFieldUpdate ? multiFieldUpdate.error : 'Success!');
console.log('Updated preferences:', multiFieldUpdate);