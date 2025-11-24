/**
 * Security utilities for production
 */

import { env } from '../config/env';
import { logger } from './logger';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url) => {
  try {
    const parsedURL = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      logger.warn('Blocked non-HTTP(S) URL', { url });
      return null;
    }
    
    return parsedURL.href;
  } catch (error) {
    logger.warn('Invalid URL provided', { url });
    return null;
  }
};

/**
 * Content Security Policy headers (for server)
 */
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' " + env.apiBaseUrl,
    "frame-ancestors 'none'",
  ].join('; '),
};

/**
 * Rate limiting for client-side actions
 */
class RateLimiter {
  constructor(maxAttempts, windowMs) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  /**
   * Check if action is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = userAttempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    
    if (recentAttempts.length >= this.maxAttempts) {
      logger.warn('Rate limit exceeded', { key, attempts: recentAttempts.length });
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  /**
   * Reset attempts for a key
   */
  reset(key) {
    this.attempts.delete(key);
  }

  /**
   * Clear all attempts
   */
  clearAll() {
    this.attempts.clear();
  }
}

/**
 * Login rate limiter (5 attempts per 15 minutes)
 */
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

/**
 * API rate limiter (60 requests per minute)
 */
export const apiRateLimiter = new RateLimiter(60, 60 * 1000);

/**
 * Validate file upload
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed',
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop().toLowerCase();
  const allowedExtensions = allowedTypes.map((type) => {
    const ext = type.split('/').pop();
    return ext === 'jpeg' ? 'jpg' : ext;
  });

  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'File extension not allowed',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Secure token storage
 */
export const tokenStorage = {
  /**
   * Store token securely
   */
  set(key, value) {
    try {
      // In production, consider using secure storage like IndexedDB with encryption
      if (env.isProduction) {
        // Store in memory only for production (more secure)
        sessionStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      logger.error('Failed to store token', { error });
    }
  },

  /**
   * Retrieve token
   */
  get(key) {
    try {
      return sessionStorage.getItem(key) || localStorage.getItem(key);
    } catch (error) {
      logger.error('Failed to retrieve token', { error });
      return null;
    }
  },

  /**
   * Remove token
   */
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Failed to remove token', { error });
    }
  },

  /**
   * Clear all tokens
   */
  clear() {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (error) {
      logger.error('Failed to clear storage', { error });
    }
  },
};

/**
 * Detect and prevent clickjacking
 */
export const preventClickjacking = () => {
  if (window.self !== window.top) {
    logger.warn('Potential clickjacking detected');
    window.top.location = window.self.location;
  }
};

/**
 * Generate secure random string
 */
export const generateSecureRandom = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash sensitive data (client-side hashing for additional security)
 */
export const hashData = async (data) => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Mask sensitive data for logging
 */
export const maskSensitiveData = (data, fields = ['password', 'token', 'ssn', 'creditCard']) => {
  if (typeof data !== 'object' || data === null) return data;

  const masked = { ...data };
  
  fields.forEach((field) => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });

  return masked;
};

/**
 * Initialize security features
 */
export const initSecurity = () => {
  // Prevent clickjacking
  preventClickjacking();

  // Log security initialization
  logger.info('Security features initialized', {
    environment: env.environment,
    features: ['XSS Protection', 'Rate Limiting', 'Clickjacking Prevention'],
  });
};
