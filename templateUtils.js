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

  /**
 * Get all templates filtered by notification type
 * 
 * This function returns all available templates for a specific notification type (e.g., email or SMS),
 * optionally filtered by language and with template contents included.
 * 
 * @param {string} type - The notification type to filter by (e.g., 'email', 'sms')
 * @param {Object} [options] - Additional options for filtering and template retrieval
 * @param {string|string[]} [options.language] - Filter by language or language preference array
 * @param {boolean} [options.includeContent=true] - Whether to include the actual template content
 * @param {boolean} [options.flattenStructure=false] - If true, returns a flat list of templates instead of hierarchical
 * @param {boolean} [options.strictLanguage=false] - If true, only returns templates that match the exact language
 * @returns {Object|Array} The filtered templates in requested format
 */
function getTemplatesByType(type, options = {}) {
    const {
      language = null, 
      includeContent = true, 
      flattenStructure = false,
      strictLanguage = false
    } = options;
    
    // Input validation
    if (!type) {
      console.error('Template type is required');
      return flattenStructure ? [] : {};
    }
  
    // Check if the type exists
    if (!templates[type]) {
      console.warn(`No templates found for type '${type}'`);
      return flattenStructure ? [] : {};
    }
    
    // Normalize language preferences if provided
    const languagePreferences = language ? (
      Array.isArray(language) 
        ? language.map(lang => lang.toLowerCase())
        : [language.toLowerCase()]
    ) : null;
    
    // Default language as fallback if not in strict language mode
    const useDefaultFallback = !strictLanguage && languagePreferences?.includes(DEFAULT_LANGUAGE) === false;
    
    try {
      // Process templates based on the specified type
      const templateNames = Object.keys(templates[type]);
      
      // Return flat array format if requested
      if (flattenStructure) {
        const result = [];
        
        for (const templateName of templateNames) {
          // Get available languages for this template
          const availableLanguages = Object.keys(templates[type][templateName]);
          
          // If language filter is provided, process accordingly
          if (languagePreferences) {
            let selectedLanguage = null;
            
            // Find the first matching language in order of preference
            for (const lang of languagePreferences) {
              if (availableLanguages.includes(lang)) {
                selectedLanguage = lang;
                break;
              }
            }
            
            // If no match found and not in strict mode, fall back to default
            if (!selectedLanguage && !strictLanguage && useDefaultFallback && 
                availableLanguages.includes(DEFAULT_LANGUAGE)) {
              selectedLanguage = DEFAULT_LANGUAGE;
            }
            
            // Skip if no matching language found
            if (!selectedLanguage) continue;
            
            // Add template to results
            result.push({
              type,
              name: templateName,
              language: selectedLanguage,
              content: includeContent ? templates[type][templateName][selectedLanguage] : undefined
            });
          } else {
            // No language filter - add all language variants
            for (const lang of availableLanguages) {
              result.push({
                type,
                name: templateName,
                language: lang,
                content: includeContent ? templates[type][templateName][lang] : undefined
              });
            }
          }
        }
        
        return result;
      } 
      // Return hierarchical structure (default)
      else {
        const result = {};
        
        for (const templateName of templateNames) {
          const templateLanguages = templates[type][templateName];
          const availableLanguages = Object.keys(templateLanguages);
          
          // Initialize template entry
          result[templateName] = {};
          
          // If language filter is provided, process accordingly
          if (languagePreferences) {
            let selectedLanguages = [];
            
            // Find all matching languages
            for (const lang of languagePreferences) {
              if (availableLanguages.includes(lang)) {
                selectedLanguages.push(lang);
              }
            }
            
            // If no matches found and not in strict mode, fall back to default language
            if (selectedLanguages.length === 0 && !strictLanguage && useDefaultFallback && 
                availableLanguages.includes(DEFAULT_LANGUAGE)) {
              selectedLanguages.push(DEFAULT_LANGUAGE);
            }
            
            // Skip if no matching languages found
            if (selectedLanguages.length === 0) {
              delete result[templateName];
              continue;
            }
            
            // Add matching language templates
            for (const lang of selectedLanguages) {
              result[templateName][lang] = includeContent 
                ? templateLanguages[lang] 
                : { available: true };
            }
          } else {
            // No language filter - include all language variants
            for (const lang of availableLanguages) {
              result[templateName][lang] = includeContent 
                ? templateLanguages[lang] 
                : { available: true };
            }
          }
        }
        
        return result;
      }
    } catch (error) {
      console.error(`Error retrieving templates for type '${type}':`, error);
      return flattenStructure ? [] : {};
    }
  }
  
  /**
   * Get a list of unique template names for a specific notification type
   * 
   * @param {string} type - The notification type (e.g., 'email', 'sms')
   * @returns {string[]} Array of template names
   */
  function getTemplateNamesByType(type) {
    if (!type || !templates[type]) {
      return [];
    }
    
    return Object.keys(templates[type]);
  }
  
  // Additional utility functions for template selection
  
  /**
   * Get template by name for a specific notification type, with built-in language selection
   * 
   * This is a convenience function that combines getTemplate and renderTemplate in one step,
   * making it easy to get and use templates with proper language handling.
   * 
   * @param {string} type - The notification type (e.g., 'email', 'sms') 
   * @param {string} name - The template name
   * @param {Object} data - The data to use for rendering
   * @param {Object} [options] - Additional options
   * @param {string|string[]} [options.language] - Language preference(s)
   * @param {Object} [options.defaultValues] - Custom default values
   * @param {boolean} [options.removeUnreplacedPlaceholders=false] - If true, removes unreplaced placeholders
   * @returns {Object} The rendered template with metadata
   */
  function getAndRenderTemplate(type, name, data, options = {}) {
    const {
      language = DEFAULT_LANGUAGE,
      defaultValues = {},
      removeUnreplacedPlaceholders = false,
      includeMetadata = true
    } = options;
    
    // Get the template with metadata
    const templateResult = getTemplate(type, name, language, { includeMetadata: true });
    
    if (!templateResult) {
      return null;
    }
    
    // Render the template with defaults
    const rendered = renderTemplate(templateResult, data, {
      preserveMetadata: includeMetadata,
      defaultValues,
      removeUnreplacedPlaceholders
    });
    
    return rendered;
  }

  /**
 * Get all templates available in a specific language
 * 
 * This function scans the entire template registry and returns a list of all templates
 * that are available in the requested language.
 * 
 * @param {string} language - The language code to search for (e.g., 'en', 'es', 'fr')
 * @param {Object} [options] - Additional options for filtering and retrieval
 * @param {boolean} [options.includeContent=false] - Whether to include the actual template content
 * @param {boolean} [options.groupByType=true] - If true, templates are grouped by notification type
 * @param {boolean} [options.includeMetadata=true] - If true, includes metadata about each template
 * @param {string} [options.specificType] - Optionally limit search to a specific template type
 * @returns {Object|Array} The templates available in the requested language
 */
