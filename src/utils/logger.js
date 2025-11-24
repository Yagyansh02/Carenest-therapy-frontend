/**
 * Production-grade logging utility
 */

import { env } from '../config/env';

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  constructor() {
    this.isEnabled = env.isDevelopment || env.enableErrorTracking;
  }

  /**
   * Format log message with timestamp
   */
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data,
      env: env.environment,
    };
  }

  /**
   * Log to console (development) or external service (production)
   */
  log(level, message, data = null) {
    if (!this.isEnabled) return;

    const formattedLog = this.formatMessage(level, message, data);

    // Console logging in development
    if (env.isDevelopment) {
      const style = this.getConsoleStyle(level);
      console.log(
        `%c[${level.toUpperCase()}] ${message}`,
        style,
        data || ''
      );
    }

    // Send to external logging service in production
    if (env.isProduction && env.enableErrorTracking) {
      this.sendToExternalService(formattedLog);
    }

    // Store critical errors in localStorage for debugging
    if (level === LOG_LEVELS.ERROR) {
      this.storeErrorLocally(formattedLog);
    }
  }

  /**
   * Get console styling based on log level
   */
  getConsoleStyle(level) {
    const styles = {
      error: 'color: #ef4444; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      info: 'color: #3b82f6;',
      debug: 'color: #6b7280;',
    };
    return styles[level] || '';
  }

  /**
   * Send log to external service (e.g., LogRocket, Datadog)
   */
  sendToExternalService(log) {
    // TODO: Implement external logging service integration
    // Example: LogRocket.log(log);
    // Example: Datadog.logger.log(log.message, log);
  }

  /**
   * Store error in localStorage for debugging
   */
  storeErrorLocally(log) {
    try {
      const errors = JSON.parse(localStorage.getItem('carenest_errors') || '[]');
      errors.push(log);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift();
      }
      
      localStorage.setItem('carenest_errors', JSON.stringify(errors));
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Error level logging
   */
  error(message, data = null) {
    this.log(LOG_LEVELS.ERROR, message, data);
  }

  /**
   * Warning level logging
   */
  warn(message, data = null) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  /**
   * Info level logging
   */
  info(message, data = null) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  /**
   * Debug level logging
   */
  debug(message, data = null) {
    if (env.isDevelopment) {
      this.log(LOG_LEVELS.DEBUG, message, data);
    }
  }

  /**
   * API request logging
   */
  apiRequest(method, url, data = null) {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  /**
   * API response logging
   */
  apiResponse(method, url, status, data = null) {
    const level = status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;
    this.log(
      level,
      `API Response: ${method.toUpperCase()} ${url} - ${status}`,
      data
    );
  }

  /**
   * User action logging
   */
  userAction(action, details = null) {
    this.info(`User Action: ${action}`, details);
  }

  /**
   * Performance logging
   */
  performance(label, duration) {
    this.debug(`Performance: ${label} took ${duration}ms`);
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors() {
    try {
      localStorage.removeItem('carenest_errors');
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Get stored errors for debugging
   */
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('carenest_errors') || '[]');
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export log levels
export { LOG_LEVELS };

// Convenience exports
export const logError = (message, data) => logger.error(message, data);
export const logWarn = (message, data) => logger.warn(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logDebug = (message, data) => logger.debug(message, data);
