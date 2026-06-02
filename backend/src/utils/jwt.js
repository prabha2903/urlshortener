// ============================================================
// FILE: backend/src/utils/jwt.js
// PURPOSE: Generate and verify JWT tokens
// ============================================================

import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT token for a given user ID.
 *
 * @param {string} userId - The MongoDB _id of the user
 * @returns {string} Signed JWT token
 *
 * Example:
 *   const token = generateToken(user._id);
 */
export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id: userId },  // Payload: only embed user ID (keep it minimal)
    secret,
    { expiresIn }
  );
};

/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * @param {string} token - The JWT token to verify
 * @returns {object} Decoded payload { id, iat, exp }
 * @throws {Error} If token is invalid or expired
 *
 * Example:
 *   const decoded = verifyToken(token);
 *   console.log(decoded.id); // user's MongoDB _id
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, secret);
};