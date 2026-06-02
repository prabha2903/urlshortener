// ============================================================
// FILE: backend/src/middleware/validationMiddleware.js
// PURPOSE: Validates incoming request bodies using express-validator
//          Returns structured error messages if validation fails
// ============================================================

import { body, param, validationResult } from "express-validator";

// -------------------------------------------------------
// HELPER: Run validation rules and respond if errors exist
// Call this at the end of every validation chain array
// -------------------------------------------------------
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into clean array
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed. Please fix the errors below.",
      errors: formattedErrors,
    });
  }

  next(); // All validations passed — continue to controller
};

// -------------------------------------------------------
// SIGNUP VALIDATION RULES
// -------------------------------------------------------
export const validateSignup = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(), // Lowercase and trim

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),

  handleValidationErrors,
];

// -------------------------------------------------------
// LOGIN VALIDATION RULES
// -------------------------------------------------------
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address"),

  body("password")
    .notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// -------------------------------------------------------
// CREATE URL VALIDATION RULES
// -------------------------------------------------------
export const validateCreateUrl = [
  body("originalUrl")
    .trim()
    .notEmpty().withMessage("Original URL is required")
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Must be a valid URL starting with http:// or https://"),

  body("customAlias")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Custom alias must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage("Alias can only contain letters, numbers, hyphens, and underscores"),

  body("expiresAt")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601().withMessage("Expiry date must be a valid ISO 8601 date (e.g., 2024-12-31T23:59:59Z)")
    .toDate(),

  handleValidationErrors,
];

// -------------------------------------------------------
// UPDATE URL VALIDATION RULES
// -------------------------------------------------------
export const validateUpdateUrl = [
  body("originalUrl")
    .optional()
    .trim()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Must be a valid URL starting with http:// or https://"),

  body("expiresAt")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true; // null is valid (remove expiry)
      if (isNaN(Date.parse(value))) throw new Error("Invalid date format");
      return true;
    }),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be true or false"),

  handleValidationErrors,
];

// -------------------------------------------------------
// MONGO ID PARAM VALIDATION
// -------------------------------------------------------
export const validateMongoId = [
  param("id")
    .isMongoId().withMessage("Invalid ID format. Must be a valid MongoDB ObjectId"),

  handleValidationErrors,
];

// -------------------------------------------------------
// ANALYTICS URL ID PARAM VALIDATION
// -------------------------------------------------------
export const validateAnalyticsId = [
  param("urlId")
    .isMongoId().withMessage("Invalid URL ID format"),

  handleValidationErrors,
];