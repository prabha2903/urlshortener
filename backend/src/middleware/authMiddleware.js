// ============================================================
// FILE: backend/src/middleware/authMiddleware.js
// PURPOSE: Protects routes by verifying JWT tokens
//          Attaches the authenticated user to req.user
// ============================================================

import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import { errorResponse } from "../utils/apiResponse.js";

// -------------------------------------------------------
// PROTECT MIDDLEWARE
// Verifies the JWT token in Authorization header
// Attaches decoded user to req.user
// -------------------------------------------------------
export const protect = async (req, res, next) => {
  try {
    let token;

    // Token must be in Authorization header as: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    }

    // No token provided
    if (!token) {
      return errorResponse(
        res,
        401,
        "Access denied. No token provided. Please login first."
      );
    }

    // Verify the token (throws if invalid or expired)
    const decoded = verifyToken(token);

    // Find user in DB — ensures user still exists and is active
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return errorResponse(
        res,
        401,
        "Token is valid but user no longer exists. Please signup again."
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        403,
        "Your account has been deactivated. Contact support."
      );
    }

    // Attach user to request — available in all downstream handlers
    req.user = user;

    next(); // Pass to the next middleware or route handler

  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token. Please login again.");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(
        res,
        401,
        "Token has expired. Please login again."
      );
    }
    if (error.name === "NotBeforeError") {
      return errorResponse(res, 401, "Token not yet active.");
    }

    // Unexpected error
    return errorResponse(res, 500, "Authentication error: " + error.message);
  }
};

// -------------------------------------------------------
// RESTRICT TO ROLES MIDDLEWARE
// Usage: router.delete("/admin/x", protect, restrictTo("admin"), handler)
// -------------------------------------------------------
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. This action requires one of these roles: ${roles.join(", ")}`
      );
    }
    next();
  };
};