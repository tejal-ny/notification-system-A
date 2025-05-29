```markdown
# Notification System

A modular notification system supporting multiple communication channels.

## Features

- Send notifications through multiple channels:
  - Email
  - SMS (via Twilio)
  - Push notifications
- Two flexible APIs for sending notifications:
  - Parameter-based API with individual arguments
  - Object-based API with a single notification object
- Comprehensive input validation:
  - Email format validation
  - Phone number format validation
  - Message length and content validation
  - Graceful handling of invalid inputs
- Centralized error handling:
  - Consistent error format across all channels
  - Detailed error logging with privacy protection
  - Error tracking with unique error IDs
  - File-based error logs for monitoring and debugging
- Secure credentials management using environment variables
- Non-throwing API that returns errors as structured data instead of exceptions
- Extensible architecture for adding new notification channels
- Simple, consistent API across all notification types


### Validation Rules

The system validates different aspects based on notification type:

1. **Email**
   - Must be a valid email format (user@domain.tld)
   - Message must not exceed maximum length (10,000 chars)

2. **SMS**
   - Must be a valid phone number format
   - Message must not exceed 160 characters
   - Supports various phone formats (+1234567890, 1234567890)

3. **Push**
   - Device token/ID must be a non-empty string with minimum length
   - Message must not exceed maximum length

## Error Handling

The notification system provides centralized error handling with consistent logging and reporting:

### Non-Throwing Error Handling

Unlike many APIs that throw exceptions, this system returns structured error responses:

```javascript
const result = await notifier.dispatch({
  type: 'email',
  recipient: 'invalid-email',  // This will fail validation
  message: 'Hello world'
});

// Check if the notification was sent successfully
if (result.dispatched) {
  console.log('Notification sent successfully');
} else {
  console.error(`Failed to send notification: ${result.error}`);
  console.error(`Error ID for tracking: ${result.errorId}`);
}
```

### Error Logging

Errors are automatically logged to a file with privacy protection:

```javascript
// Get the contents of the error log
const errorLog = notifier.getErrorLog();
console.log(errorLog);

// Clear the error log if needed (e.g., for testing)
notifier.clearErrorLog();
```

### Error Response Format

All errors return a standardized format:

```javascript
{
  type: 'email',                     // The notification type
  recipient: 'use***@example.com',   // Sanitized for privacy
  message: 'Hello world',            // The message (truncated if too long)
  status: 'failed',                  // Always 'failed' for errors
  error: 'Invalid email address',    // Human-readable error message
  errorId: 'err-20250528123456-123', // Unique error ID for tracking
  dispatched: false,                 // Always false for errors
  dispatchTimestamp: [Date object]   // When the error occurred
}
```

### Privacy Protection

The system sanitizes sensitive information in error logs and responses:

- Email addresses: `user@example.com` → `use***@example.com`
- Phone numbers: `+15551234567` → `******4567`
- Messages: Truncated to prevent sensitive content exposure

### Complete Examples

See the example files for complete usage demonstrations:
- `examples/dispatch-examples.js` - General usage examples
- `examples/error-handling-examples.js` - Error handling specific examples

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then edit .env file with your actual credentials
```

## Configuration

### Environment Variables

This system uses environment variables to manage sensitive credentials. The following environment variables are required for SMS functionality:

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number in E.164 format (e.g., +15551234567)

You can set these variables in several ways:

1. Create a `.env` file in the root directory (recommended for development)
2. Set them in your environment before running the application
3. Use a service like AWS Parameter Store or Secrets Manager for production deployments

**IMPORTANT**: Never commit your `.env` file with real credentials to version control!


## Usage

### Basic Usage

```javascript
const notifier = require('./index');

// Send an email notification
notifier.email.send('user@example.com', 'Hello from notification system!');

// Send an SMS notification
notifier.sms.send('+1234567890', 'Your verification code is 123456');

// Send a push notification
notifier.push.send('device-token-123', 'You have a new message');
```

### Using the Unified Interface (Legacy)

```javascript
const notifier = require('./index');

// Send notifications through different channels using the same interface
notifier.sendNotification('email', 'user@example.com', 'Welcome!');
notifier.sendNotification('sms', '+1234567890', 'Your code: 123456');
notifier.sendNotification('push', 'device-id', 'New message', { 
  badge: 1,
  sound: 'default'
});

### Using the Notification Dispatcher (Recommended)

The dispatcher accepts a notification object with type, recipient, and message fields:

```javascript
const notifier = require('./index');

// Dispatch an email notification
notifier.dispatchNotification({
  type: 'email',
  recipient: 'user@example.com',
  message: 'Welcome to our service!',
  options: {
    subject: 'Welcome Email'
  }
});

