/**
 * Environment Configuration
 * Centralized environment variables with validation and defaults
 */

const requiredEnvVars = ['VITE_API_BASE_URL'];

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

// Run validation in development
if (import.meta.env.DEV) {
  validateEnv();
}

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  environment: import.meta.env.VITE_ENV || 'development',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'CareNest',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Token Configuration
  tokenRefreshThreshold: parseInt(
    import.meta.env.VITE_TOKEN_REFRESH_THRESHOLD || '300000',
    10
  ),
  tokenStorageKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'carenest_auth',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableErrorTracking: import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
};

// Freeze config to prevent modifications
Object.freeze(env);
