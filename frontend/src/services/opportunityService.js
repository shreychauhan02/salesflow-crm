// ============================================
// SalesFlow CRM - Opportunity Service
// ============================================
// Handles all Opportunity-related API calls.
//
// Endpoints used:
// POST   /opportunities              → Create opportunity
// GET    /opportunities              → List opportunities
// GET    /opportunities/{id}         → Get single opportunity
// PUT    /opportunities/{id}         → Update opportunity
// DELETE /opportunities/{id}         → Delete opportunity
// POST   /opportunities/{id}/approval → Approve/Reject deal

import api from "./api";

// --- Create a new opportunity ---
export const createOpportunity = async (oppData) => {
  const response = await api.post("/opportunities/", oppData);
  return response.data;
};

// --- Get all opportunities (with optional filters) ---
export const getOpportunities = async (stage = "", approvalStatus = "") => {
  let url = "/opportunities/?";
  if (stage) url += `stage=${stage}&`;
  if (approvalStatus) url += `approval_status=${approvalStatus}&`;
  const response = await api.get(url);
  return response.data;
};

// --- Get a single opportunity by ID ---
export const getOpportunityById = async (oppId) => {
  const response = await api.get(`/opportunities/${oppId}`);
  return response.data;
};

// --- Update an opportunity ---
export const updateOpportunity = async (oppId, oppData) => {
  const response = await api.put(`/opportunities/${oppId}`, oppData);
  return response.data;
};

// --- Delete an opportunity ---
export const deleteOpportunity = async (oppId) => {
  const response = await api.delete(`/opportunities/${oppId}`);
  return response.data;
};

// --- Approve or Reject an opportunity ---
export const processApproval = async (oppId, action, reason = "") => {
  const response = await api.post(`/opportunities/${oppId}/approval`, {
    action: action,
    reason: reason,
  });
  return response.data;
};
