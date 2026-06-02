// ============================================================
// FILE: backend/src/models/User.js
// PURPOSE: Mongoose schema and model for registered users
// ============================================================

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Display name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Unique email — used for login
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,   // Store all emails in lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    // Hashed password — NEVER store plain text
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Do NOT return password in queries by default
    },

    // Role for future admin features
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Whether the account is active
    isActive: {
      type: Boolean,
      default: true,
    },

    // Last login timestamp for security audit
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
    // Rename __v to versionKey: false to hide it
    versionKey: false,
  }
);

// -------------------------------------------------------
// PRE-SAVE HOOK: Hash password before saving to DB
// This runs whenever a user document is saved
// -------------------------------------------------------
userSchema.pre("save", async function (next) {
  // Only hash if password was modified (avoids re-hashing on other updates)
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    // Generate salt and hash the password
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------
// INSTANCE METHOD: Compare entered password with hashed
// Usage: const isMatch = await user.comparePassword(enteredPassword)
// -------------------------------------------------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// -------------------------------------------------------
// INSTANCE METHOD: Return safe user object (no password)
// Usage: const safe = user.toSafeObject()
// -------------------------------------------------------
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

// Index for fast email lookups
// email index auto-created via unique:true in schema definition

const User = mongoose.model("User", userSchema);

export default User;