// Dispatch an SMS notification
notifier.dispatchNotification({
  type: 'sms',
  recipient: '+1234567890',
  message: 'Your verification code: 123456'
});

// Error handling with async/await
async function sendNotifications() {
  try {
    // Successful notification
    const result = await notifier.dispatchNotification({
      type: 'email',
      recipient: 'user@example.com',
      message: 'This is an important message'
    });
    console.log('Notification sent:', result);
    
    // This will throw an error due to unsupported type
    await notifier.dispatchNotification({
      type: 'unsupported',
      recipient: 'recipient',
      message: 'This will fail gracefully'
    });
  } catch (error) {
    console.error('Notification error:', error.message);
    // Error handling code here
  }
}
```

```javascript
const notifier = require('./index');

// Send notifications through different channels using the same interface
notifier.sendNotification('email', 'user@example.com', 'Welcome!');
notifier.sendNotification('sms', '+1234567890', 'Your code: 123456');
notifier.sendNotification('push', 'device-id', 'New message', { 
  badge: 1,
  sound: 'default'
});
```

# Notification System

A flexible notification system for Node.js applications that supports multiple notification channels.

## Project Structure
- `index.js`: Main entry point for the application
- `config.js`: Configuration management using environment variables
- `notifications/`: Directory containing notification functionality
  - `index.js`: Core notification system
  - `email.js`: Email notification provider
  - `sms.js`: SMS notification provider using Twilio
  - `validators.js`: Input validation utilities
- `examples/`: Example usage for different notification types
- `package.json`: Project configuration and dependencies
- `.env.example`: Example environment variable configuration

## Getting Started
1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file based on `.env.example` with your credentials
4. Run `npm start` to start the application
5. For development without sending real notifications, use `npm run dev`

## Environment Variables

The application uses the following environment variables:

## Email Configuration
|
 Variable 
|
 Description 
|
 Default 
|
|
----------
|
-------------
|
---------
|
|
 EMAIL_MODE 
|
 Email mode (mock/live) 
|
 - 
|
|
 EMAIL_HOST 
|
 SMTP server hostname 
|
 - 
|
|
 EMAIL_PORT 
|
 SMTP server port 
|
 587 
|
|
 EMAIL_SECURE 
|
 Use secure connection (true/false) 
|
 false 
|
|
 EMAIL_USER 
|
 SMTP username/email 
|
 - 
|
|
 EMAIL_PASSWORD 
|
 SMTP password 
|
 - 
|
|
 EMAIL_FROM 
|
 Default sender email address 
|
 notification-system@example.com 
|

### SMS Configuration
|
 Variable 
|
 Description 
|
 Default 
|
|
----------
|
-------------
|
---------
|
|
 SMS_PROVIDER 
|
 SMS provider to use (twilio/mock) 
|
 mock 
|
|
 SMS_MODE 
|
 SMS mode (mock/live) 
|
 - 
|
|
 TWILIO_ACCOUNT_SID 
|
 Twilio Account SID 
|
 - 
|
|
 TWILIO_AUTH_TOKEN 
|
 Twilio Auth Token 
|
 - 
|
|
 TWILIO_PHONE_NUMBER 
|
 Default sender phone number 
|
 - 
|

### General
|
 Variable 
|
 Description 
|
 Default 
|
|
----------
|
-------------
|
---------
|
|
 NODE_ENV 
|
 Environment mode (development/production) 
|
 development 
|

In development mode or when EMAIL_MODE=mock or SMS_MODE=mock, the system will use mock implementations that only log messages to the console.


## Features
- Centralized notification management
- Support for multiple notification types:
  - Email (via SMTP/Nodemailer)
  - SMS (via Twilio)
  - Push notifications (coming soon)
  - Webhooks (coming soon)
- Secure credential management with environment variables
- Development mode with mock notifications
- Input validation for email addresses and phone numbers
- Easily extensible notification system

## Usage Examples

### Sending an Email
```javascript
const notificationSystem = require('./index');

// Basic usage
await notificationSystem.send(
  notificationSystem.types.EMAIL,
  'recipient@example.com',
  'This is the email body content.',
  {
    subject: 'Email Subject Line'
  }
);

// With more options
await notificationSystem.send(
  notificationSystem.types.EMAIL,
  'recipient@example.com',

## Extending the System

To add a new notification channel, create a new file in the `notifications` directory with a `send` method, and update the `notifications/index.js` file to export it.

## Environment Configuration

This notification system uses environment variables for configuration. Create a `.env` file in the project root:

## License

MIT
```