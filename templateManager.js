const multilingualTemplates = {
    email: {
      welcome: {
        en: {
          subject: "Welcome to {{serviceName}}!",
          body: "Hello {{userName}},\n\nWelcome to {{serviceName}}! We're excited to have you join us.\n\nTo get started, please verify your email by clicking on the link below:\n{{verificationLink}}\n\nIf you have any questions, feel free to contact our support team at {{supportEmail}}.\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "¡Bienvenido a {{serviceName}}!",
          body: "Hola {{userName}},\n\n¡Bienvenido a {{serviceName}}! Estamos encantados de que te unas a nosotros.\n\nPara comenzar, verifica tu correo electrónico haciendo clic en el enlace a continuación:\n{{verificationLink}}\n\nSi tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte en {{supportEmail}}.\n\nSaludos cordiales,\nEl equipo de {{serviceName}}"
        },
        fr: {
          subject: "Bienvenue sur {{serviceName}} !",
          body: "Bonjour {{userName}},\n\nBienvenue sur {{serviceName}} ! Nous sommes ravis de vous compter parmi nous.\n\nPour commencer, veuillez vérifier votre e-mail en cliquant sur le lien ci-dessous :\n{{verificationLink}}\n\nSi vous avez des questions, n'hésitez pas à contacter notre équipe d'assistance à {{supportEmail}}.\n\nCordialement,\nL'équipe {{serviceName}}"
        }
      },
      otp: {
        en: {
          subject: "Your verification code for {{serviceName}}",
          body: "Hello {{userName}},\n\nYour verification code for {{serviceName}} is: {{otpCode}}\n\nThis code will expire in {{expiryTime}} minutes.\n\nIf you did not request this code, please ignore this email.\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "Tu código de verificación para {{serviceName}}",
          body: "Hola {{userName}},\n\nTu código de verificación para {{serviceName}} es: {{otpCode}}\n\nEste código caducará en {{expiryTime}} minutos.\n\nSi no has solicitado este código, por favor ignora este correo.\n\nSaludos cordiales,\nEl equipo de {{serviceName}}"
        },
        fr: {
          subject: "Votre code de vérification pour {{serviceName}}",
          body: "Bonjour {{userName}},\n\nVotre code de vérification pour {{serviceName}} est : {{otpCode}}\n\nCe code expirera dans {{expiryTime}} minutes.\n\nSi vous n'avez pas demandé ce code, veuillez ignorer cet e-mail.\n\nCordialement,\nL'équipe {{serviceName}}"
        }
      }
    },
    sms: {
      welcome: {
        en: "Welcome to {{serviceName}}, {{userName}}! Your account has been created successfully. Reply HELP for assistance.",
        es: "¡Bienvenido a {{serviceName}}, {{userName}}! Tu cuenta ha sido creada con éxito. Responde AYUDA para obtener asistencia.",
        fr: "Bienvenue sur {{serviceName}}, {{userName}} ! Votre compte a été créé avec succès. Répondez AIDE pour obtenir de l'assistance."
      },
      otp: {
        en: "Your {{serviceName}} verification code is {{otpCode}}. This code will expire in {{expiryTime}} minutes.",
        es: "Tu código de verificación de {{serviceName}} es {{otpCode}}. Este código caducará en {{expiryTime}} minutos.",
        fr: "Votre code de vérification {{serviceName}} est {{otpCode}}. Ce code expirera dans {{expiryTime}} minutes."
      }
    }
  };

/**
 * Template Manager Utility
 * 
 * This module provides functions for retrieving notification templates based on
 * type (email or sms), template name, and language preference.
 */
const path = require('path');
const fs = require('fs');
const { isValidLanguageCode } = require('./userPreferences');

// Import the templates
const templates = multilingualTemplates;

/**
 * Get a template based on notification type, template name, and language
 * 
 * @param {string} type - The notification type (email, sms)
 * @param {string} templateName - The name of the template (welcome, otp, etc.)
 * @param {string} language - The language code (en, es, fr, etc.)
 * @param {string} [fallbackLanguage='en'] - Fallback language if the requested language is not available
 * @return {Object|string|null} The template (object for email, string for SMS) or null if not found
 */
