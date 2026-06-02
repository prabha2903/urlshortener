// ============================================================
// FILE: backend/src/utils/apiResponse.js
// PURPOSE: Standardizes all API responses for consistency
//
// Every API response follows the same structure:
// {
//   success: true/false,
//   message: "Human-readable message",
//   data: { ... }       (on success)
//   error: "..."        (on failure, dev mode only)
// }
// ============================================================

/**
 * Send a successful response.
 *
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable success message
 * @param {*} data - The response payload
 */
export const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 *
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {*} errors - Optional validation errors or extra context
 */
export const errorResponse = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};