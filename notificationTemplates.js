/**
 * Notification Templates Object
 * 
 * This object stores templates for different notification types (email and SMS)
 * with placeholders using the {{key}} format.
 * 
 * Each template category (email, sms) contains specific template types, which
 * include subject (for email only) and body content with placeholders.
 * 
 * Usage example:
 * const template = notificationTemplates.email.welcome;
 * // Replace placeholders with actual values
 * const subject = template.subject.replace("{{userName}}", "John");
 * const body = template.body.replace("{{userName}}", "John")
 *               .replace("{{companyName}}", "Acme Corp");
 */

const notificationTemplates = {
    email: {
      welcome: {
        subject: "Welcome to {{companyName}}!",
        body: "Hello {{userName}},\n\nWelcome to {{companyName}}! We're excited to have you on board.\n\nTo get started, please visit your dashboard at {{dashboardUrl}}.\n\nIf you have any questions, feel free to reply to this email or contact our support team.\n\nBest regards,\nThe {{companyName}} Team"
      },
      passwordReset: {
        subject: "Password Reset Request",
        body: "Hello {{userName}},\n\nWe received a request to reset your password. Please use the following code to complete the process: {{resetCode}}.\n\nThis code will expire in {{expiryTime}} minutes.\n\nIf you didn't request this reset, please ignore this email or contact our support team.\n\nBest regards,\nThe {{companyName}} Team"
      },
      orderConfirmation: {
        subject: "Order #{{orderNumber}} Confirmation",
        body: "Hello {{userName}},\n\nThank you for your order #{{orderNumber}}!\n\nOrder Details:\nDate: {{orderDate}}\nTotal: {{orderTotal}}\n\nYou can track your order status at {{trackingUrl}}.\n\nThank you for shopping with {{companyName}}!\n\nBest regards,\nThe {{companyName}} Team"
      },
      accountUpdate: {
        subject: "Your Account Has Been Updated",
        body: "Hello {{userName}},\n\nYour account information was recently updated. Here's what changed:\n\n{{changedFields}}\n\nIf you did not make these changes, please contact our support team immediately.\n\nBest regards,\nThe {{companyName}} Team"
      },
      newsletter: {
        subject: "{{newsletterName}} - {{issueDate}}",
        body: "Hello {{userName}},\n\nHere's your {{newsletterName}} for {{issueDate}}.\n\n{{newsletterContent}}\n\nTo manage your subscription preferences, visit {{preferencesUrl}}.\n\nBest regards,\nThe {{companyName}} Team"
      }
    },
    sms: {
      welcome: {
        body: "Welcome to {{companyName}}, {{userName}}! Reply HELP for assistance or STOP to unsubscribe."
      },
      verificationCode: {
        body: "{{companyName}}: Your verification code is {{verificationCode}}. It expires in {{expiryTime}} minutes."
      },
      appointmentReminder: {
        body: "Reminder: Your appointment with {{companyName}} is scheduled for {{appointmentDate}} at {{appointmentTime}}. Reply C to confirm or R to reschedule."
      },
      orderStatus: {
        body: "{{companyName}}: Your order #{{orderNumber}} has been {{orderStatus}}. Track at {{shortTrackingUrl}}"
      },
      securityAlert: {
        body: "{{companyName}} Security Alert: We detected a new login to your account from {{deviceInfo}}. If this wasn't you, please call {{supportPhone}}."
      },
      paymentConfirmation: {
        body: "{{companyName}}: Payment of {{paymentAmount}} received on {{paymentDate}}. Reference: {{referenceNumber}}. Thank you!"
      }
    }
  };
  
  // Export the templates object if in Node.js environment
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationTemplates;
  }