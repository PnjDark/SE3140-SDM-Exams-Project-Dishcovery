/**
 * ERROR HANDLING UTILITIES
 * Standardized error responses across the application
 */

/**
 * Standard error response format
 */
const errorResponse = (statusCode, message, details = null) => ({
  statusCode,
  success: false,
  error: message,
  details: details ? { ...details } : undefined,
  timestamp: new Date().toISOString()
});

/**
 * Validation error response
 */
const validationError = (field, message) => ({
  statusCode: 400,
  success: false,
  error: 'Validation error',
  details: {
    field,
    message
  },
  timestamp: new Date().toISOString()
});

/**
 * Validation errors for multiple fields
 */
const multiFieldValidationError = (errors) => ({
  statusCode: 400,
  success: false,
  error: 'Validation failed',
  details: {
    fields: errors // Array of {field, message}
  },
  timestamp: new Date().toISOString()
});

/**
 * Authentication error
 */
const authError = (message = 'Authentication failed') => ({
  statusCode: 401,
  success: false,
  error: message,
  timestamp: new Date().toISOString()
});

/**
 * Authorization error (access denied)
 */
const forbiddenError = (message = 'Access denied') => ({
  statusCode: 403,
  success: false,
  error: message,
  timestamp: new Date().toISOString()
});

/**
 * Not found error
 */
const notFoundError = (resource = 'Resource') => ({
  statusCode: 404,
  success: false,
  error: `${resource} not found`,
  timestamp: new Date().toISOString()
});

/**
 * Conflict error (resource already exists)
 */
const conflictError = (message) => ({
  statusCode: 409,
  success: false,
  error: message,
  timestamp: new Date().toISOString()
});

/**
 * Server error
 */
const serverError = (message = 'Internal server error', error = null) => {
  const response = {
    statusCode: 500,
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  // Include error details in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.details = {
      error: error.message,
      stack: error.stack
    };
  }
  
  return response;
};

/**
 * Rate limit error
 */
const rateLimitError = (retryAfter = 60) => ({
  statusCode: 429,
  success: false,
  error: 'Too many requests. Please try again later.',
  details: {
    retryAfter
  },
  timestamp: new Date().toISOString()
});

/**
 * Bad request error
 */
const badRequestError = (message = 'Bad request') => ({
  statusCode: 400,
  success: false,
  error: message,
  timestamp: new Date().toISOString()
});

/**
 * Middleware to handle errors and send standardized response
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      const response = validationError('file', 'File size exceeds 5MB limit');
      return res.status(response.statusCode).json(response);
    }
    const response = badRequestError(err.message);
    return res.status(response.statusCode).json(response);
  }

  // Custom validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }

  // Default server error
  const response = serverError('An unexpected error occurred', err);
  res.status(response.statusCode).json(response);
};

/**
 * Async error wrapper (catches errors in async route handlers)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorResponse,
  validationError,
  multiFieldValidationError,
  authError,
  forbiddenError,
  notFoundError,
  conflictError,
  serverError,
  rateLimitError,
  badRequestError,
  errorHandler,
  asyncHandler
};
