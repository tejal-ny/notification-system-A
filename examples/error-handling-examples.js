


/**
 * Error Handling Examples
 * 
 * This file demonstrates the error handling capabilities of the notification system.
 * Run this file directly to see various error scenarios and how they're handled:
 * 
 * node examples/error-handling-examples.js
 */

// Load environment variables
require('dotenv').config();

// Import the notification system
const notifier = require('../index');

/**
 * Example 1: Basic error handling for different channels
 */
async function basicErrorExamples() {
  console.log('------ Basic Error Handling Examples ------');
  
  // Trigger an error in email by using a recipient with "error" in the name
  console.log('\n1. Sending email to trigger an error:');
  const emailResult = await notifier.dispatch({
    type: 'email',
    recipient: 'error@example.com', // This will trigger an error
    message: 'This message will fail to send'
  });
  
  // Notice how we get a result object instead of an exception
  console.log('Email error result:', emailResult);
  console.log('Error captured:', emailResult.error);
  console.log('Notice the errorId for tracking:', emailResult.errorId);
  
  // Trigger an SMS error
  console.log('\n2. Sending SMS to trigger an error:');
  const smsResult = await notifier.dispatch({
    type: 'sms',
    recipient: '+1error4567890', // This will trigger an error
    message: 'This message will fail to send'
  });
  
  console.log('SMS error result:', smsResult);
  
  // Trigger a push notification error
  console.log('\n3. Sending push notification to trigger an error:');
  const pushResult = await notifier.dispatch({
    type: 'push',
    recipient: 'error-device-token',
    message: 'This message will fail to send'
  });
  
  console.log('Push error result:', pushResult);
  
  // Show how privacy is maintained in error logs
  console.log('\n4. Notice how privacy is maintained in error logs:');
  console.log(`Email error recipient (original: error@example.com): ${emailResult.recipient}`);
  console.log(`SMS error recipient (original: +1error4567890): ${smsResult.recipient}`);
}

/**
 * Example 2: Handling validation errors
 */
async function validationErrorExamples() {
  console.log('\n------ Validation Error Examples ------');
  
  // Invalid email format
  console.log('\n1. Invalid email format:');
  const invalidEmailResult = await notifier.dispatch({
    type: 'email',
    recipient: 'not-a-valid-email',
    message: 'This will fail validation'
  });
  
  console.log('Invalid email result:', invalidEmailResult);
  
  // Invalid phone number format
  console.log('\n2. Invalid phone number:');
  const invalidPhoneResult = await notifier.dispatch({
    type: 'sms',
    recipient: 'abc123',
    message: 'This will fail validation'
  });
  
  console.log('Invalid phone result:', invalidPhoneResult);
  
  // Message too long for SMS
  console.log('\n3. SMS message too long:');
  const longSmsResult = await notifier.dispatch({
    type: 'sms',
    recipient: '+15551234567',
    message: 'This message is intentionally very long to exceed the 160 character limit for SMS messages. The validation system should catch this and prevent the message from being sent, returning an appropriate error response instead. This is a good example of content validation.'
  });
  
  console.log('Long SMS result:', longSmsResult);
}

/**
 * Example A: Accessing error logs
 */
async function errorLogExamples() {
  console.log('\n------ Error Log Examples ------');
  
  // Clear the error log before our test
  notifier.clearErrorLog();
  console.log('\nCleared error log for demonstration purposes');
  
  // Generate some errors
  console.log('\nGenerating some errors for the log...');
  
  await notifier.dispatch({
    type: 'email',
    recipient: 'error1@example.com',
    message: 'Error log test 1'
  });
  
  await notifier.dispatch({
    type: 'sms',
    recipient: '+1555error2',
    message: 'Error log test 2'
  });
  
  await notifier.dispatch({
    type: 'push',
    recipient: 'error3-device',
    message: 'Error log test 3'
  });
  
  // Retrieve and display error logs
  console.log('\nRetrieving error logs:');
  const errorLog = notifier.getErrorLog(10); // Get last 10 entries
  console.log(errorLog);
}

/**
 * Example 4: Using simulateError option
 */
async function simulatedErrorsExample() {
  console.log('\n------ Simulated Errors Example ------');
  
  // Using the simulateError option to test error handling
  console.log('\n1. Using simulateError option:');
  const result = await notifier.dispatch({
    type: 'email',
    recipient: 'valid@example.com',
    message: 'This should be a valid message, but we simulate an error',
    options: {
      simulateError: true  // This will force an error
    }
  });
  
  console.log('Simulated error result:', result);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    await basicErrorExamples();
    
    // Slight delay to make output more readable
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await validationErrorExamples();
    
    // Slight delay to make output more readable
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await errorLogExamples();
    
    // Slight delay to make output more readable
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await simulatedErrorsExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Run all examples if this file is executed directly
if (require.main === module) {
  console.log('Running error handling examples...');
  runAllExamples()
    .then(() => console.log('\nAll error handling examples completed.'))
    .catch(err => console.error('Failed to run examples:', err));
}

module.exports = {
  basicErrorExamples,
  validationErrorExamples,
  errorLogExamples,
  simulatedErrorsExample,
  runAllExamples
};