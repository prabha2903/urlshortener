// ============================================================
// FILE: backend/src/middleware/errorMiddleware.js
// PURPOSE: Global error handler — catches ALL errors thrown
//          anywhere in the app and returns clean JSON responses
//
// Must be registered LAST in Express (after all routes)
// Signature: (err, req, res, next) — 4 params tells Express it's an error handler
// ============================================================

/**
 * Global error handling middleware.
 * Normalizes all error types into a consistent JSON response.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log the full error in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 ERROR:", err);
  } else {
    // In production, only log the message (no stack trace exposure)
    console.error("🔴 ERROR:", err.message);
  }

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // -------------------------------------------------------
  // MONGOOSE: Duplicate key error (e.g., duplicate email)
  // Code 11000 = unique constraint violation
  // -------------------------------------------------------
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0]; // Which field caused it
    const value = err.keyValue[field];
    message = `"${value}" is already taken. Please use a different ${field}.`;
  }

  // -------------------------------------------------------
  // MONGOOSE: Validation error (schema-level validations failed)
  // -------------------------------------------------------
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    // Extract all individual validation messages
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // -------------------------------------------------------
  // MONGOOSE: Invalid ObjectId (e.g., /api/urls/notanid)
  // -------------------------------------------------------
  else if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: "${err.value}" is not a valid MongoDB ObjectId`;
  }

  // -------------------------------------------------------
  // JWT: Token errors (handled in authMiddleware but as fallback)
  // -------------------------------------------------------
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token. Please login again.";
  }

  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired. Please login again.";
  }

  // -------------------------------------------------------
  // Build the response object
  // -------------------------------------------------------
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  // Only include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;