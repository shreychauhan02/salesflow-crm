// ============================================
// SalesFlow CRM - Opportunities Page
// ============================================
// Lists all opportunities with stage/approval badges
// and approve/reject actions for pending deals.
//
// INTERVIEW TIP:
// "The approval workflow is straightforward:
// 1. When an opportunity's deal_value > ₹1L, it's auto-set to 'Pending'
// 2. A manager can click Approve/Reject on this page
// 3. The frontend calls POST /opportunities/{id}/approval
// 4. The backend validates and updates the status"

import { useState, useEffect } from "react";
import OpportunityTable from "../components/OpportunityTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { getOpportunities, deleteOpportunity, processApproval } from "../services/opportunityService";

const OpportunitiesPage = () => {
  // Data state
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [stageFilter, setStageFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");

  // Fetch opportunities from API
  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const data = await getOpportunities(stageFilter, approvalFilter);
      setOpportunities(data);
    } catch (error) {
      console.error("Failed to fetch opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch opportunities on load and when filters change
  useEffect(() => {
    fetchOpportunities();
  }, [stageFilter, approvalFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle delete
  const handleDelete = async (oppId) => {
    if (!window.confirm("Are you sure you want to delete this opportunity?")) return;

    try {
      await deleteOpportunity(oppId);
      setOpportunities(opportunities.filter((o) => o.id !== oppId));
    } catch (error) {
      console.error("Failed to delete opportunity:", error);
      alert("Failed to delete opportunity.");
    }
  };

  // Handle approve/reject
  const handleApproval = async (oppId, action) => {
    const actionText = action === "Approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${actionText} this deal?`)) return;

    try {
      await processApproval(oppId, action);
      // Refresh the list to show updated status
      fetchOpportunities();
    } catch (error) {
      console.error("Failed to process approval:", error);
      alert("Failed to process approval.");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Filters --- */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Stages</option>
          <option value="Prospecting">Prospecting</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        {/* Approval Filter */}
        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
        >
          <option value="">All Approval Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* --- Opportunities Table --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Opportunities</h3>
          <span className="text-sm text-gray-400">{opportunities.length} deals</span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <OpportunityTable
            opportunities={opportunities}
            onDelete={handleDelete}
            onApprove={handleApproval}
          />
        )}
      </div>
    </div>
  );
};

export default OpportunitiesPage;
