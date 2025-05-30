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

// Example usage: Export preferences to a custom file
console.log('\n--- Exporting Preferences ---');
const exportSuccess = userPreferences.exportPreferences('data/preferences-backup.json');
console.log('Export successful?', exportSuccess);