/**
 * Multi-language notification templates with placeholders
 * 
 * Structure:
 * - Channel type (email, sms)
 *   - Template name (welcome, verification, etc.)
 *     - Language code (en, es, fr, etc.)
 *       - Template content (with subject/body for email or message for SMS)
 */
const notificationTemplates = {
    email: {
      welcome: {
        en: {
          subject: "Welcome to {{serviceName}}!",
          body: "Hello {{userName}},\n\nWelcome to {{serviceName}}! We're excited to have you join us.\n\nTo get started, please verify your email by clicking on the link below:\n{{verificationLink}}\n\nIf you have any questions, feel free to contact our support team at {{supportEmail}}.\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "¡Bienvenido a {{serviceName}}!",
          body: "Hola {{userName}},\n\n¡Bienvenido a {{serviceName}}! Estamos emocionados de tenerte con nosotros.\n\nPara comenzar, verifica tu correo electrónico haciendo clic en el enlace a continuación:\n{{verificationLink}}\n\nSi tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte en {{supportEmail}}.\n\nSaludos cordiales,\nEl Equipo de {{serviceName}}"
        },
        fr: {
          subject: "Bienvenue sur {{serviceName}} !",
          body: "Bonjour {{userName}},\n\nBienvenue sur {{serviceName}} ! Nous sommes ravis de vous compter parmi nous.\n\nPour commencer, veuillez vérifier votre e-mail en cliquant sur le lien ci-dessous :\n{{verificationLink}}\n\nSi vous avez des questions, n'hésitez pas à contacter notre équipe d'assistance à {{supportEmail}}.\n\nCordialement,\nL'équipe {{serviceName}}"
        },
        de: {
          subject: "Willkommen bei {{serviceName}}!",
          body: "Hallo {{userName}},\n\nWillkommen bei {{serviceName}}! Wir freuen uns, dass Sie dabei sind.\n\nKlicken Sie auf den folgenden Link, um Ihre E-Mail-Adresse zu bestätigen:\n{{verificationLink}}\n\nBei Fragen wenden Sie sich bitte an unseren Support unter {{supportEmail}}.\n\nMit freundlichen Grüßen,\nDas {{serviceName}}-Team"
        }
      },
      passwordReset: {
        en: {
          subject: "Password Reset Request for {{serviceName}}",
          body: "Hello {{userName}},\n\nWe received a request to reset your password for your {{serviceName}} account.\n\nPlease click the link below to reset your password:\n{{resetLink}}\n\nThis link will expire in {{expiryTime}} hours.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "Solicitud de restablecimiento de contraseña para {{serviceName}}",
          body: "Hola {{userName}},\n\nHemos recibido una solicitud para restablecer la contraseña de tu cuenta de {{serviceName}}.\n\nHaz clic en el enlace a continuación para restablecer tu contraseña:\n{{resetLink}}\n\nEste enlace caducará en {{expiryTime}} horas.\n\nSi no solicitaste esto, puedes ignorar este correo electrónico.\n\nSaludos cordiales,\nEl Equipo de {{serviceName}}"
        },
        fr: {
          subject: "Demande de réinitialisation de mot de passe pour {{serviceName}}",
          body: "Bonjour {{userName}},\n\nNous avons reçu une demande de réinitialisation du mot de passe de votre compte {{serviceName}}.\n\nVeuillez cliquer sur le lien ci-dessous pour réinitialiser votre mot de passe :\n{{resetLink}}\n\nCe lien expirera dans {{expiryTime}} heures.\n\nSi vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.\n\nCordialement,\nL'équipe {{serviceName}}"
        },
        de: {
          subject: "Anfrage zum Zurücksetzen des Passworts für {{serviceName}}",
          body: "Hallo {{userName}},\n\nWir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr {{serviceName}}-Konto erhalten.\n\nBitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:\n{{resetLink}}\n\nDieser Link läuft in {{expiryTime}} Stunden ab.\n\nWenn Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren.\n\nMit freundlichen Grüßen,\nDas {{serviceName}}-Team"
        }
      },
      orderConfirmation: {
        en: {
          subject: "Order Confirmation #{{orderNumber}}",
          body: "Hello {{userName}},\n\nThank you for your order!\n\nOrder Number: {{orderNumber}}\nOrder Date: {{orderDate}}\nTotal Amount: {{orderTotal}}\n\nShipping Address:\n{{shippingAddress}}\n\nEstimated Delivery Date: {{estimatedDelivery}}\n\nOrder Details:\n{{orderDetails}}\n\nIf you have any questions about your order, please contact us at {{supportEmail}}.\n\nThank you for shopping with {{serviceName}}!\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "Confirmación de Pedido #{{orderNumber}}",
          body: "Hola {{userName}},\n\n¡Gracias por tu pedido!\n\nNúmero de Pedido: {{orderNumber}}\nFecha del Pedido: {{orderDate}}\nImporte Total: {{orderTotal}}\n\nDirección de Envío:\n{{shippingAddress}}\n\nFecha Estimada de Entrega: {{estimatedDelivery}}\n\nDetalles del Pedido:\n{{orderDetails}}\n\nSi tienes alguna pregunta sobre tu pedido, contáctanos en {{supportEmail}}.\n\n¡Gracias por comprar con {{serviceName}}!\n\nSaludos cordiales,\nEl Equipo de {{serviceName}}"
        },
        fr: {
          subject: "Confirmation de commande #{{orderNumber}}",
          body: "Bonjour {{userName}},\n\nMerci pour votre commande !\n\nNuméro de commande : {{orderNumber}}\nDate de commande : {{orderDate}}\nMontant total : {{orderTotal}}\n\nAdresse de livraison :\n{{shippingAddress}}\n\nDate de livraison estimée : {{estimatedDelivery}}\n\nDétails de la commande :\n{{orderDetails}}\n\nSi vous avez des questions concernant votre commande, veuillez nous contacter à {{supportEmail}}.\n\nMerci d'avoir effectué vos achats chez {{serviceName}} !\n\nCordialement,\nL'équipe {{serviceName}}"
        },
        de: {
          subject: "Bestellbestätigung #{{orderNumber}}",
          body: "Hallo {{userName}},\n\nVielen Dank für Ihre Bestellung!\n\nBestellnummer: {{orderNumber}}\nBestelldatum: {{orderDate}}\nGesamtbetrag: {{orderTotal}}\n\nLieferadresse:\n{{shippingAddress}}\n\nVoraussichtliches Lieferdatum: {{estimatedDelivery}}\n\nBestelldetails:\n{{orderDetails}}\n\nBei Fragen zu Ihrer Bestellung kontaktieren Sie uns bitte unter {{supportEmail}}.\n\nVielen Dank für Ihren Einkauf bei {{serviceName}}!\n\nMit freundlichen Grüßen,\nDas {{serviceName}}-Team"
        }
      }
    },
    sms: {
      welcome: {
        en: "Welcome to {{serviceName}}, {{userName}}! Your account has been created successfully. Reply HELP for assistance.",
        es: "¡Bienvenido a {{serviceName}}, {{userName}}! Tu cuenta ha sido creada con éxito. Responde AYUDA para obtener asistencia.",
        fr: "Bienvenue sur {{serviceName}}, {{userName}} ! Votre compte a été créé avec succès. Répondez AIDE pour obtenir de l'assistance.",
        de: "Willkommen bei {{serviceName}}, {{userName}}! Ihr Konto wurde erfolgreich erstellt. Antworten Sie mit HILFE für Unterstützung."
      },
      verification: {
        en: "Your {{serviceName}} verification code is {{verificationCode}}. This code will expire in {{expiryTime}} minutes.",
        es: "Tu código de verificación de {{serviceName}} es {{verificationCode}}. Este código caducará en {{expiryTime}} minutos.",
        fr: "Votre code de vérification {{serviceName}} est {{verificationCode}}. Ce code expirera dans {{expiryTime}} minutes.",
        de: "Ihr {{serviceName}}-Verifizierungscode lautet {{verificationCode}}. Dieser Code läuft in {{expiryTime}} Minuten ab."
      },
      orderUpdate: {
        en: "{{serviceName}} Order #{{orderNumber}} update: {{updateMessage}}. Track your order at {{trackingLink}}",
        es: "Actualización del pedido #{{orderNumber}} de {{serviceName}}: {{updateMessage}}. Sigue tu pedido en {{trackingLink}}",
        fr: "Mise à jour de la commande {{serviceName}} #{{orderNumber}} : {{updateMessage}}. Suivez votre commande sur {{trackingLink}}",
        de: "{{serviceName}} Bestellung #{{orderNumber}} Update: {{updateMessage}}. Verfolgen Sie Ihre Bestellung unter {{trackingLink}}"
      },
      appointmentReminder: {
        en: "Reminder: You have an appointment scheduled for {{appointmentDate}} at {{appointmentTime}}. Reply C to confirm or R to reschedule.",
        es: "Recordatorio: Tienes una cita programada para el {{appointmentDate}} a las {{appointmentTime}}. Responde C para confirmar o R para reprogramar.",
        fr: "Rappel : Vous avez un rendez-vous prévu le {{appointmentDate}} à {{appointmentTime}}. Répondez C pour confirmer ou R pour reporter.",
        de: "Erinnerung: Sie haben einen Termin am {{appointmentDate}} um {{appointmentTime}}. Antworten Sie mit C zum Bestätigen oder R zum Verschieben."
      }
    }
  };


