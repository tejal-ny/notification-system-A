    /**
   * Render a template by replacing placeholders with actual values
   *
   * @param {string|Object} template - The template string or object with template properties
   * @param {Object} data - The data to use for rendering
   * @param {Object} [options] - Additional options for template rendering
   * @param {boolean} [options.preserveMetadata=false] - If true, the metadata object is preserved in the returned object
   * @param {Object} [options.defaultValues] - Custom default values to use for missing fields
   * @param {boolean} [options.removeUnreplacedPlaceholders=false] - If true, removes any unreplaced {{placeholders}}
   * @returns {string|Object} The rendered template
   */
  function renderTemplate(template, data, options = {}) {
    const { 
      preserveMetadata = false, 
      defaultValues = {}, 
      removeUnreplacedPlaceholders = false 
    } = options;
    
    // No template to render
    if (!template) return null;
    
    // Prepare data with defaults for rendering
    const renderData = data || {};
    
    // If the template includes metadata from getTemplate() with includeMetadata option
    if (template && template.metadata && template.template) {
      const renderedTemplate = renderTemplateContent(
        template.template, 
        renderData, 
        defaultValues, 
        removeUnreplacedPlaceholders
      );
      return preserveMetadata ? { template: renderedTemplate, metadata: template.metadata } : renderedTemplate;
    }
    
    // Regular template rendering
    return renderTemplateContent(template, renderData, defaultValues, removeUnreplacedPlaceholders);
  }
  
  /**
   * Internal helper to render template content with placeholders
   * 
   * @param {string|Object} template - The template string or object with template properties
   * @param {Object} data - The data object with values
   * @param {Object} defaultValues - Custom default values to use for missing fields
   * @param {boolean} removeUnreplacedPlaceholders - Whether to remove unreplaced placeholders
   * @returns {string|Object} The rendered template
   * @private
   */
  function renderTemplateContent(template, data, defaultValues, removeUnreplacedPlaceholders) {
    // Handle different template types
    if (typeof template === 'string') {
      // Simple string template
      return renderString(template, data, defaultValues, removeUnreplacedPlaceholders);
    } else if (typeof template === 'object') {
      // Object with multiple string properties (e.g., email with subject and body)
      const rendered = {};
      
      Object.keys(template).forEach(key => {
        if (typeof template[key] === 'string') {
          rendered[key] = renderString(template[key], data, defaultValues, removeUnreplacedPlaceholders);
        } else {
          rendered[key] = template[key];
        }
      });
      
      return rendered;
    }
    
    // Return unmodified if not a string or object
    return template;
  }
  
  /**
   * Render a string by replacing placeholders with values
   * 
   * @param {string} str - The template string
   * @param {Object} data - The data object with values
   * @param {Object} customDefaults - Custom default values to use for missing fields
   * @param {boolean} removeUnreplacedPlaceholders - Whether to remove unreplaced placeholders
   * @returns {string} The rendered string
   * @private
   */
  function renderString(str, data, customDefaults, removeUnreplacedPlaceholders) {
    if (typeof str !== 'string') return str;
    
    let result = str;
    
    // Find all unique placeholders in the template
    const placeholderRegex = /{{([^{}]+)}}/g;
    const placeholders = new Set();
    let match;
    
    while ((match = placeholderRegex.exec(str)) !== null) {
      placeholders.add(match[1]);
    }
    
    // Combine default values (custom defaults take precedence over global defaults)
    const mergedDefaults = { ...DEFAULT_FIELD_VALUES, ...customDefaults };
    
    // Process each placeholder
    placeholders.forEach(placeholder => {
      // Check if data contains the placeholder value
      if (data[placeholder] !== undefined && data[placeholder] !== null) {
        // Use provided value
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, data[placeholder]);
      } 
      // Check if we have a default value for this placeholder
      else if (mergedDefaults[placeholder] !== undefined) {
        // Use default value
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, mergedDefaults[placeholder]);
      }
      // If removeUnreplacedPlaceholders is true, remove the unreplaced placeholder
      else if (removeUnreplacedPlaceholders) {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, '');
      }
      // Otherwise leave the placeholder as is
    });
    
    return result;
  }

  /**
 * Template Utility Module - v1.1.0
 * 
 * Provides functions to retrieve and render templates based on type,
 * template name, and language preferences with support for default values.
 */

