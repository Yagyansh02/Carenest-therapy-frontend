/**
 * Production-grade error handling utilities
 */

import { env } from '../config/env';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends AppError {
  constructor(message = ERROR_MESSAGES.NETWORK) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
    this.name = 'NetworkError';
  }
}

/**
 * Parse error from API response
 */
export const parseApiError = (error) => {
  // Network error
  if (!error.response) {
    return {
      message: ERROR_MESSAGES.NETWORK,
      statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
      type: 'network',
    };
  }

  // API error response
  const { status, data } = error.response;
  
  let message = ERROR_MESSAGES.GENERIC;
  
  if (data?.message) {
    message = data.message;
  } else if (data?.error) {
    message = data.error;
  }

  return {
    message,
    statusCode: status,
    type: 'api',
    details: data?.details || null,
  };
};

/**
 * Handle error globally
 */
export const handleError = (error, context = '') => {
  // Log error in development, unless context is empty (suppressed)
  if (env.isDevelopment && context) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }

  // Send to error tracking service in production
  if (env.isProduction && env.enableErrorTracking) {
    // TODO: Integrate with Sentry, LogRocket, etc.
    sendToErrorTracking(error, context);
  }

  // Parse and return user-friendly error
  if (error.isAxiosError) {
    return parseApiError(error);
  }

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      type: 'app',
      details: error.details,
    };
  }

  // Unknown error
  return {
    message: ERROR_MESSAGES.GENERIC,
    statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    type: 'unknown',
  };
};

/**
 * Send error to tracking service
 */
const sendToErrorTracking = (error, context) => {
  // TODO: Implement error tracking integration
  // Example: Sentry.captureException(error, { tags: { context } });
  console.error('Error tracking:', { error, context });
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  const parsedError = handleError(error);
  return parsedError.message;
};

/**
 * Retry logic for failed requests
 */
export const retryRequest = async (
  requestFn,
  retries = 3,
  delay = 1000,
  backoff = 2
) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    // Don't retry on 4xx errors (client errors)
    if (error.response && error.response.status < 500) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(requestFn, retries - 1, delay * backoff, backoff);
  }
};

/**
 * Error boundary fallback
 */
export const getErrorBoundaryMessage = (error) => {
  if (env.isDevelopment) {
    return {
      title: 'Application Error',
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    title: 'Something went wrong',
    message: 'We\'re sorry for the inconvenience. Please refresh the page or contact support.',
    stack: null,
  };
};
