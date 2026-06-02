// ============================================================
// FILE: backend/src/routes/urlRoutes.js
// PURPOSE: Defines all URL management API endpoints
//          All routes are protected (JWT required)
// ============================================================

import express from "express";
import {
  createShortUrl,
  getAllUrls,
  getUrlById,
  updateUrl,
  deleteUrl,
} from "../controllers/urlController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateCreateUrl,
  validateUpdateUrl,
  validateMongoId,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All URL routes require authentication
// Apply protect middleware to all routes in this router
router.use(protect);

// -------------------------------------------------------
// POST /api/urls
// Create a new short URL
// Body: { originalUrl, customAlias?, expiresAt? }
// Returns: { url }
// -------------------------------------------------------
router.post("/", validateCreateUrl, createShortUrl);

// -------------------------------------------------------
// GET /api/urls
// Get all URLs for the logged-in user (dashboard)
// Query params: page, limit, search, sortBy, sortOrder
// Returns: { urls, pagination }
// -------------------------------------------------------
router.get("/", getAllUrls);

// -------------------------------------------------------
// GET /api/urls/:id
// Get a single URL by its MongoDB _id
// Returns: { url }
// -------------------------------------------------------
router.get("/:id", validateMongoId, getUrlById);

// -------------------------------------------------------
// PUT /api/urls/:id
// Update a URL (originalUrl, expiresAt, isActive)
// Body: { originalUrl?, expiresAt?, isActive? }
// Returns: { url }
// -------------------------------------------------------
router.put("/:id", validateMongoId, validateUpdateUrl, updateUrl);

// -------------------------------------------------------
// DELETE /api/urls/:id
// Permanently delete a URL
// Returns: { deletedId }
// -------------------------------------------------------
router.delete("/:id", validateMongoId, deleteUrl);

export default router;