/**
 * Renders a template by language with enhanced fallback logic
 * 
 * @param {Object} templates - The templates object containing multi-language templates
 * @param {string} channel - The notification channel ('email' or 'sms')
 * @param {string} templateName - The name of the template to use
 * @param {string} language - The language code to use (e.g., 'en', 'es', 'fr', 'de')
 * @param {Object} data - An object containing key-value pairs for replacement
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.logWarnings=true] - Whether to log warnings for missing values
 * @param {string} [options.fallbackLanguage='en'] - Primary fallback language
 * @param {boolean} [options.returnEmptyOnMissing=false] - Whether to return empty string on missing template
 * @returns {string|Object|null} The rendered template with all placeholders replaced
 */
function renderTemplateByLanguage(templates, channel, templateName, language, data, options = {}) {
    // Default options
    const {
      logWarnings = true,
      fallbackLanguage = 'en',
      returnEmptyOnMissing = false
    } = options;
    
    // Validation checks
    if (!templates || !channel || !templateName || !language || !data) {
      throw new Error('Missing required parameters for template rendering');
    }
    
    // Check if the channel exists
    if (!templates[channel]) {
      const errorMsg = `Channel "${channel}" not found in templates`;
      if (logWarnings) console.warn(errorMsg);
      return returnEmptyOnMissing ? (typeof templates.email?.welcome?.en === 'object' ? {} : '') : null;
    }
    
    // Check if the template exists
    if (!templates[channel][templateName]) {
      const errorMsg = `Template "${templateName}" not found in channel "${channel}"`;
      if (logWarnings) console.warn(errorMsg);
      return returnEmptyOnMissing ? (typeof templates[channel]?.welcome?.[language] === 'object' ? {} : '') : null;
    }
    
    // ENHANCED FALLBACK LOGIC:
    
    // Step 1: Try to get the template in the requested language
    let template = templates[channel][templateName][language];
    let usedLanguage = language;
    
    // Step 2: If not found, attempt to fall back to the specified fallback language
    if (!template && language !== fallbackLanguage) {
      template = templates[channel][templateName][fallbackLanguage];
      usedLanguage = fallbackLanguage;
      
      if (template && logWarnings) {
        console.warn(`Template "${templateName}" not available in "${language}", falling back to "${fallbackLanguage}"`);
      }
    }
    
    // Step 3: If still not found, look for any available language as a last resort
    if (!template) {
      const availableLanguages = Object.keys(templates[channel][templateName]);
      
      if (availableLanguages.length > 0) {
        usedLanguage = availableLanguages[0];
        template = templates[channel][templateName][usedLanguage];
        
        if (logWarnings) {
          console.warn(`Template "${templateName}" not available in "${language}" or fallback "${fallbackLanguage}". Using "${usedLanguage}" as last resort.`);
        }
      } else {
        // No languages available at all
        const errorMsg = `No languages available for template "${templateName}" in channel "${channel}"`;
        if (logWarnings) console.warn(errorMsg);
        
        return returnEmptyOnMissing ? 
          (channel === 'email' ? { subject: '', body: '' } : '') : 
          null;
      }
    }
    
    // If no template is found after all fallback attempts
    if (!template) {
      const errorMsg = `No template found for "${templateName}" in channel "${channel}" with language "${language}" or any fallback`;
      if (logWarnings) console.warn(errorMsg);
      
      return returnEmptyOnMissing ? 
        (channel === 'email' ? { subject: '', body: '' } : '') : 
        null;
    }
    
    // Handle template based on its type
    try {
      // If the template is an object (like email with subject and body)
      if (typeof template === 'object') {
        const result = {};
        // Render each property of the template object
        for (const key in template) {
          if (Object.prototype.hasOwnProperty.call(template, key)) {
            result[key] = renderTemplate(template[key], data, logWarnings);
          }
        }
        return result;
      }
      
      // If the template is a string (like SMS)
      return renderTemplate(template, data, logWarnings);
    } catch (error) {
      if (logWarnings) {
        console.warn(`Error rendering template "${templateName}" in language "${usedLanguage}": ${error.message}`);
      }
      
      return returnEmptyOnMissing ? 
        (typeof template === 'object' ? { subject: '', body: '' } : '') : 
        null;
    }
  }
  
  /**
   * Renders a template string by replacing placeholders with values
   * 
   * @param {string} template - The template string containing placeholders like {{key}}
   * @param {object} data - An object containing key-value pairs for replacement
   * @param {boolean} [logWarnings=true] - Whether to log warnings for missing values
   * @returns {string} The rendered template with all placeholders replaced
   */
  function renderTemplate(template, data, logWarnings = true) {
    // Start with the original template
    let renderedTemplate = template;
    
    // Check if inputs are valid
    if (typeof template !== 'string' || !data || typeof data !== 'object') {
      throw new Error('Invalid arguments: template must be a string and data must be an object');
    }
    
    // Find all placeholders in the template
    const placeholderRegex = /{{([^{}]+)}}/g;
    const placeholders = new Set();
    let match;
    
    // Extract all placeholders from the template
    while ((match = placeholderRegex.exec(template)) !== null) {
      placeholders.add(match[1]);
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
        
        // Remove this key from the placeholders set as it's been handled
        placeholders.delete(key);
      }
    }
    
    // Log warnings for any placeholders that weren't replaced
    if (logWarnings && placeholders.size > 0) {
      placeholders.forEach(key => {
        console.warn(`Warning: No value provided for placeholder '${key}' in template`);
      });
    }
    
    // Return the rendered template
    return renderedTemplate;
  }


module.exports = {
    notificationTemplates,
    renderTemplate,
    renderTemplateByLanguage
}