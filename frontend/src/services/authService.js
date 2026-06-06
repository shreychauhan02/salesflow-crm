// ============================================
// SalesFlow CRM - Auth Service
// ============================================
// Handles login, register, and user profile API calls.
//
// INTERVIEW TIP:
// "I separated API calls into service files to keep
// components clean. Components only handle UI logic,
// while services handle data fetching."

import api from "./api";

// --- Register a new user ---
// POST /register
// Body: { full_name, email, password }
export const registerUser = async (userData) => {
  const response = await api.post("/register", userData);
  return response.data;
};

// --- Login user and get JWT token ---
// POST /login
// Body: { email, password }
export const loginUser = async (credentials) => {
  const response = await api.post("/login", credentials);
  return response.data; // Returns: { access_token, token_type }
};

// --- Get current user's profile ---
// GET /me (Protected - needs JWT token)
export const getCurrentUser = async () => {
  const response = await api.get("/me");
  return response.data; // Returns: { id, full_name, email, created_at }
};
