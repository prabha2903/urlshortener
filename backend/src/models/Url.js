// ============================================================
// FILE: backend/src/models/Url.js
// PURPOSE: Mongoose schema and model for shortened URLs
//          Includes built-in analytics (clicks, visits)
// ============================================================

import mongoose from "mongoose";

// -------------------------------------------------------
// Sub-schema: Individual visit record for analytics
// -------------------------------------------------------
const visitSchema = new mongoose.Schema(
  {
    // When this visit happened
    visitedAt: {
      type: Date,
      default: Date.now,
    },

    // IP address of visitor (for analytics)
    ipAddress: {
      type: String,
      default: "unknown",
    },

    // User-Agent string (browser/device info)
    userAgent: {
      type: String,
      default: "unknown",
    },

    // Referrer URL if available
    referrer: {
      type: String,
      default: "direct",
    },
  },
  { _id: false } // No separate _id for each visit sub-doc
);

// -------------------------------------------------------
// Main URL schema
// -------------------------------------------------------
const urlSchema = new mongoose.Schema(
  {
    // The original long URL
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
      trim: true,
    },

    // The short code (e.g., "abc123") — unique identifier
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, "Short code must be at least 3 characters"],
      maxlength: [20, "Short code cannot exceed 20 characters"],
    },

    // Optional custom alias provided by user
    customAlias: {
      type: String,
      default: null,
      trim: true,
    },

    // Reference to the user who created this short URL
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Optional expiry date — null means never expires
    expiresAt: {
      type: Date,
      default: null,
    },

    // Whether this URL is still active
    isActive: {
      type: Boolean,
      default: true,
    },

    // --- ANALYTICS ---

    // Total click count (incremented on each redirect)
    clicks: {
      type: Number,
      default: 0,
    },

    // Timestamp of last visit
    lastVisitedAt: {
      type: Date,
      default: null,
    },

    // Array of recent visit records (capped at 100 for performance)
    recentVisits: {
      type: [visitSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// -------------------------------------------------------
// VIRTUAL: Full short URL (not stored in DB)
// Usage: url.shortUrl  →  "http://localhost:5000/abc123"
// -------------------------------------------------------
urlSchema.virtual("shortUrl").get(function () {
  const base = process.env.BASE_URL || "http://localhost:5000";
  return `${base}/${this.shortCode}`;
});

// Make virtuals appear in JSON output
urlSchema.set("toJSON", { virtuals: true });
urlSchema.set("toObject", { virtuals: true });

// -------------------------------------------------------
// INSTANCE METHOD: Check if this URL has expired
// Usage: const expired = url.isExpired()
// -------------------------------------------------------
urlSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > new Date(this.expiresAt);
};

// -------------------------------------------------------
// INSTANCE METHOD: Record a new visit
// Increments click count, updates lastVisitedAt,
// and prepends new visit to recentVisits (max 100)
// -------------------------------------------------------
urlSchema.methods.recordVisit = async function (visitData = {}) {
  this.clicks += 1;
  this.lastVisitedAt = new Date();

  // Add new visit to beginning of array
  this.recentVisits.unshift({
    visitedAt: new Date(),
    ipAddress: visitData.ipAddress || "unknown",
    userAgent: visitData.userAgent || "unknown",
    referrer: visitData.referrer || "direct",
  });

  // Keep only the last 100 visits to avoid document bloat
  if (this.recentVisits.length > 100) {
    this.recentVisits = this.recentVisits.slice(0, 100);
  }

  await this.save();
};

// -------------------------------------------------------
// INDEXES for performance
// -------------------------------------------------------
// shortCode index auto-created via unique:true in schema definition
urlSchema.index({ createdBy: 1 });           // Fast dashboard queries
urlSchema.index({ expiresAt: 1 });           // Fast expiry checks
urlSchema.index({ createdBy: 1, isActive: 1 }); // Dashboard active URLs

const Url = mongoose.model("Url", urlSchema);

export default Url;