// ============================================
// SalesFlow CRM - API Configuration (Axios)
// ============================================
// This file creates a reusable Axios instance
// that automatically attaches the JWT token to
// every request.
//
// INTERVIEW TIP:
// "I created a centralized API config so I don't
// have to manually add the token to every request.
// Axios interceptors handle it automatically."

import axios from "axios";

// Base URL of our FastAPI backend
const API_BASE_URL = "http://127.0.0.1:8000";

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
// This runs BEFORE every request is sent
// It automatically adds the JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// This runs AFTER every response is received
// If we get a 401 (Unauthorized), redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear it and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
