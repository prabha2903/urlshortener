// ============================================================
// FILE: backend/src/controllers/urlController.js
// PURPOSE: Handles all URL CRUD operations
//          Create short URL, list URLs, edit, delete
// ============================================================

import Url from "../models/Url.js";
import { generateUniqueShortCode, validateCustomAlias } from "../utils/shortCode.js";
import { validateUrl } from "../utils/urlValidator.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// -------------------------------------------------------
// CREATE SHORT URL
// POST /api/urls
// Protected — requires JWT
// -------------------------------------------------------
export const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customAlias, expiresAt } = req.body;

  // --- Validate the original URL ---
  const urlValidation = validateUrl(originalUrl);
  if (!urlValidation.valid) {
    return errorResponse(res, 400, urlValidation.message);
  }

  let shortCode;

  // --- Handle custom alias or auto-generate ---
  if (customAlias) {
    // Validate alias format
    const aliasValidation = validateCustomAlias(customAlias);
    if (!aliasValidation.valid) {
      return errorResponse(res, 400, aliasValidation.message);
    }

    // Check if alias is already taken
    const existingAlias = await Url.findOne({
      shortCode: customAlias.toLowerCase(),
    });
    if (existingAlias) {
      return errorResponse(
        res,
        409,
        `The alias "${customAlias}" is already taken. Please choose another.`
      );
    }

    shortCode = customAlias.toLowerCase();
  } else {
    // Auto-generate a unique 7-character code
    shortCode = await generateUniqueShortCode(7);
  }

  // --- Validate expiry date if provided ---
  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    if (isNaN(expiryDate.getTime())) {
      return errorResponse(res, 400, "Invalid expiry date format. Use ISO 8601 (e.g., 2024-12-31T23:59:59Z)");
    }
    if (expiryDate <= new Date()) {
      return errorResponse(res, 400, "Expiry date must be in the future");
    }
  }

  // --- Create the URL document ---
  const newUrl = await Url.create({
    originalUrl: originalUrl.trim(),
    shortCode,
    customAlias: customAlias ? customAlias.toLowerCase() : null,
    createdBy: req.user.id,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  });

  return successResponse(res, 201, "Short URL created successfully", {
    url: {
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: newUrl.shortUrl, // Virtual field
      customAlias: newUrl.customAlias,
      expiresAt: newUrl.expiresAt,
      clicks: newUrl.clicks,
      isActive: newUrl.isActive,
      createdAt: newUrl.createdAt,
    },
  });
});

// -------------------------------------------------------
// GET ALL URLS (Dashboard)
// GET /api/urls
// Protected — requires JWT
// Supports: pagination, search, sorting
// -------------------------------------------------------
export const getAllUrls = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build query — only fetch URLs belonging to this user
  const query = { createdBy: req.user.id };

  // Optional search by original URL or short code
  if (search) {
    query.$or = [
      { originalUrl: { $regex: search, $options: "i" } },
      { shortCode: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sortField = ["createdAt", "clicks", "lastVisitedAt"].includes(sortBy)
    ? sortBy
    : "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  // Execute query with pagination
  const [urls, totalCount] = await Promise.all([
    Url.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .select("-recentVisits") // Exclude visit history from list view
      .lean({ virtuals: true }), // lean() for performance, virtuals: true for shortUrl
    Url.countDocuments(query),
  ]);

  return successResponse(res, 200, "URLs fetched successfully", {
    urls,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalUrls: totalCount,
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage: pageNum > 1,
    },
  });
});

// -------------------------------------------------------
// GET SINGLE URL
// GET /api/urls/:id
// Protected — requires JWT
// -------------------------------------------------------
export const getUrlById = asyncHandler(async (req, res) => {
  const url = await Url.findOne({
    _id: req.params.id,
    createdBy: req.user.id, // Ensure user owns this URL
  }).lean({ virtuals: true });

  if (!url) {
    return errorResponse(res, 404, "URL not found or you don't have permission to view it");
  }

  return successResponse(res, 200, "URL fetched successfully", { url });
});

// -------------------------------------------------------
// EDIT/UPDATE URL
// PUT /api/urls/:id
// Protected — requires JWT
// -------------------------------------------------------
export const updateUrl = asyncHandler(async (req, res) => {
  const { originalUrl, expiresAt, isActive } = req.body;

  // Find URL and verify ownership
  const url = await Url.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
  });

  if (!url) {
    return errorResponse(res, 404, "URL not found or you don't have permission to edit it");
  }

  // Validate new URL if provided
  if (originalUrl) {
    const urlValidation = validateUrl(originalUrl);
    if (!urlValidation.valid) {
      return errorResponse(res, 400, urlValidation.message);
    }
    url.originalUrl = originalUrl.trim();
  }

  // Update expiry date if provided
  if (expiresAt !== undefined) {
    if (expiresAt === null) {
      url.expiresAt = null; // Remove expiry
    } else {
      const expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return errorResponse(res, 400, "Invalid expiry date format");
      }
      if (expiryDate <= new Date()) {
        return errorResponse(res, 400, "Expiry date must be in the future");
      }
      url.expiresAt = expiryDate;
    }
  }

  // Toggle active status
  if (typeof isActive === "boolean") {
    url.isActive = isActive;
  }

  await url.save();

  return successResponse(res, 200, "URL updated successfully", {
    url: {
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: url.shortUrl,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      clicks: url.clicks,
    },
  });
});

// -------------------------------------------------------
// DELETE URL
// DELETE /api/urls/:id
// Protected — requires JWT
// -------------------------------------------------------
export const deleteUrl = asyncHandler(async (req, res) => {
  const url = await Url.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user.id, // Only delete if user owns it
  });

  if (!url) {
    return errorResponse(res, 404, "URL not found or you don't have permission to delete it");
  }

  return successResponse(res, 200, "URL deleted successfully", {
    deletedId: req.params.id,
  });
});