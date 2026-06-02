// ============================================================
// FILE: backend/src/controllers/analyticsController.js
// PURPOSE: Returns detailed analytics for a user's short URLs
// ============================================================

import Url from "../models/Url.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// -------------------------------------------------------
// GET ANALYTICS FOR ONE URL
// GET /api/analytics/:urlId
// Protected — requires JWT
// Returns: clicks, lastVisited, recent visit history
// -------------------------------------------------------
export const getUrlAnalytics = asyncHandler(async (req, res) => {
  const url = await Url.findOne({
    _id: req.params.urlId,
    createdBy: req.user.id,
  });

  if (!url) {
    return errorResponse(res, 404, "URL not found or no access");
  }

  const visits = url.recentVisits || [];

  // ---------------- DAILY CLICKS ----------------
  const dailyClicksMap = {};
  visits.forEach((visit) => {
    const day = new Date(visit.visitedAt).toISOString().split("T")[0];
    dailyClicksMap[day] = (dailyClicksMap[day] || 0) + 1;
  });

  const dailyClicks = Object.entries(dailyClicksMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, clicks]) => ({ date, clicks }));

  // ---------------- BROWSERS ----------------
  const browserMap = {};
  visits.forEach((visit) => {
    const ua = visit.userAgent || "";
    const browser =
      ua.includes("Chrome") ? "Chrome" :
      ua.includes("Firefox") ? "Firefox" :
      ua.includes("Safari") ? "Safari" :
      ua.includes("Edge") ? "Edge" : "Other";

    browserMap[browser] = (browserMap[browser] || 0) + 1;
  });

  const browsers = Object.entries(browserMap).map(([name, value]) => ({
    name,
    value,
  }));

  // ---------------- DEVICES ----------------
  const deviceMap = {};
  visits.forEach((visit) => {
    const ua = (visit.userAgent || "").toLowerCase();
    const device =
      ua.includes("mobile") ? "Mobile" :
      ua.includes("tablet") ? "Tablet" : "Desktop";

    deviceMap[device] = (deviceMap[device] || 0) + 1;
  });

  const devices = Object.entries(deviceMap).map(([name, value]) => ({
    name,
    value,
  }));

  // ---------------- UNIQUE VISITORS ----------------
  const uniqueIps = new Set(
    visits.map(v => v.ipAddress).filter(ip => ip !== "unknown")
  );

  // ---------------- FINAL RESPONSE ----------------
  const analytics = {
    urlId: url._id,
    shortCode: url.shortCode,
    shortUrl: url.shortUrl,
    originalUrl: url.originalUrl,
    clicks: url.clicks,
    recentVisits: visits,
    dailyClicks,
    browsers,
    devices,
    uniqueVisitors: uniqueIps.size,
  };

  return successResponse(res, 200, "Analytics fetched", { analytics });
});

// -------------------------------------------------------
// GET SUMMARY ANALYTICS FOR ALL USER URLs
// GET /api/analytics/summary
// Protected — requires JWT
// Returns: total URLs, total clicks, top URLs
// -------------------------------------------------------
export const getAnalyticsSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Aggregate stats across all user URLs
  const stats = await Url.aggregate([
    { $match: { createdBy: userId } }, // Only this user's URLs

    {
      $group: {
        _id: null,
        totalUrls: { $sum: 1 },
        totalClicks: { $sum: "$clicks" },
        activeUrls: {
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
        },
        avgClicksPerUrl: { $avg: "$clicks" },
      },
    },
  ]);

  // Get top 5 most-clicked URLs
  const topUrls = await Url.find({ createdBy: userId })
    .sort({ clicks: -1 })
    .limit(5)
    .select("originalUrl shortCode clicks lastVisitedAt createdAt")
    .lean({ virtuals: true });

  // Get 5 most recently created URLs
  const recentUrls = await Url.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("originalUrl shortCode clicks createdAt isActive")
    .lean({ virtuals: true });

  const summary = stats[0] || {
    totalUrls: 0,
    totalClicks: 0,
    activeUrls: 0,
    avgClicksPerUrl: 0,
  };

  return successResponse(res, 200, "Analytics summary fetched successfully", {
    summary: {
      totalUrls: summary.totalUrls,
      totalClicks: summary.totalClicks,
      activeUrls: summary.activeUrls,
      inactiveUrls: summary.totalUrls - summary.activeUrls,
      avgClicksPerUrl: Math.round(summary.avgClicksPerUrl || 0),
    },
    topUrls,
    recentUrls,
  });
});

// -------------------------------------------------------
// HELPER: Mask IP address for privacy (show only first 2 octets)
// "192.168.1.100" → "192.168.*.*"
// -------------------------------------------------------
const maskIp = (ip) => {
  if (!ip || ip === "unknown") return "unknown";
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.*`;
  }
  return ip; // Return as-is for IPv6
};

// -------------------------------------------------------
// HELPER: Parse user agent into readable format
// -------------------------------------------------------
const parseUserAgent = (ua) => {
  if (!ua || ua === "unknown") return "Unknown";

  // Simple detection — could use a library like 'ua-parser-js' for more detail
  if (ua.includes("Chrome")) return "Chrome Browser";
  if (ua.includes("Firefox")) return "Firefox Browser";
  if (ua.includes("Safari")) return "Safari Browser";
  if (ua.includes("Edge")) return "Edge Browser";
  if (ua.includes("Postman")) return "Postman";
  if (ua.includes("curl")) return "cURL";
  return ua.slice(0, 60); // Truncate long strings
};

// -------------------------------------------------------
// HELPER: Calculate visit stats from recent visits array
// -------------------------------------------------------
const getVisitStats = (visits) => {
  if (!visits || visits.length === 0) {
    return { last24h: 0, last7d: 0, last30d: 0 };
  }

  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;

  return {
    last24h: visits.filter(
      (v) => now - new Date(v.visitedAt) < msPerDay
    ).length,
    last7d: visits.filter(
      (v) => now - new Date(v.visitedAt) < 7 * msPerDay
    ).length,
    last30d: visits.filter(
      (v) => now - new Date(v.visitedAt) < 30 * msPerDay
    ).length,
    totalStored: visits.length,
  };
};