function getTemplatesByLanguage(language, options = {}) {
    const {
      includeContent = false,
      groupByType = true,
      includeMetadata = true,
      specificType = null
    } = options;
    
    // Input validation
    if (!language) {
      console.error('Language code is required');
      return groupByType ? {} : [];
    }
    
    // Normalize language code
    const normalizedLanguage = language.toLowerCase();
    
    try {
      // Determine which types to process (all or specific)
      const typesToProcess = specificType 
        ? (templates[specificType] ? [specificType] : [])
        : Object.keys(templates);
      
      // If no valid types to process
      if (typesToProcess.length === 0) {
        return groupByType ? {} : [];
      }
      
      // If grouping by type (hierarchical structure)
      if (groupByType) {
        const result = {};
        
        // Process each template type
        for (const type of typesToProcess) {
          result[type] = {};
          let languageFound = false;
          
          // Check each template name within this type
          const templateNames = Object.keys(templates[type]);
          for (const name of templateNames) {
            // Check if this template is available in the requested language
            if (templates[type][name][normalizedLanguage]) {
              languageFound = true;
              
              // Create entry with or without content
              if (includeContent) {
                result[type][name] = templates[type][name][normalizedLanguage];
              } else if (includeMetadata) {
                // Include metadata but not content
                const templateKeys = templates[type][name][normalizedLanguage] instanceof Object
                  ? Object.keys(templates[type][name][normalizedLanguage])
                  : ['content']; // For string templates
                
                result[type][name] = {
                  available: true,
                  type,
                  name,
                  language: normalizedLanguage,
                  contentType: typeof templates[type][name][normalizedLanguage],
                  fields: templateKeys
                };
              } else {
                // Just indicate availability
                result[type][name] = { available: true };
              }
            }
          }
          
          // Remove empty types
          if (!languageFound) {
            delete result[type];
          }
        }
        
        return result;
      }
      // Flat list structure
      else {
        const result = [];
        
        // Process each template type
        for (const type of typesToProcess) {
          const templateNames = Object.keys(templates[type]);
          
          // Check each template name within this type
          for (const name of templateNames) {
            // Check if this template is available in the requested language
            if (templates[type][name][normalizedLanguage]) {
              // Create template entry
              const templateEntry = {
                type,
                name,
                language: normalizedLanguage
              };
              
              // Add content if requested
              if (includeContent) {
                templateEntry.content = templates[type][name][normalizedLanguage];
              }
              
              // Add metadata if requested
              if (includeMetadata) {
                const isObject = typeof templates[type][name][normalizedLanguage] === 'object';
                templateEntry.contentType = isObject ? 'object' : 'string';
                
                if (isObject) {
                  templateEntry.fields = Object.keys(templates[type][name][normalizedLanguage]);
                }
                
                // Check other available languages for this template
                const allLanguagesForTemplate = Object.keys(templates[type][name]);
                templateEntry.availableLanguages = allLanguagesForTemplate;
              }
              
              result.push(templateEntry);
            }
          }
        }
        
        return result;
      }
    } catch (error) {
      console.error(`Error retrieving templates for language '${language}':`, error);
      return groupByType ? {} : [];
    }
  }
  
  /**
   * Get a list of all languages available across all templates or specific template types
   * 
   * @param {string} [type] - Optional template type to limit the search
   * @returns {string[]} Array of language codes
   */
  function getAllAvailableLanguages(type = null) {
    try {
      const languages = new Set();
      
      // Determine which types to process
      const typesToProcess = type ? (templates[type] ? [type] : []) : Object.keys(templates);
      
      // Process each template type
      for (const templateType of typesToProcess) {
        const templateNames = Object.keys(templates[templateType]);
        
        // Process each template name
        for (const templateName of templateNames) {
          // Add all languages for this template
          const templateLanguages = Object.keys(templates[templateType][templateName]);
          templateLanguages.forEach(lang => languages.add(lang));
        }
      }
      
      return [...languages];
    } catch (error) {
      console.error('Error getting available languages:', error);
      return [];
    }
  }
  
  /**
   * Check if a specific language is supported by any template
   * 
   * @param {string} language - The language code to check
   * @param {string} [type] - Optional template type to limit the check
   * @returns {boolean} True if the language is supported
   */
  function isLanguageSupported(language, type = null) {
    if (!language) return false;
    
    const normalizedLanguage = language.toLowerCase();
    const availableLanguages = getAllAvailableLanguages(type);
    
    return availableLanguages.includes(normalizedLanguage);
  }
  
  /**
   * Get language coverage statistics for templates
   * 
   * @param {string[]} [languages] - Optional array of languages to check (defaults to all available)
   * @param {string} [type] - Optional template type to limit the analysis
   * @returns {Object} Language coverage statistics
   */
  function getLanguageCoverageStats(languages = null, type = null) {
    try {
      // Get all available languages if not specified
      const allLanguages = languages || getAllAvailableLanguages();
      
      // Get all available template types
      const typesToProcess = type ? (templates[type] ? [type] : []) : Object.keys(templates);
      
      // Initialize result structure
      const result = {
        languages: {},
        totalTemplates: 0,
        totalTypes: typesToProcess.length,
        typeBreakdown: {},
        mostCoveredTemplates: [],
        leastCoveredTemplates: []
      };
      
      // Count total templates first
      let templateCount = 0;
      for (const templateType of typesToProcess) {
        const templateNames = Object.keys(templates[templateType]);
        templateCount += templateNames.length;
        result.typeBreakdown[templateType] = {
          totalTemplates: templateNames.length,
          templates: {}
        };
      }
      
      result.totalTemplates = templateCount;
      
      // Initialize language stats
      for (const lang of allLanguages) {
        result.languages[lang] = {
          count: 0,
          percentage: 0,
          templates: [],
          missingTemplates: []
        };
      }
      
      // Calculate coverage
      for (const templateType of typesToProcess) {
        const templateNames = Object.keys(templates[templateType]);
        
        for (const templateName of templateNames) {
          const availableLanguages = Object.keys(templates[templateType][templateName]);
          const templateKey = `${templateType}.${templateName}`;
          
          // Track languages for this template
          result.typeBreakdown[templateType].templates[templateName] = {
            availableLanguages,
            coverage: availableLanguages.length / allLanguages.length
          };
          
          // Update language stats
          for (const lang of allLanguages) {
            if (availableLanguages.includes(lang)) {
              result.languages[lang].count++;
              result.languages[lang].templates.push(templateKey);
            } else {
              result.languages[lang].missingTemplates.push(templateKey);
            }
          }
        }
      }
      
      // Calculate percentages
      for (const lang of allLanguages) {
        result.languages[lang].percentage = 
          (result.languages[lang].count / result.totalTemplates) * 100;
      }
      
      // Find most and least covered templates
      const templateCoverage = {};
      for (const templateType of typesToProcess) {
        const templateNames = Object.keys(templates[templateType]);
        
        for (const templateName of templateNames) {
          const availableLanguages = Object.keys(templates[templateType][templateName]);
          const templateKey = `${templateType}.${templateName}`;
          
          templateCoverage[templateKey] = {
            type: templateType,
            name: templateName,
            languages: availableLanguages,
            coverage: availableLanguages.length / allLanguages.length
          };
        }
      }
      
      // Sort by coverage and take top/bottom 5
      const sortedTemplates = Object.entries(templateCoverage)
        .sort((a, b) => b[1].coverage - a[1].coverage);
      
      result.mostCoveredTemplates = sortedTemplates.slice(0, 5).map(([key, value]) => ({
        template: key,
        languages: value.languages,
        coveragePercent: value.coverage * 100
      }));
      
      result.leastCoveredTemplates = sortedTemplates
        .slice(-5)
        .map(([key, value]) => ({
          template: key,
          languages: value.languages,
          coveragePercent: value.coverage * 100
        }))
        .reverse(); // Show worst first
      
      return result;
    } catch (error) {
      console.error('Error getting language coverage stats:', error);
      return { error: 'Failed to analyze language coverage' };
    }
  }
  
  /**
   * Find templates that need translation for a specific language
   * 
   * @param {string} targetLanguage - The language to check for missing translations
   * @param {Array} [referenceLanguages=['en']] - Languages to use as reference
   * @returns {Array} List of templates that need translation
   */
  function findMissingTranslations(targetLanguage, referenceLanguages = ['en']) {
    if (!targetLanguage) {
      console.error('Target language is required');
      return [];
    }
    
    const normalizedTarget = targetLanguage.toLowerCase();
    const normalizedReferences = referenceLanguages.map(lang => lang.toLowerCase());
    
    try {
      const result = [];
      
      // Process all template types
      for (const type of Object.keys(templates)) {
        for (const name of Object.keys(templates[type])) {
          // Check if template exists in any reference language
          const existsInReference = normalizedReferences.some(
            refLang => templates[type][name][refLang]
          );
          
          // Skip if not in any reference language
          if (!existsInReference) continue;
          
          // Check if target language version exists
          if (!templates[type][name][normalizedTarget]) {
            result.push({
              type,
              name,
              availableLanguages: Object.keys(templates[type][name]),
              referenceLanguage: normalizedReferences.find(
                refLang => templates[type][name][refLang]
              )
            });
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error(`Error finding missing translations for language '${targetLanguage}':`, error);
      return [];
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
    DEFAULT_LANGUAGE,
    getTemplatesByType,
    getTemplateNamesByType,
    getAndRenderTemplate,
    getTemplatesByLanguage,
    getLanguageCoverageStats,
    isLanguageSupported,
    findMissingTranslations
  };