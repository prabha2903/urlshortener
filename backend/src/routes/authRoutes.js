// ============================================================
// FILE: backend/src/routes/authRoutes.js
// PURPOSE: Defines all authentication-related API endpoints
// ============================================================

import express from "express";
import {
  signup,
  login,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateSignup,
  validateLogin,
} from "../middleware/validationMiddleware.js";
import { authLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// -------------------------------------------------------
// PUBLIC ROUTES (No JWT required)
// -------------------------------------------------------

// POST /api/auth/signup
// Body: { name, email, password }
// Returns: { token, user }
router.post("/signup", authLimiter, validateSignup, signup);

// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user }
router.post("/login", authLimiter, validateLogin, login);

// -------------------------------------------------------
// PROTECTED ROUTES (JWT required)
// -------------------------------------------------------

// GET /api/auth/me
// Headers: Authorization: Bearer <token>
// Returns: { user }
router.get("/me", protect, getMe);

// PUT /api/auth/me
// Headers: Authorization: Bearer <token>
// Body: { name }
// Returns: { user }
router.put("/me", protect, updateProfile);

export default router;