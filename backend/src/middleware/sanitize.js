const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Input sanitization middleware configuration
 * Prevents NoSQL injection and XSS attacks
 */

// MongoDB sanitization options
const mongoSanitizeOptions = {
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`[Security] Sanitized potentially malicious key: ${key}`);
  }
};

// Apply all sanitization middleware
const applySanitization = (app) => {
  // Prevent NoSQL injection by removing $ and . from user input
  app.use(mongoSanitize(mongoSanitizeOptions));
  
  // Prevent XSS attacks by cleaning user input
  app.use(xss());
};

module.exports = {
  applySanitization,
  mongoSanitize,
  xss
};
