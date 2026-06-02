// ============================================================
// FILE: backend/src/utils/asyncHandler.js
// PURPOSE: Wraps async route handlers to automatically catch
//          errors and pass them to Express error middleware
//
// Without this: every controller needs its own try/catch
// With this:    controllers stay clean, errors auto-forwarded
// ============================================================

/**
 * Wraps an async Express route handler and catches any thrown errors,
 * forwarding them to next() so the global error handler picks them up.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 *
 * Usage in routes:
 *   router.get("/", asyncHandler(async (req, res) => {
 *     const data = await someAsyncOperation();
 *     res.json(data);
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;