// Template store organized by type -> name -> language
const templates = {
    // Email templates
    email: {
      // Welcome email template
      welcome: {
        en: {
          subject: "Welcome to {{serviceName}}!",
          body: "Hello {{userName}},\n\nWelcome to {{serviceName}}! We're excited to have you join us.\n\nTo get started, please verify your email by clicking on the link below:\n{{verificationLink}}\n\nIf you have any questions, feel free to contact our support team at {{supportEmail}}.\n\nBest regards,\nThe {{serviceName}} Team"
        },
        es: {
          subject: "¡Bienvenido a {{serviceName}}!",
          body: "Hola {{userName}},\n\n¡Bienvenido a {{serviceName}}! Estamos emocionados de que te unas a nosotros.\n\nPara comenzar, verifica tu correo electrónico haciendo clic en el siguiente enlace:\n{{verificationLink}}\n\nSi tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte en {{supportEmail}}.\n\nSaludos cordiales,\nEl Equipo de {{serviceName}}"
        },
        fr: {
          subject: "Bienvenue sur {{serviceName}} !",
          body: "Bonjour {{userName}},\n\nBienvenue sur {{serviceName}} ! Nous sommes ravis de vous compter parmi nous.\n\nPour commencer, veuillez vérifier votre email en cliquant sur le lien ci-dessous :\n{{verificationLink}}\n\nSi vous avez des questions, n'hésitez pas à contacter notre équipe d'assistance à {{supportEmail}}.\n\nCordialement,\nL'équipe {{serviceName}}"
        }
      },
      // Other email templates...
    },
    // SMS templates
    sms: {
      // Welcome SMS template
      welcome: {
        en: "Welcome to {{serviceName}}, {{userName}}! Your account has been created successfully. Reply HELP for assistance.",
        es: "¡Bienvenido a {{serviceName}}, {{userName}}! Tu cuenta ha sido creada exitosamente. Responde AYUDA para obtener asistencia.",
        fr: "Bienvenue sur {{serviceName}}, {{userName}} ! Votre compte a été créé avec succès. Répondez AIDE pour obtenir de l'assistance."
      },
      // Other SMS templates...
    }
  };
  
  // Default language to use if the requested language is not available
  const DEFAULT_LANGUAGE = 'en';
  
  // Default values for common template fields
  const DEFAULT_FIELD_VALUES = {
    // User information defaults
    userName: 'Guest',
    userFirstName: 'User',
    userLastName: '',
    userEmail: '',
    
    // Company/service defaults
    serviceName: 'Our Service',
    companyName: 'Our Company',
    supportEmail: 'support@example.com',
    supportPhone: '',
    
    // Common message defaults
    greeting: 'Hello',
    signature: 'The Team',
    
    // Time-related defaults
    expiryTime: '24',
    appointmentTime: 'the scheduled time',
    appointmentDate: 'the scheduled date',
    
    // Link defaults
    verificationLink: '#verification-link#',
    resetLink: '#reset-link#',
    unsubscribeLink: '#unsubscribe-link#',
    
    // Other common defaults
    otpCode: '******',
    amount: '0.00',
    referenceNumber: 'N/A',
    
    // Flags for conditional content
    showPromotionalContent: false,
    showLegalDisclaimer: true
  };
  
  /**
   * Get a template based on type, name, and language
   * 
   * This function retrieves the appropriate template from the template store.
   * If the template is not available in the requested language, it tries to find
   * the best match based on the language fallback chain or falls back to the default language.
   * 
   * @param {string} type - The template type (e.g., 'email', 'sms')
   * @param {string} name - The template name (e.g., 'welcome', 'otp')
   * @param {string|string[]} language - The language code(s) (e.g., 'en', 'es', ['es-MX', 'es', 'en'])
   * @param {Object} [options] - Additional options for template retrieval
   * @param {boolean} [options.strictMode=false] - If true, returns null instead of falling back to another language
   * @param {boolean} [options.includeMetadata=false] - If true, includes metadata about the template retrieval
   * @returns {Object|string|null} The template content, metadata object, or null if not found
   */
  function getTemplate(type, name, language, options = {}) {
    // Destructure options with defaults
    const { strictMode = false, includeMetadata = false } = options;
    
    // Input validation
    if (!type || !name) {
      console.error('Template type and name are required');
      return null;
    }
  
    // Convert single language string to array for consistent processing
    const languagePreferences = Array.isArray(language) 
      ? language 
      : language ? [language] : [DEFAULT_LANGUAGE];
    
    // Normalize language codes
    const normalizedLanguages = languagePreferences.map(lang => lang.toLowerCase());
    
    // Create metadata object if requested
    const metadata = includeMetadata ? {
      type,
      name,
      requestedLanguages: [...normalizedLanguages],
      selectedLanguage: null,
      fallbackUsed: false,
      strictMode,
      timestamp: new Date().toISOString()
    } : null;
  
    try {
      // Check if the template type exists
      if (!templates[type]) {
        console.warn(`Template type '${type}' not found`);
        return null;
      }
  
      // Check if the template name exists for this type
      if (!templates[type][name]) {
        console.warn(`Template name '${name}' not found for type '${type}'`);
        return null;
      }
  
      // Try each language in the preference order
      let template = null;
      let selectedLanguage = null;
  
      for (const lang of normalizedLanguages) {
        if (templates[type][name][lang]) {
          template = templates[type][name][lang];
          selectedLanguage = lang;
          break;
        }
      }
  
      // If no template found in preferred languages and not in strict mode,
      // fall back to default language
      if (!template && !strictMode && !normalizedLanguages.includes(DEFAULT_LANGUAGE)) {
        console.info(`Template '${type}.${name}' not available in preferred languages, falling back to '${DEFAULT_LANGUAGE}'`);
        template = templates[type][name][DEFAULT_LANGUAGE];
        selectedLanguage = DEFAULT_LANGUAGE;
  
        if (metadata) {
          metadata.fallbackUsed = true;
        }
      }
  
      // Update metadata if requested
      if (metadata && template) {
        metadata.selectedLanguage = selectedLanguage;
        // Return the template along with metadata
        return { template, metadata };
      }
  
      return template || null;
    } catch (error) {
      console.error(`Error retrieving template '${type}.${name}' with languages [${normalizedLanguages.join(', ')}]:`, error);
      return null;
    }
  }
  
  /**
   * Render a template by replacing placeholders with actual values
   *
   * @param {string|Object} template - The template string or object with template properties
   * @param {Object} data - The data to use for rendering
   * @param {Object} [options] - Additional options for template rendering
   * @param {boolean} [options.preserveMetadata=false] - If true, the metadata object is preserved in the returned object
   * @param {Object} [options.defaultValues] - Custom default values to use for missing fields
   * @param {boolean} [options.removeUnreplacedPlaceholders=false] - If true, removes any unreplaced {{placeholders}}
   * @returns {string|Object} The rendered template
   */
  function renderTemplate(template, data, options = {}) {
    const { 
      preserveMetadata = false, 
      defaultValues = {}, 
      removeUnreplacedPlaceholders = false 
    } = options;
    
    // No template to render
    if (!template) return null;
    
    // Prepare data with defaults for rendering
    const renderData = data || {};
    
    // If the template includes metadata from getTemplate() with includeMetadata option
    if (template && template.metadata && template.template) {
      const renderedTemplate = renderTemplateContent(
        template.template, 
        renderData, 
        defaultValues, 
        removeUnreplacedPlaceholders
      );
      return preserveMetadata ? { template: renderedTemplate, metadata: template.metadata } : renderedTemplate;
    }
    
    // Regular template rendering
    return renderTemplateContent(template, renderData, defaultValues, removeUnreplacedPlaceholders);
  }
  
  /**
   * Internal helper to render template content with placeholders
   * 
   * @param {string|Object} template - The template string or object with template properties
   * @param {Object} data - The data object with values
   * @param {Object} defaultValues - Custom default values to use for missing fields
   * @param {boolean} removeUnreplacedPlaceholders - Whether to remove unreplaced placeholders
   * @returns {string|Object} The rendered template
   * @private
   */
  function renderTemplateContent(template, data, defaultValues, removeUnreplacedPlaceholders) {
    // Handle different template types
    if (typeof template === 'string') {
      // Simple string template
      return renderString(template, data, defaultValues, removeUnreplacedPlaceholders);
    } else if (typeof template === 'object') {
      // Object with multiple string properties (e.g., email with subject and body)
      const rendered = {};
      
      Object.keys(template).forEach(key => {
        if (typeof template[key] === 'string') {
          rendered[key] = renderString(template[key], data, defaultValues, removeUnreplacedPlaceholders);
        } else {
          rendered[key] = template[key];
        }
      });
      
      return rendered;
    }
    
    // Return unmodified if not a string or object
    return template;
  }
  
  /**
   * Render a string by replacing placeholders with values
   * 
   * @param {string} str - The template string
   * @param {Object} data - The data object with values
   * @param {Object} customDefaults - Custom default values to use for missing fields
   * @param {boolean} removeUnreplacedPlaceholders - Whether to remove unreplaced placeholders
   * @returns {string} The rendered string
   * @private
   */
  function renderString(str, data, customDefaults, removeUnreplacedPlaceholders) {
    if (typeof str !== 'string') return str;
    
    let result = str;
    
    // Find all unique placeholders in the template
    const placeholderRegex = /{{([^{}]+)}}/g;
    const placeholders = new Set();
    let match;
    
    while ((match = placeholderRegex.exec(str)) !== null) {
      placeholders.add(match[1]);
    }
    
    // Combine default values (custom defaults take precedence over global defaults)
    const mergedDefaults = { ...DEFAULT_FIELD_VALUES, ...customDefaults };
    
    // Process each placeholder
    placeholders.forEach(placeholder => {
      // Check if data contains the placeholder value
      if (data[placeholder] !== undefined && data[placeholder] !== null) {
        // Use provided value
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, data[placeholder]);
      } 
      // Check if we have a default value for this placeholder
      else if (mergedDefaults[placeholder] !== undefined) {
        // Use default value
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, mergedDefaults[placeholder]);
      }
      // If removeUnreplacedPlaceholders is true, remove the unreplaced placeholder
      else if (removeUnreplacedPlaceholders) {
        const regex = new RegExp(`{{${placeholder}}}`, 'g');
        result = result.replace(regex, '');
      }
      // Otherwise leave the placeholder as is
    });
    
    return result;
  }
  
  /**
   * Set custom default values for template fields
   * 
   * @param {Object} newDefaults - Object containing new default values to set
   * @param {boolean} [merge=true] - If true, merge with existing defaults; if false, replace them
   * @returns {Object} The updated default values
   */
  function setDefaultFieldValues(newDefaults, merge = true) {
    if (!newDefaults || typeof newDefaults !== 'object') {
      console.error('Invalid default values provided');
      return DEFAULT_FIELD_VALUES;
    }
    
    if (merge) {
      // Merge new defaults with existing ones
      Object.assign(DEFAULT_FIELD_VALUES, newDefaults);
    } else {
      // Replace all default values
      Object.keys(DEFAULT_FIELD_VALUES).forEach(key => {
        delete DEFAULT_FIELD_VALUES[key];
      });
      Object.assign(DEFAULT_FIELD_VALUES, newDefaults);
    }
    
    return { ...DEFAULT_FIELD_VALUES };
  }
  
  /**
   * Get the current default field values
   * 
   * @returns {Object} The current default values
   */
  function getDefaultFieldValues() {
    return { ...DEFAULT_FIELD_VALUES };
  }
  
  /**
   * List all available templates, optionally filtered by type
   * 
   * @param {string} [type] - Optional template type to filter by
   * @returns {Array} Array of available templates with their metadata
   */
  function listAvailableTemplates(type) {
    try {
      const result = [];
      
      // Determine which types to process
      const typesToProcess = type ? [type] : Object.keys(templates);
      
      // Collect template information
      typesToProcess.forEach(templateType => {
        if (!templates[templateType]) return;
        
        const templateNames = Object.keys(templates[templateType]);
        
        templateNames.forEach(templateName => {
          const languages = Object.keys(templates[templateType][templateName]);
          
          result.push({
            type: templateType,
            name: templateName,
            availableLanguages: languages,
            defaultLanguage: languages.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : languages[0]
          });
        });
      });
      
      return result;
    } catch (error) {
      console.error('Error listing templates:', error);
      return [];
    }
  }
  
  /**
   * Check if a specific template exists
   * 
   * @param {string} type - The template type
   * @param {string} name - The template name
   * @param {string} [language] - Optional language to check
   * @returns {boolean} True if the template exists
   */
  function templateExists(type, name, language) {
    if (!type || !name) return false;
    
    try {
      // Check if template type exists
      if (!templates[type]) return false;
      
      // Check if template name exists
      if (!templates[type][name]) return false;
      
      // If language is specified, check if that language exists
      if (language) {
        return !!templates[type][name][language.toLowerCase()];
      }
      
      // Template type and name exist
      return true;
    } catch (error) {
      console.error('Error checking template existence:', error);
      return false;
    }
  }
  
  /**
   * Add a new template or update an existing one
   *
   * @param {string} type - The template type
   * @param {string} name - The template name
   * @param {string} language - The language code
   * @param {string|Object} templateContent - The template content
   * @returns {boolean} True if the template was successfully added/updated
   */
  function addTemplate(type, name, language, templateContent) {
    if (!type || !name || !language || !templateContent) {
      console.error('Template type, name, language, and content are required');
      return false;
    }
  
    try {
      // Normalize language code
      const normalizedLanguage = language.toLowerCase();
  
      // Initialize type if it doesn't exist
      if (!templates[type]) {
        templates[type] = {};
      }
  
      // Initialize name if it doesn't exist
      if (!templates[type][name]) {
        templates[type][name] = {};
      }
  
      // Add/update the template
      templates[type][name][normalizedLanguage] = templateContent;
      
      return true;
    } catch (error) {
      console.error(`Error adding template '${type}.${name}.${language}':`, error);
      return false;
    }
  }
  
  // Export the functions
  module.exports = {
    renderTemplate,
    DEFAULT_FIELD_VALUES,
    getTemplate,
    renderTemplate,
    listAvailableTemplates,
    templateExists,
    addTemplate,
    setDefaultFieldValues,
    getDefaultFieldValues,
    DEFAULT_LANGUAGE
  };