function getTemplate(type, templateName, language, fallbackLanguage = 'en') {
  // Input validation
  if (!type || typeof type !== 'string') {
    throw new Error('Invalid template type. Must be a non-empty string.');
  }
  
  if (!templateName || typeof templateName !== 'string') {
    throw new Error('Invalid template name. Must be a non-empty string.');
  }
  
  if (!language || typeof language !== 'string') {
    throw new Error('Invalid language code. Must be a non-empty string.');
  }
  
  // Normalize to lowercase
  type = type.toLowerCase();
  templateName = templateName.toLowerCase();
  language = language.toLowerCase();
  fallbackLanguage = fallbackLanguage.toLowerCase();
  
  // Validate inputs
  if (!['email', 'sms'].includes(type)) {
    throw new Error(`Unsupported template type: ${type}. Supported types: email, sms`);
  }
  
  // Check if template exists
  if (!templates[type]) {
    return null;
  }
  
  if (!templates[type][templateName]) {
    return null;
  }
  
  // Try to get the template in the requested language
  let template = null;
  
  // For email, the structure is different since we have subject and body
  if (type === 'email') {
    if (templates[type][templateName][language]) {
      template = templates[type][templateName][language];
    } else if (templates[type][templateName][fallbackLanguage]) {
      template = templates[type][templateName][fallbackLanguage];
    }
  } else {
    // For SMS and other single-text templates
    if (templates[type][templateName][language]) {
      template = templates[type][templateName][language];
    } else if (templates[type][templateName][fallbackLanguage]) {
      template = templates[type][templateName][fallbackLanguage];
    }
  }
  
  return template;
}

/**
 * Get list of available languages for a specific template
 * 
 * @param {string} type - The notification type (email, sms)
 * @param {string} templateName - The name of the template
 * @return {string[]} Array of available language codes
 */
function getAvailableLanguages(type, templateName) {
  // Input validation
  if (!type || !templateName) {
    return [];
  }
  
  // Normalize to lowercase
  type = type.toLowerCase();
  templateName = templateName.toLowerCase();
  
  // Check if template exists
  if (!templates[type] || !templates[type][templateName]) {
    return [];
  }
  
  // For email templates which have subject and body
  if (type === 'email') {
    return Object.keys(templates[type][templateName]);
  }
  
  // For SMS and other text templates
  return Object.keys(templates[type][templateName]);
}

/**
 * Get list of available templates for a specific type
 * 
 * @param {string} type - The notification type (email, sms)
 * @return {string[]} Array of available template names
 */
function getAvailableTemplates(type) {
  // Input validation
  if (!type) {
    return [];
  }
  
  // Normalize to lowercase
  type = type.toLowerCase();
  
  // Check if type exists
  if (!templates[type]) {
    return [];
  }
  
  return Object.keys(templates[type]);
}

/**
 * Add a new template or update an existing one
 * 
 * @param {string} type - The notification type (email, sms)
 * @param {string} templateName - The name of the template
 * @param {string} language - The language code
 * @param {Object|string} template - The template content (object for email, string for SMS)
 * @return {boolean} Success status
 */
function addTemplate(type, templateName, language, template) {
  // Input validation
  if (!type || !templateName || !language || !template) {
    return false;
  }
  
  // Normalize to lowercase
  type = type.toLowerCase();
  templateName = templateName.toLowerCase();
  language = language.toLowerCase();
  
  // Validate language code
  if (language.length < 2) {
    return false;
  }
  
  // Initialize structure if needed
  if (!templates[type]) {
    templates[type] = {};
  }
  
  if (!templates[type][templateName]) {
    templates[type][templateName] = {};
  }
  
  // For email templates, ensure proper structure
  if (type === 'email' && (typeof template !== 'object' || !template.subject || !template.body)) {
    return false;
  }
  
  // Add or update the template
  templates[type][templateName][language] = template;
  
  return true;
}

// Export the utility functions
module.exports = {
  getTemplate,
  getAvailableLanguages,
  getAvailableTemplates,
  addTemplate,
  templates,
  multilingualTemplates
};