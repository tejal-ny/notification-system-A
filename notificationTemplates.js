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
//   if (typeof module !== 'undefined' && module.exports) {
//     module.exports = notificationTemplates;
//   }


  /**
 * Renders a template string by replacing placeholders with values from a data object
 * 
 * @param {string} template - The template string containing placeholders like {{key}}
 * @param {object} data - An object containing key-value pairs for replacement
 * @returns {string} The rendered template with all placeholders replaced
 */
function renderTemplate(template, data) {
    // Start with the original template
    let renderedTemplate = template;
    
    // Check if inputs are valid
    if (typeof template !== 'string' || !data || typeof data !== 'object') {
      throw new Error('Invalid arguments: template must be a string and data must be an object');
    }
    
    // Replace each placeholder with its corresponding value from the data object
    for (const key in data) {
      // Only process properties directly on the object (not from prototype)
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Create a regex to find all instances of the placeholder
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        
        // Convert value to string (in case it's a number or other type)
        const value = data[key] !== null && data[key] !== undefined ? String(data[key]) : '';
        
        // Replace all occurrences of the placeholder with the value
        renderedTemplate = renderedTemplate.replace(placeholder, value);
      }
    }
    
    // Return the rendered template with all placeholders replaced
    return renderedTemplate;
  }


module.exports = {
    notificationTemplates,
    renderTemplate
}