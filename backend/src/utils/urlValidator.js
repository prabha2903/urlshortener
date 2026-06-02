// ============================================================
// FILE: backend/src/utils/urlValidator.js
// PURPOSE: Validates that a URL is properly formatted and safe
// ============================================================

import validator from "validator";

/**
 * Validates a URL string.
 *
 * Checks:
 *   1. Is it a non-empty string?
 *   2. Is it a valid URL format?
 *   3. Does it use http or https? (blocks ftp://, file://, etc.)
 *   4. Does it have a valid TLD?
 *
 * @param {string} url - The URL to validate
 * @returns {{ valid: boolean, message: string }}
 *
 * Examples:
 *   validateUrl("https://google.com")  → { valid: true }
 *   validateUrl("not-a-url")           → { valid: false, message: "..." }
 *   validateUrl("ftp://example.com")   → { valid: false, message: "..." }
 */
export const validateUrl = (url) => {
  // Must be a non-empty string
  if (!url || typeof url !== "string") {
    return { valid: false, message: "URL must be a non-empty string" };
  }

  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return { valid: false, message: "URL cannot be empty" };
  }

  // Must be a valid URL
  const isValidUrl = validator.isURL(trimmed, {
    protocols: ["http", "https"],      // Only allow http and https
    require_protocol: true,            // Must include http:// or https://
    require_valid_protocol: true,
    allow_underscores: false,
    allow_trailing_dot: false,
    allow_protocol_relative_urls: false,
  });

  if (!isValidUrl) {
    return {
      valid: false,
      message:
        "Invalid URL. Must be a valid http:// or https:// URL (e.g., https://example.com)",
    };
  }

  // Block localhost URLs in production for security
  if (process.env.NODE_ENV === "production") {
    const localPatterns = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
    ];
    const lowerUrl = trimmed.toLowerCase();
    for (const pattern of localPatterns) {
      if (lowerUrl.includes(pattern)) {
        return {
          valid: false,
          message: "Cannot shorten local/private URLs in production",
        };
      }
    }
  }

  return { valid: true, message: "Valid URL" };
};