// ============================================
// SalesFlow CRM - Lead Service
// ============================================
// Handles all Lead-related API calls.
//
// Endpoints used:
// POST   /leads              → Create lead
// GET    /leads              → List leads (with filters)
// GET    /leads/search       → Search leads
// GET    /leads/{id}         → Get single lead
// PUT    /leads/{id}         → Update lead
// DELETE /leads/{id}         → Delete lead
// POST   /leads/{id}/convert → Convert lead to opportunity

import api from "./api";

// --- Create a new lead ---
export const createLead = async (leadData) => {
  const response = await api.post("/leads/", leadData);
  return response.data;
};

// --- Get all leads (with optional filters) ---
export const getLeads = async (status = "", source = "") => {
  let url = "/leads/?";
  if (status) url += `status=${status}&`;
  if (source) url += `source=${source}&`;
  const response = await api.get(url);
  return response.data;
};

// --- Search leads by criteria ---
export const searchLeads = async (searchParams) => {
  let url = "/leads/search?";
  if (searchParams.name) url += `name=${searchParams.name}&`;
  if (searchParams.email) url += `email=${searchParams.email}&`;
  if (searchParams.company) url += `company=${searchParams.company}&`;
  if (searchParams.status) url += `status=${searchParams.status}&`;
  const response = await api.get(url);
  return response.data;
};

// --- Get a single lead by ID ---
export const getLeadById = async (leadId) => {
  const response = await api.get(`/leads/${leadId}`);
  return response.data;
};

// --- Update a lead ---
export const updateLead = async (leadId, leadData) => {
  const response = await api.put(`/leads/${leadId}`, leadData);
  return response.data;
};

// --- Delete a lead ---
export const deleteLead = async (leadId) => {
  const response = await api.delete(`/leads/${leadId}`);
  return response.data;
};

// --- Convert a lead to an opportunity ---
export const convertLead = async (leadId, opportunityData) => {
  const { opportunity_name, deal_value, expected_close_date } = opportunityData;
  let url = `/leads/${leadId}/convert?opportunity_name=${encodeURIComponent(opportunity_name)}&deal_value=${deal_value}`;
  if (expected_close_date) url += `&expected_close_date=${expected_close_date}`;
  const response = await api.post(url);
  return response.data;
};
