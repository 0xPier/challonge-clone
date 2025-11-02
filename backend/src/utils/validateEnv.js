/**
 * Environment variable validation utility
 * Ensures all required environment variables are set before starting the server
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'NODE_ENV'
];

const optionalEnvVars = [
  'PORT',
  'BACKEND_PORT',
  'FRONTEND_URL',
  'JWT_EXPIRES_IN',
  'REDIS_URL',
  'REDIS_PASSWORD',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'UPLOAD_DIR'
];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
function validateEnv() {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Report missing required variables
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.\n');
    throw new Error('Missing required environment variables');
  }

  // Check optional but recommended variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  // Security checks
  if (process.env.NODE_ENV === 'production') {
    // Check JWT secret strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long in production');
    }

    // Check if using default values
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      console.error('❌ CRITICAL: You are using the default JWT_SECRET in production!');
      throw new Error('Default JWT_SECRET not allowed in production');
    }

    // Warn about missing optional but important variables
    if (warnings.length > 0) {
      console.warn('\n⚠️  Optional environment variables not set (recommended for production):');
      warnings.forEach(varName => {
        console.warn(`  - ${varName}`);
      });
      console.warn('');
    }
  }

  // Success message
  console.log('✅ Environment variables validated successfully');
  
  // Log environment info
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔐 JWT expiry: ${process.env.JWT_EXPIRES_IN || '7d'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}

/**
 * Gets environment-specific configuration
 */
function getConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || process.env.BACKEND_PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    redisUrl: process.env.REDIS_URL,
    redisPassword: process.env.REDIS_PASSWORD,
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development'
  };
}

module.exports = {
  validateEnv,
  getConfig
};
