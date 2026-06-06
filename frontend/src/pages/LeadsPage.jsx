// ============================================
// SalesFlow CRM - Leads Page
// ============================================
// Lists all leads with search, filter, and CRUD actions.
//
// INTERVIEW TIP:
// "I implemented search and filter on the frontend by
// calling the search API endpoint. The search API uses
// SQL ILIKE for case-insensitive partial matching,
// so typing 'rah' will find 'Rahul'."

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LeadTable from "../components/LeadTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { getLeads, searchLeads, deleteLead } from "../services/leadService";

const LeadsPage = () => {
  const navigate = useNavigate();

  // Data state
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/Search state
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch leads from API based on search/filter
  const fetchLeads = async () => {
    try {
      setLoading(true);

      // If there's a search query, use search endpoint
      if (searchName.trim()) {
        const data = await searchLeads({
          name: searchName,
          status: statusFilter || undefined,
        });
        setLeads(data);
      } else {
        // Otherwise, use list endpoint with optional status filter
        const data = await getLeads(statusFilter);
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads when page loads or filters change
  useEffect(() => {
    fetchLeads();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search (called on Enter key or button click)
  const handleSearch = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  // Handle lead deletion
  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await deleteLead(leadId);
      // Remove the deleted lead from the local state
      setLeads(leads.filter((l) => l.id !== leadId));
    } catch (error) {
      console.error("Failed to delete lead:", error);
      alert("Failed to delete lead. Please try again.");
    }
  };

  // Handle edit - navigate to lead detail page (which has edit mode)
  const handleEdit = (lead) => {
    navigate(`/leads/${lead.id}`);
  };

  return (
    <div className="space-y-6">
      {/* --- Top Bar: Search + Filter + Create Button --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Search by name..."
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
            <option value="Converted">Converted</option>
          </select>
        </div>

        {/* Create Lead Button */}
        <button
          onClick={() => navigate("/leads/create")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+</span> Create Lead
        </button>
      </div>

      {/* --- Leads Table --- */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">All Leads</h3>
          <span className="text-sm text-gray-400">{leads.length} leads</span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <LeadTable
            leads={leads}
            showActions={true}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
};

export default LeadsPage;
