// ============================================================
// FILE: backend/src/routes/redirectRoutes.js
// PURPOSE: Public routes for short URL redirect and preview
//          No authentication required
// ============================================================

import express from "express";
import { redirectUrl, previewUrl } from "../controllers/redirectController.js";
import { redirectLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// -------------------------------------------------------
// GET /api/preview/:shortCode
// Preview a short URL without redirecting or tracking
// Returns: { originalUrl, clicks, expiresAt, ... }
// Register BEFORE /:shortCode to avoid conflict
// -------------------------------------------------------
router.get("/preview/:shortCode", previewUrl);

// -------------------------------------------------------
// GET /:shortCode
// Main redirect — resolves short code to original URL
// Records click analytics, then redirects (302)
// Rate limited to prevent abuse
// -------------------------------------------------------
router.get("/:shortCode", redirectLimiter, redirectUrl);

export default router;