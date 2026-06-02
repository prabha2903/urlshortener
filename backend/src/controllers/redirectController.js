// ============================================================
// FILE: backend/src/controllers/redirectController.js
// PURPOSE: Handles redirects from short URL → original URL
//          Tracks clicks, IP, user agent, referrer
// ============================================================

import Url from "../models/Url.js";
import asyncHandler from "../utils/asyncHandler.js";

// -------------------------------------------------------
// REDIRECT SHORT URL
// GET /:shortCode
// Public route — no authentication required
// -------------------------------------------------------
export const redirectUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  // Find URL by short code — include all fields
  const url = await Url.findOne({ shortCode: shortCode.trim() });

  // --- URL not found ---
  if (!url) {
    return res.status(404).json({
      success: false,
      message: `Short URL "/${shortCode}" not found`,
    });
  }

  // --- URL is deactivated by user ---
  if (!url.isActive) {
    return res.status(410).json({
      success: false,
      message: "This link has been deactivated by its owner",
    });
  }

  // --- URL has expired ---
  if (url.isExpired()) {
    return res.status(410).json({
      success: false,
      message: "This link has expired",
      expiredAt: url.expiresAt,
    });
  }

  // --- Extract visitor info for analytics ---
  const visitData = {
    // Get real IP (handles proxies and load balancers)
    ipAddress:
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "unknown",

    // User-Agent (browser/device info)
    userAgent: req.headers["user-agent"] || "unknown",

    // Referrer (where they came from)
    referrer: req.headers["referer"] || req.headers["referrer"] || "direct",
  };

  // Record the visit (increments clicks, stores analytics)
  // We do this asynchronously — don't block the redirect
  url.recordVisit(visitData).catch((err) => {
    // Log but don't fail the redirect if analytics write fails
    console.error("Analytics write failed:", err.message);
  });

  // --- 301 = Permanent redirect (cached by browsers) ---
  // --- 302 = Temporary redirect (not cached, better for analytics) ---
  // We use 302 so every visit is tracked
  return res.redirect(302, url.originalUrl);
});

// -------------------------------------------------------
// PREVIEW SHORT URL (No redirect, no click tracking)
// GET /api/preview/:shortCode
// Public route — returns URL info without redirecting
// -------------------------------------------------------
export const previewUrl = asyncHandler(async (req, res) => {
  const { shortCode } = req.params;

  const url = await Url.findOne({ shortCode: shortCode.trim() }).select(
    "originalUrl shortCode customAlias expiresAt isActive clicks createdAt"
  );

  if (!url) {
    return res.status(404).json({
      success: false,
      message: `Short URL "/${shortCode}" not found`,
    });
  }

  return res.status(200).json({
    success: true,
    message: "URL preview",
    data: {
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: url.shortUrl,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      clicks: url.clicks,
      isExpired: url.isExpired(),
      createdAt: url.createdAt,
    },
  });
});