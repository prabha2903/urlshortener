// ============================================================
// FILE: backend/src/routes/analyticsRoutes.js
// PURPOSE: Defines all analytics API endpoints
//          All routes are protected (JWT required)
// ============================================================

import express from "express";
import {
  getUrlAnalytics,
  getAnalyticsSummary,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateAnalyticsId } from "../middleware/validationMiddleware.js";

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// -------------------------------------------------------
// GET /api/analytics/summary
// Get aggregated stats across ALL user URLs
// Returns: { summary, topUrls, recentUrls }
// IMPORTANT: Register this BEFORE /:urlId to avoid conflict
// -------------------------------------------------------
router.get("/summary", getAnalyticsSummary);

// -------------------------------------------------------
// GET /api/analytics/:urlId
// Get detailed analytics for one specific URL
// Returns: { analytics } (clicks, visits, history)
// -------------------------------------------------------
router.get("/:urlId", validateAnalyticsId, getUrlAnalytics);

export default router;