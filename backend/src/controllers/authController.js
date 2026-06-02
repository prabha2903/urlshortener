// ============================================================
// FILE: backend/src/controllers/authController.js
// PURPOSE: Handles user registration and login
// ============================================================

import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// -------------------------------------------------------
// SIGNUP
// POST /api/auth/signup
// Public route — no token required
// -------------------------------------------------------
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user with this email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    return errorResponse(res, 409, "An account with this email already exists");
  }

  // Create new user — password is hashed by the pre-save hook in User model
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // Raw password — will be auto-hashed
  });

  // Generate JWT token for immediate login after signup
  const token = generateToken(user._id);

  return successResponse(res, 201, "Account created successfully", {
    token,
    user: user.toSafeObject(), // Never return password
  });
});

// -------------------------------------------------------
// LOGIN
// POST /api/auth/login
// Public route — no token required
// -------------------------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly SELECT the password field
  // (password has select: false in schema, so we must request it)
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  // Check if user exists
  if (!user) {
    // Use generic message to prevent email enumeration attacks
    return errorResponse(res, 401, "Invalid email or password");
  }

  // Check if account is active
  if (!user.isActive) {
    return errorResponse(res, 403, "Your account has been deactivated. Contact support.");
  }

  // Compare entered password against stored hash
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return errorResponse(res, 401, "Invalid email or password");
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = generateToken(user._id);

  return successResponse(res, 200, "Login successful", {
    token,
    user: user.toSafeObject(),
  });
});

// -------------------------------------------------------
// GET MY PROFILE
// GET /api/auth/me
// Protected route — requires JWT token
// -------------------------------------------------------
export const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the auth middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return errorResponse(res, 404, "User not found");
  }

  return successResponse(res, 200, "Profile fetched successfully", {
    user: user.toSafeObject(),
  });
});

// -------------------------------------------------------
// UPDATE PROFILE
// PUT /api/auth/me
// Protected route — requires JWT token
// -------------------------------------------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Only allow updating name for now
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: name.trim() },
    { new: true, runValidators: true } // Return updated doc, run schema validators
  );

  if (!updatedUser) {
    return errorResponse(res, 404, "User not found");
  }

  return successResponse(res, 200, "Profile updated successfully", {
    user: updatedUser.toSafeObject(),
  });
});