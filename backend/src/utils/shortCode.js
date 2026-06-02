// ============================================================
// FILE: backend/src/utils/shortCode.js
// PURPOSE: Generates unique random short codes for URLs
//          Uses nanoid for URL-safe, collision-resistant IDs
// ============================================================

import { nanoid } from "nanoid";
import Url from "../models/Url.js";

/**
 * Generates a unique short code that doesn't already exist in the DB.
 *
 * Strategy:
 *   1. Generate a random 7-character nanoid
 *   2. Check if it already exists in the database
 *   3. Retry up to 5 times if collision found (extremely rare)
 *   4. Throw error if all attempts fail
 *
 * @param {number} length - Length of the short code (default: 7)
 * @returns {Promise<string>} Unique short code
 *
 * Example output: "k3Xp2mN"
 */
export const generateUniqueShortCode = async (length = 7) => {
  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // nanoid generates URL-safe characters: A-Za-z0-9_-
    const code = nanoid(length);

    // Check DB for collision
    const existing = await Url.findOne({ shortCode: code });

    if (!existing) {
      return code; // ✅ Unique code found
    }

    console.warn(`Short code collision on attempt ${attempt}: ${code}`);
  }

  // This should essentially never happen
  throw new Error(
    "Failed to generate a unique short code after multiple attempts. Try again."
  );
};

/**
 * Validates a custom alias provided by the user.
 *
 * Rules:
 *   - 3 to 20 characters
 *   - Only letters, numbers, hyphens, underscores
 *   - No spaces or special characters
 *
 * @param {string} alias - The custom alias to validate
 * @returns {{ valid: boolean, message: string }}
 */
export const validateCustomAlias = (alias) => {
  if (!alias || typeof alias !== "string") {
    return { valid: false, message: "Alias must be a non-empty string" };
  }

  if (alias.length < 3) {
    return { valid: false, message: "Alias must be at least 3 characters" };
  }

  if (alias.length > 20) {
    return { valid: false, message: "Alias cannot exceed 20 characters" };
  }

  // Only allow: letters, digits, hyphens, underscores
  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(alias)) {
    return {
      valid: false,
      message:
        "Alias can only contain letters, numbers, hyphens, and underscores",
    };
  }

  return { valid: true, message: "Valid alias" };
};