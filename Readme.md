```markdown
# Notification System

A modular notification system supporting multiple communication channels.

## Features

- Send notifications through multiple channels:
  - Email
  - SMS
  - Push notifications
- Extensible architecture for adding new notification channels
- Simple, consistent API across all notification types

## Installation

```bash
npm install
```

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

### Using the Unified Interface

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