// ============================================================
// FILE: backend/src/server.js
// PURPOSE: Main Express server — entry point of the application
//          Sets up middleware, routes, error handling, DB connection
// ============================================================

import "dotenv/config"; // Load .env variables FIRST before any other imports
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import urlRoutes from "./routes/urlRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import redirectRoutes from "./routes/redirectRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { generalLimiter } from "./middleware/rateLimitMiddleware.js";

// -------------------------------------------------------
// CREATE EXPRESS APP
// -------------------------------------------------------
const app = express();
const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "URL Shortener API is running 🚀"
  });
});
// -------------------------------------------------------
// SECURITY MIDDLEWARE
// -------------------------------------------------------

// Helmet: Sets secure HTTP headers (XSS, clickjacking protection, etc.)
app.use(helmet());

// CORS: Controls which origins can access the API
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:3000",   // React dev server
        "http://localhost:5173",   // Vite dev server
        "http://localhost:4200",   // Angular dev server
        process.env.FRONTEND_URL,  // Production frontend URL
      ].filter(Boolean); // Remove undefined values

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV === "development") {
        // In development, allow all origins for easier testing
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,            // Allow cookies if needed
  })
);

// -------------------------------------------------------
// GENERAL MIDDLEWARE
// -------------------------------------------------------

// Parse JSON request bodies (max 10kb to prevent payload attacks)
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies (form data)
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// HTTP request logger (colorful in dev, combined format in production)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Apply general rate limiter to all /api/* routes
app.use("/api", generalLimiter);

// -------------------------------------------------------
// HEALTH CHECK ROUTE
// GET /health
// Used by deployment platforms (Render, Railway) to verify app is running
// -------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URL Shortener API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// -------------------------------------------------------
// API ROUTES
// -------------------------------------------------------
app.use("/api/auth", authRoutes);         // Authentication: signup, login
app.use("/api/urls", urlRoutes);          // URL CRUD: create, list, edit, delete
app.use("/api/analytics", analyticsRoutes); // Analytics: clicks, visits

// -------------------------------------------------------
// SHORT URL REDIRECT ROUTES (Public, no /api prefix)
// These must come AFTER /api routes to avoid conflicts
// GET /:shortCode → redirects to original URL
// GET /api/preview/:shortCode → preview without redirect
// -------------------------------------------------------
app.use("/", redirectRoutes);

// -------------------------------------------------------
// 404 HANDLER — for any route not matched above
// -------------------------------------------------------
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route "${req.method} ${req.originalUrl}" not found`,
    hint: "Check the API documentation for available endpoints",
  });
});

// -------------------------------------------------------
// GLOBAL ERROR HANDLER (must be last)
// Catches all errors forwarded via next(err)
// -------------------------------------------------------
app.use(errorMiddleware);

// -------------------------------------------------------
// START SERVER
// -------------------------------------------------------
const startServer = async () => {
  try {
    // Connect to MongoDB first — don't start server if DB fails
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log("\n🚀 ================================================");
      console.log(`   URL Shortener API is running!`);
      console.log(`   Mode:        ${process.env.NODE_ENV || "development"}`);
      console.log(`   Port:        ${PORT}`);
      console.log(`   Health:      http://localhost:${PORT}/health`);
      console.log(`   API Base:    http://localhost:${PORT}/api`);
      console.log("   ================================================\n");
    });

    // -------------------------------------------------------
    // GRACEFUL SHUTDOWN
    // Handles CTRL+C and process termination signals
    // Closes DB connection and HTTP server cleanly
    // -------------------------------------------------------
    const gracefulShutdown = (signal) => {
      console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log("🔌 HTTP server closed.");
        try {
          const mongoose = await import("mongoose");
          await mongoose.default.connection.close();
          console.log("🔌 MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM")); // Kill signal
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));   // Ctrl+C

    // Handle unhandled promise rejections (safety net)
    process.on("unhandledRejection", (reason, promise) => {
      console.error("🔴 Unhandled Promise Rejection:", reason);
      gracefulShutdown("unhandledRejection");
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;