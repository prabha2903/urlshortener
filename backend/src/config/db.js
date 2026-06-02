// ============================================================
// FILE: backend/src/config/db.js
// PURPOSE: Connects to MongoDB Atlas using Mongoose
// ============================================================

import mongoose from "mongoose";

/**
 * Connects to MongoDB Atlas.
 * Called once at server startup.
 * Exits the process if connection fails (fail-fast strategy).
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is not defined in environment variables. Check your .env file."
      );
    }

    const conn = await mongoose.connect(mongoURI, {
      // These options are the recommended settings for production
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Listen for connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully.");
    });

  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Exit with failure code — server should not run without DB
    process.exit(1);
  }
};

export default connectDB;