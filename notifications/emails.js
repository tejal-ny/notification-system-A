/**
 * Email Notification Module
 *
 * This module provides functionality for sending email notifications.
 */

// Mock Nodemailer transport (in a real app, you would use actual Nodemailer)
const mockTransporter = {
  sendMail: (mailOptions) => {
    return new Promise((resolve) => {
      console.log('\n--- EMAIL SENT SUCCESSFULLY ---');
      console.log(`From: ${mailOptions.from}`);
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body: ${mailOptions.html || mailOptions.text}`);
      console.log('-------------------------------\n');
      
      // Simulate async sending
      setTimeout(() => {
        resolve({ 
          messageId: `mock-${Date.now()}@mockmail.com`,
          success: true 
        });
      }, 100);
    });
  }
};

// Email configuration
const emailConfig = {
  defaultFrom: 'notification-system@example.com',
};



/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} body - Email body content
 * @param {Object} options - Additional email options
 * @returns {Promise} - Resolves with send result
 */
async function sendEmail(to, subject, body, options = {}) {
  if (!to || !subject || !body) {
    throw new Error('Email requires recipient, subject, and body');
  }

  const mailOptions = {
    from: options.from || emailConfig.defaultFrom,
    to: to,
    subject: subject,
    text: options.isHtml ? undefined : body,
    html: options.isHtml ? body : undefined,
    ...options.additionalOptions
  };

  try {
    return await mockTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

module.exports = {
  send: sendEmail
};