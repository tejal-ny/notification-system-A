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

## Extending the System

To add a new notification channel, create a new file in the `notifications` directory with a `send` method, and update the `notifications/index.js` file to export it.

## License

MIT
```