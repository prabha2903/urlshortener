// ============================================================
// FILE: backend/src/middleware/rateLimitMiddleware.js
// PURPOSE: Prevents brute force attacks and API abuse
//          Different limits for auth vs general API routes
// ============================================================

import rateLimit from "express-rate-limit";

// -------------------------------------------------------
// GENERAL API RATE LIMITER
// Applied to all /api/* routes
// 100 requests per 15 minutes per IP
// -------------------------------------------------------
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests from this IP. Please wait 15 minutes and try again.",
  },
  standardHeaders: true,  // Include rate limit info in response headers
  legacyHeaders: false,   // Disable deprecated X-RateLimit headers
  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP. Please wait and try again.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// -------------------------------------------------------
// AUTH RATE LIMITER (Stricter)
// Applied to /api/auth/login and /api/auth/signup
// 10 requests per 15 minutes per IP
// Prevents brute force password attacks
// -------------------------------------------------------
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Only 10 login/signup attempts per window
  message: {
    success: false,
    message: "Too many login attempts. Please wait 15 minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
});

// -------------------------------------------------------
// REDIRECT RATE LIMITER
// Applied to /:shortCode redirect routes
// 200 requests per minute per IP (higher for public access)
// -------------------------------------------------------
export const redirectLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: {
    success: false,
    message: "Too many redirect requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});